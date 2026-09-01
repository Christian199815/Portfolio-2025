export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isCoarsePointer = () => window.matchMedia('(pointer: coarse)').matches;

/** ScrollTrigger scrub/refresh fights native touch momentum — desktop only. */
export const shouldUseScrollTriggers = () =>
  !prefersReducedMotion() && !isCoarsePointer();
