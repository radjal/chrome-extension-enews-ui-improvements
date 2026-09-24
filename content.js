(function() {
  const targetInput = document.querySelector('input#_ctl0_ContentPlaceHolder_Main_Txt_VIn');
  
  if (targetInput && !document.querySelector('#ext-paste-submit-btn')) {
    // 1. Create the button
    const btn = document.createElement('button');
    btn.id = 'ext-paste-submit-btn';
    btn.innerText = '📋 Paste & Go';
    btn.type = 'button'; // Prevent default form submission on click
    
    // 2. Style the button to match the context
    Object.assign(btn.style, {
      marginLeft: '5px',
      padding: '3px 8px',
      cursor: 'pointer',
      verticalAlign: 'middle',
      fontSize: '12px'
    });

    // 3. Logic: Read clipboard, set value, and submit
    btn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        targetInput.value = text;
        
        // Find the closest form and submit it
        const form = targetInput.closest('form');
        if (form) {
          form.submit();
        } else {
          console.error('Form not found for submission.');
        }
      } catch (err) {
        console.error('Failed to read clipboard: ', err);
        alert('Please allow clipboard permissions to use this feature.');
      }
    });

    // 4. Inject next to the field
    targetInput.parentNode.insertBefore(btn, targetInput.nextSibling);
  }
})();