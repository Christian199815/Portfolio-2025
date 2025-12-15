import './index.css';

import '../server/views/work/work.js';
import '../server/views/bento.js';
import '../server/components/discipline-links/discipline-links.js';
import '../server/components/contact-button/contact-button.js';
import '../server/components/theme-toggle/theme-toggle.js';
import '../server/components/settings-menu/settings-menu.js';
import '../server/views/about/about.js';
import '../server/views/contact/contact.js';
import '../server/views/index.js';
import '../server/components/push-text/push-text.js';

import '../server/views/project/project.js';

import '../server/image-pop.js';

console.log('Hello, world!');

// Center focused elements on screen when using keyboard navigation
let isKeyboardNavigation = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    isKeyboardNavigation = true;
  }
});

document.addEventListener('mousedown', () => {
  isKeyboardNavigation = false;
});

document.addEventListener('focusin', (e) => {
  if (isKeyboardNavigation && e.target) {
    e.target.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
});




