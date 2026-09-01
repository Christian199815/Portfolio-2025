import gsap from 'gsap';

let initialized = false;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

export function initEasterEggs() {
  if (initialized || prefersReducedMotion()) return;
  initialized = true;

  document.addEventListener('keydown', (e) => {
    if (e.key === KONAMI[konamiIndex]) {
      konamiIndex += 1;
      if (konamiIndex === KONAMI.length) {
        konamiIndex = 0;
        document.documentElement.classList.add('konami-active');
        setTimeout(() => document.documentElement.classList.remove('konami-active'), 10000);
      }
    } else {
      konamiIndex = 0;
    }
  });
}
