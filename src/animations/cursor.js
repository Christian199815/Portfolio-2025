import gsap from 'gsap';
import { canUseCustomCursor } from './device';

let initialized = false;
let cursorEl = null;
let followerEl = null;
let moveHandler = null;
let overHandler = null;
let outHandler = null;

function bindHoverTargets() {
  if (overHandler) return;

  overHandler = (e) => {
    const interactive = e.target.closest('a, button, [data-cursor-hover], .project-card');
    if (interactive) {
      cursorEl?.classList.add('is-hover');
      followerEl?.classList.add('is-hover');
    }
  };

  outHandler = (e) => {
    const interactive = e.target.closest('a, button, [data-cursor-hover], .project-card');
    if (interactive) {
      cursorEl?.classList.remove('is-hover');
      followerEl?.classList.remove('is-hover');
    }
  };

  document.addEventListener('mouseover', overHandler);
  document.addEventListener('mouseout', outHandler);
}

function unbindHoverTargets() {
  if (overHandler) {
    document.removeEventListener('mouseover', overHandler);
    overHandler = null;
  }
  if (outHandler) {
    document.removeEventListener('mouseout', outHandler);
    outHandler = null;
  }
}

function mountCursor() {
  if (initialized) return;

  cursorEl = document.createElement('div');
  cursorEl.className = 'custom-cursor';
  cursorEl.setAttribute('aria-hidden', 'true');

  followerEl = document.createElement('div');
  followerEl.className = 'custom-cursor-follower';
  followerEl.setAttribute('aria-hidden', 'true');

  document.body.appendChild(cursorEl);
  document.body.appendChild(followerEl);
  document.body.classList.add('has-custom-cursor');

  moveHandler = (e) => {
    gsap.to(cursorEl, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'power2.out' });
    gsap.to(followerEl, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
  };

  document.addEventListener('mousemove', moveHandler);
  bindHoverTargets();
  initialized = true;
}

function destroyCustomCursor() {
  if (!initialized) return;

  if (moveHandler) {
    document.removeEventListener('mousemove', moveHandler);
    moveHandler = null;
  }

  unbindHoverTargets();

  cursorEl?.remove();
  followerEl?.remove();
  document.body.classList.remove('has-custom-cursor');

  cursorEl = null;
  followerEl = null;
  initialized = false;
}

export function initCustomCursor() {
  const cursorMq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)');
  const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  const apply = () => {
    if (canUseCustomCursor()) mountCursor();
    else destroyCustomCursor();
  };

  apply();
  cursorMq.addEventListener('change', apply);
  motionMq.addEventListener('change', apply);

  return () => {
    cursorMq.removeEventListener('change', apply);
    motionMq.removeEventListener('change', apply);
    destroyCustomCursor();
  };
}

export function refreshCursorTargets() {
  if (!initialized) return;
  bindHoverTargets();
}
