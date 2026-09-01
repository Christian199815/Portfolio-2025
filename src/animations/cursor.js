import gsap from 'gsap';

let initialized = false;
let cursorEl = null;
let followerEl = null;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function bindHoverTargets() {
  if (document.body.dataset.cursorBound) return;
  document.body.dataset.cursorBound = 'true';

  document.addEventListener('mouseover', (e) => {
    const interactive = e.target.closest('a, button, [data-cursor-hover], .project-card');
    if (interactive) {
      cursorEl?.classList.add('is-hover');
      followerEl?.classList.add('is-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const interactive = e.target.closest('a, button, [data-cursor-hover], .project-card');
    if (interactive) {
      cursorEl?.classList.remove('is-hover');
      followerEl?.classList.remove('is-hover');
    }
  });
}

export function initCustomCursor() {
  if (initialized) return;
  if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;

  cursorEl = document.createElement('div');
  cursorEl.className = 'custom-cursor';
  cursorEl.setAttribute('aria-hidden', 'true');

  followerEl = document.createElement('div');
  followerEl.className = 'custom-cursor-follower';
  followerEl.setAttribute('aria-hidden', 'true');

  document.body.appendChild(cursorEl);
  document.body.appendChild(followerEl);
  document.body.classList.add('has-custom-cursor');

  document.addEventListener('mousemove', (e) => {
    gsap.to(cursorEl, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'power2.out' });
    gsap.to(followerEl, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
  });

  bindHoverTargets();
  initialized = true;
}

export function refreshCursorTargets() {
  if (!initialized) return;
  bindHoverTargets();
}
