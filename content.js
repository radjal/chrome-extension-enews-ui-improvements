(function() {
  // Check if the script is running inside an iframe
  /*if (window.self === window.top) {
    console.log('top level window');
    return; // Exit if it's the main top-level document
  }
    */

  console.log('Not a top level window');

  const targetIds = [
    'Txt_VIn',
    'Txt_Reg',
    'txtClaim'
  ];

  function injectButtons() {
    targetIds.forEach(id => {
      const input = document.querySelector(`input[id$="${id}" i]`);
      
      if (input && input.parentElement && !input.parentElement.querySelector('.paste-submit-btn')) {
        const btn = document.createElement('button');
        btn.textContent = '📋 Paste & Go';
        btn.type = 'button';
        btn.className = 'paste-submit-btn';
        
        Object.assign(btn.style, {
          marginLeft: '5px',
          cursor: 'pointer',
          padding: '2px 5px',
          fontSize: '12px'
        });

        btn.addEventListener('click', async () => {
          try {
            const text = await navigator.clipboard.readText();
            input.value = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

            const form = input.closest('form');
            if (form) {
              const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
              submitBtn ? submitBtn.click() : form.submit();
            }
          } catch (err) {
            console.error('Clipboard access denied:', err);
          }
        });

        input.after(btn);
      }
    });
  }

  const initialize = () => {
    injectButtons();
    const observer = new MutationObserver(injectButtons);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
 
})();