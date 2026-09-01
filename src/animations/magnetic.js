import gsap from 'gsap';

const STRENGTH = 0.35;

export function initMagnetic(scope) {
  const targets = scope?.querySelectorAll('[data-magnetic]');
  if (!targets?.length) return () => {};
  if (window.matchMedia('(pointer: coarse)').matches) return () => {};

  const teardowns = [];

  targets.forEach((el) => {
    const moveX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      moveX((event.clientX - (rect.left + rect.width / 2)) * STRENGTH);
      moveY((event.clientY - (rect.top + rect.height / 2)) * STRENGTH);
    };

    const onLeave = () => {
      moveX(0);
      moveY(0);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    teardowns.push(() => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      gsap.set(el, { x: 0, y: 0 });
    });
  });

  return () => teardowns.forEach((fn) => fn());
}
