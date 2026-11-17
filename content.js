/**
 * Utility: Manages body classes for custom actions
 */
function updateBodyState(actionClass) {
    const prefix = 'custom-';
    const classesToRemove = Array.from(document.body.classList)
        .filter(className => className.startsWith(prefix));
    
    if (classesToRemove.length > 0) {
        document.body.classList.remove(...classesToRemove);
    }
    document.body.classList.add(actionClass);
}

/**
 * Reusable Modal Logic
 * Creates a centered overlay with an iframe
 */
function openFileModal(fileName, title) {
    if (document.getElementById('custom-modal-overlay')) return;

    // 1. Dark Backdrop Overlay
    const overlay = document.createElement('div');
    overlay.id = 'custom-modal-overlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: '10000',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    });

    // 2. Modal Container
    const modal = document.createElement('div');
    Object.assign(modal.style, {
        backgroundColor: 'white', width: '90%', height: '90%',
        borderRadius: '8px', overflow: 'hidden', display: 'flex', 
        flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    });

    // 3. Modal Header
    const header = document.createElement('div');
    header.className = 'slds-p-around_small';
    Object.assign(header.style, {
        background: '#f3f3f3', borderBottom: '1px solid #ddd',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    });
    header.innerHTML = `<h2 style="font-weight:bold; font-size: 1.1rem; color: #333;">${title}</h2>`;

    const closeBtn = document.createElement('button');
    closeBtn.innerText = '✕ Close';
    closeBtn.className = 'slds-button slds-button_neutral';
    closeBtn.onclick = () => overlay.remove();

    // 4. iframe to load the content
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL(fileName);
    Object.assign(iframe.style, { flex: '1', border: 'none', width: '100%' });

    // Assemble components
    header.appendChild(closeBtn);
    modal.appendChild(header);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on overlay click (outside modal)
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}

/**
 * Main Injection Logic
 */
function injectCustomUI() {
    const headerItem = document.querySelector('.slds-global-header__item:last-child') || 
                       document.querySelector('.slds-global-header__item');
    
    if (!headerItem || document.getElementById('ext-ui-container')) return;

    const container = document.createElement('div');
    container.id = 'ext-ui-container';
    container.style.display = 'flex';
    container.style.alignItems = 'center';

    // 1. Create Dropdown
    const dropContainer = document.createElement('div');
    dropContainer.className = 'slds-dropdown-trigger slds-dropdown-trigger_click';

    const dropBtn = document.createElement('button');
    dropBtn.className = 'slds-button slds-button_neutral';
    dropBtn.innerHTML = 'Actions ▾';
    dropBtn.onclick = (e) => {
        e.stopPropagation();
        dropContainer.classList.toggle('slds-is-open');
    };

    const dropdown = document.createElement('div');
    dropdown.className = 'slds-dropdown slds-dropdown_right';
    const ul = document.createElement('ul');
    ul.className = 'slds-dropdown__list';
    ul.role = 'menu';

    const addMenuItem = (label, actionClass) => {
        const li = document.createElement('li');
        li.className = 'slds-dropdown__item';
        const a = document.createElement('a');
        a.href = '#';
        a.innerHTML = `<span class="slds-truncate">${label}</span>`;
        a.onclick = (e) => {
            e.preventDefault();
            updateBodyState(actionClass);
            dropContainer.classList.remove('slds-is-open');
        };
        li.appendChild(a);
        ul.appendChild(li);
    };

    addMenuItem('Action 1', 'custom-1');
    addMenuItem('Action 2', 'custom-2');
    dropdown.appendChild(ul);
    dropContainer.append(dropBtn, dropdown);

    // 2. Help Button (Modal)
    const helpBtn = document.createElement('button');
    helpBtn.className = 'slds-button slds-button_neutral';
    helpBtn.style.marginLeft = '8px';
    helpBtn.innerText = 'Help';
    helpBtn.onclick = () => openFileModal("kb.html", "Knowledge Base");

    // 3. Templates Button (Modal)
    const tempBtn = document.createElement('button');
    tempBtn.className = 'slds-button slds-button_neutral';
    tempBtn.style.marginLeft = '8px';
    tempBtn.innerText = 'Templates';
    tempBtn.onclick = () => openFileModal("templates.html", "Templates");

    container.append(dropContainer, helpBtn, tempBtn);
    headerItem.appendChild(container);

    // Close dropdown on outside click
    document.addEventListener('click', () => dropContainer.classList.remove('slds-is-open'));
}

/**
 * Initialization with MutationObserver for Salesforce SPA
 */
function init() {
    injectCustomUI();
    const observer = new MutationObserver(() => {
        if (!document.getElementById('ext-ui-container')) {
            injectCustomUI();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Start
if (document.readyState === 'loading') {
    window.addEventListener('load', init);
} else {
    init();
}