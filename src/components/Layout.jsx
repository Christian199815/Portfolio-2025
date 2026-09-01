import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import SiteHeader from './SiteHeader';
import Preloader from './Preloader';
import { initGlobalAnimations } from '../animations/initAnimations';
import { EMAIL } from '../siteConfig';
import ChaseMark from './ChaseMark';

const SOCIALS = [
  { href: 'https://www.linkedin.com/in/chris-donker/', label: 'LinkedIn' },
  { href: 'https://github.com/Christian199815', label: 'GitHub' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const layoutRef = useRef(null);

  useEffect(() => {
    const cleanup = initGlobalAnimations(layoutRef.current);
    return cleanup;
  }, [location.pathname]);

  // Landing mid-page after following a link between projects is disorienting
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  return (
    <div ref={layoutRef} className={`site-shell${isHome ? ' site-shell--home' : ''}`}>
      <Preloader />

      <div className="grain" aria-hidden="true" />
      <div className="scroll-progress" data-scroll-progress aria-hidden="true" />

      <a href="#main-content" className="skip-link">Skip to main content</a>

      <SiteHeader />

      <main id="main-content" className="site-main" role="main" tabIndex={-1}>
        {children}
      </main>

      <footer id="site-footer" className="site-footer" role="contentinfo">
        <div className="site-footer__hero">
          <p className="site-footer__eyebrow label-caps" data-reveal>Open for 2026</p>
          <h2 className="site-footer__title display-serif" data-reveal>
            Let&rsquo;s build something <em>worth&nbsp;looking&nbsp;at</em>
          </h2>
          <a href={`mailto:${EMAIL}`} className="site-footer__email" data-reveal data-mark-avoid>
            {EMAIL}
          </a>

          <ChaseMark />
        </div>

        <div className="site-footer__bar">
          <Link to="/" className="label-caps">Chris Donker — Creative Developer</Link>

          <ul role="list" className="site-footer__social label-caps" aria-label="Social links">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noopener noreferrer">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="site-footer__copy label-caps">
            <small>&copy; {new Date().getFullYear()}</small>
          </p>
        </div>
      </footer>
    </div>
  );
}
