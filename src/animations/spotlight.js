const FALLOFF = 140;

export function initSpotlights(scope) {
  const root = scope ?? document;
  const zones = Array.from(root.querySelectorAll('[data-spotlight]'));
  if (!zones.length) return () => {};
  if (window.matchMedia('(pointer: coarse)').matches) return () => {};

  let pointerX = -9999;
  let pointerY = -9999;
  let frame = null;

  const update = () => {
    frame = null;
    let anyLit = false;

    zones.forEach((zone) => {
      const rect = zone.getBoundingClientRect();
      if (rect.bottom < -FALLOFF || rect.top > window.innerHeight + FALLOFF) {
        zone.classList.remove('is-lit');
        return;
      }

      const x = pointerX - rect.left;
      const y = pointerY - rect.top;
      const near =
        x > -FALLOFF && x < rect.width + FALLOFF && y > -FALLOFF && y < rect.height + FALLOFF;

      zone.classList.toggle('is-lit', near);
      if (near) {
        anyLit = true;
        zone.style.setProperty('--sx', `${x}px`);
        zone.style.setProperty('--sy', `${y}px`);
      }
    });

    document.body.classList.toggle('is-spotlighting', anyLit);
  };

  const onMove = (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frame === null) frame = requestAnimationFrame(update);
  };

  window.addEventListener('mousemove', onMove, { passive: true });

  return () => {
    window.removeEventListener('mousemove', onMove);
    if (frame !== null) cancelAnimationFrame(frame);
    zones.forEach((zone) => zone.classList.remove('is-lit'));
    document.body.classList.remove('is-spotlighting');
  };
}
