import { Link, useLocation } from 'react-router';
import { EMAIL } from '../siteConfig';

const LINKS = [
  { to: '/work', label: 'Work' },
  { to: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const location = useLocation();

  return (
    <header role="banner" className="site-header" data-animate="header">
      <nav id="primary-navigation" className="site-nav" aria-label="Primary navigation">
        <Link to="/" className="site-logo">
          <span className="site-logo__mark" aria-hidden="true">✳</span>
          <span className="site-logo__text">Chris Donker</span>
        </Link>

        <ul className="site-nav__links" role="list">
          {LINKS.map((link) => {
            const active =
              link.to === '/work'
                ? location.pathname.startsWith('/work')
                : location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link to={link.to} aria-current={active ? 'page' : undefined} data-nav-link>
                  <span className="site-nav__label">{link.label}</span>
                  <span className="site-nav__label site-nav__label--hover" aria-hidden="true">
                    {link.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <a href={`mailto:${EMAIL}`} className="site-nav__cta" data-magnetic>
          <span className="site-nav__cta-dot" aria-hidden="true" />
          <span className="label-caps">Let&rsquo;s talk</span>
        </a>
      </nav>
    </header>
  );
}
