import { useEffect, useRef } from 'react';
import { initHeroAnimations } from '../animations/heroAnimations';
import { initScrollProjectAnimations } from '../animations/scrollProjects';

/**
 * @param {boolean} projectsReady - panels only exist once the API responds,
 *   so their triggers have to be built after that, not on mount.
 */
export function useHomeAnimations(projectsReady) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    return initHeroAnimations(root.querySelector('[data-hero]'));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !projectsReady) return undefined;
    return initScrollProjectAnimations(root.querySelector('[data-scroll-showcase]'));
  }, [projectsReady]);

  return rootRef;
}
