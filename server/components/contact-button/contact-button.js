function setupContactButtons() {
    const buttons = document.getElementsByTagName('button'); // Note the 'Elements'
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].hasAttribute('data-contact-button')) {
        buttons[i].addEventListener('click', () => {
          window.location = '/contact';
        });
      }
    }
  }
  
  setupContactButtons();