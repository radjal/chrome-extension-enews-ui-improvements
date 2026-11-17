document.addEventListener('DOMContentLoaded', () => {
    // 1. Element Selectors
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');
    const matchCounter = document.getElementById('matchCounter');
    const templatesContainer = document.getElementById('templatesContainer');
    const sections = Array.from(document.querySelectorAll('details.category-section'));
    const cards = Array.from(document.querySelectorAll('.template-card'));

    // 2. Initial Setup: Cache original text for search/highlighting
    cards.forEach(card => {
        const titleEl = card.querySelector('.template-title');
        const preEl = card.querySelector('.template-text');
        const noteEl = card.querySelector('.template-note');
        
        if (titleEl) titleEl.dataset.original = titleEl.textContent;
        if (preEl) preEl.dataset.original = preEl.textContent;
        if (noteEl) noteEl.dataset.original = noteEl.textContent;
    });

    // 3. Reusable Copy Logic (Modern + Fallback)
    async function performCopyAction(text, button) {
        // Method A: Modern API
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                showCopiedFeedback(button);
                return;
            } catch (err) {
                console.warn('Modern Clipboard API failed, trying fallback...');
            }
        }

        // Method B: Hidden Textarea Fallback (Crucial for Extensions)
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) showCopiedFeedback(button);
        } catch (err) {
            alert('Copy failed. Please select text manually.');
        }
        document.body.removeChild(textarea);
    }

    function showCopiedFeedback(btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        btn.style.backgroundColor = '#1e7e34'; // Success green

        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
            btn.style.backgroundColor = '';
        }, 1500);
    }

    // 4. Search & Highlighting Logic
    function highlightElementText(el, regex) {
        const original = el.dataset.original;
        el.textContent = '';
        if (!regex) {
            el.textContent = original;
            return 0;
        }

        let matchCount = 0;
        let lastIndex = 0;
        const frag = document.createDocumentFragment();
        let match;

        while ((match = regex.exec(original)) !== null) {
            if (match[0].length === 0) { regex.lastIndex++; continue; }
            
            if (match.index > lastIndex) {
                frag.appendChild(document.createTextNode(original.slice(lastIndex, match.index)));
            }
            const mark = document.createElement('mark');
            mark.textContent = match[0];
            frag.appendChild(mark);
            lastIndex = regex.lastIndex;
            matchCount++;
        }

        if (lastIndex < original.length) {
            frag.appendChild(document.createTextNode(original.slice(lastIndex)));
        }
        el.appendChild(frag);
        return matchCount;
    }

    function performSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            cards.forEach(card => {
                card.classList.remove('hidden');
                highlightElementText(card.querySelector('.template-title'), null);
                highlightElementText(card.querySelector('.template-text'), null);
                const note = card.querySelector('.template-note');
                if (note) highlightElementText(note, null);
            });
            sections.forEach(sec => {
                sec.classList.remove('hidden');
                sec.open = (sec.id === 'sec-investigation'); // Default state
            });
            matchCounter.textContent = `Showing all ${cards.length} templates`;
            return;
        }

        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        let visibleCards = 0;
        let totalMatches = 0;

        sections.forEach(sec => {
            let secVisible = 0;
            const secCards = sec.querySelectorAll('.template-card');

            secCards.forEach(card => {
                const title = card.querySelector('.template-title');
                const pre = card.querySelector('.template-text');
                const note = card.querySelector('.template-note');

                const matches = highlightElementText(title, regex) + 
                                highlightElementText(pre, regex) + 
                                (note ? highlightElementText(note, regex) : 0);

                if (matches > 0) {
                    card.classList.remove('hidden');
                    secVisible++;
                    visibleCards++;
                    totalMatches += matches;
                } else {
                    card.classList.add('hidden');
                }
            });

            sec.classList.toggle('hidden', secVisible === 0);
            if (secVisible > 0) sec.open = true;
        });

        matchCounter.textContent = `${visibleCards} templates found (${totalMatches} matches)`;
    }

    // 5. Event Listeners
    // Use delegation for Copy buttons
    if (templatesContainer) {
        templatesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                const card = e.target.closest('.template-card');
                const text = card.querySelector('.template-text').dataset.original;
                performCopyAction(text, e.target);
            }
        });
    }

    searchInput.addEventListener('input', performSearch);

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        performSearch();
        searchInput.focus();
    });

    expandAllBtn.addEventListener('click', () => {
        sections.forEach(sec => { if (!sec.classList.contains('hidden')) sec.open = true; });
    });

    collapseAllBtn.addEventListener('click', () => {
        sections.forEach(sec => sec.open = false);
    });

    // Anchor navigation for <details>
    document.querySelectorAll('.nav-bar a').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl && targetEl.tagName === 'DETAILS') targetEl.open = true;
        });
    });
});
