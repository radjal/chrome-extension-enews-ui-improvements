const targetIds = [
  '_ctl0_ContentPlaceHolder_Main_Txt_VIn',
  '_ctl0_ContentPlaceHolder_Main_Txt_Reg',
  '_ctl0_ContentPlaceHolder_Main_txtClaim'
];

function injectButtons() {
  targetIds.forEach(id => {
    const input = document.getElementById(id);
    if (input && !input.parentElement.querySelector('.paste-submit-btn')) {
      const btn = document.createElement('button');
      btn.textContent = '📋 Paste & Go';
      btn.type = 'button';
      btn.className = 'paste-submit-btn';
      btn.style.marginLeft = '5px';
      btn.style.cursor = 'pointer';

      btn.addEventListener('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          input.value = text;
          
          // Trigger events in case there are listeners
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));

          // Find the form's submit button and click it
          const form = input.closest('form');
          const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
          
          if (submitBtn) {
            submitBtn.click();
          } else {
            form.submit();
          }
        } catch (err) {
          console.error('Failed to read clipboard: ', err);
          alert('Please allow clipboard permissions to use this feature.');
        }
      });

      input.after(btn);
    }
  });
}

// Run on load and periodically in case of dynamic updates
injectButtons();
const observer = new MutationObserver(injectButtons);
observer.observe(document.body, { childList: true, subtree: true });