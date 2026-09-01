import { useState } from 'react';
import Spotlight from '../components/Spotlight';
import { EMAIL } from '../siteConfig';

const DETAILS = [
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
  { label: 'Based in', value: 'Amsterdam, Netherlands' },
  { label: 'LinkedIn', value: 'chris-donker', href: 'https://www.linkedin.com/in/chris-donker/' },
  { label: 'GitHub', value: 'Christian199815', href: 'https://github.com/Christian199815' },
];

const EMPTY = { name: '', email: '', message: '', company: '' };

export default function ContactPage() {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const update = (field) => (event) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload.error || 'Something went wrong.');

      setValues(EMPTY);
      setStatus('sent');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="contact-page">
      <header className="contact-page__header" data-reveal>
        <h1 className="contact-page__title display-serif">
          Let&rsquo;s <em>talk</em>
        </h1>
        <p className="contact-page__intro">
          Got a project, a role, or a half-formed idea you want a second opinion on? Send it over.
          I read everything and reply to anything that isn&rsquo;t a crypto pitch.
        </p>
      </header>

      {/* ---- Who you're writing to ---- */}
      <section className="contact-about" aria-labelledby="about-heading" data-reveal>
        <figure className="contact-about__portrait">
          <img
            src="/images/me-picture.png"
            alt="Chris Donker (left) at his CMD graduation, a head taller than everyone else in the frame"
            loading="lazy"
            width="1580"
            height="1996"
          />
        </figure>

        <div className="contact-about__body">
          <h2 id="about-heading" className="contact-about__name display-serif">
            Chris Donker
          </h2>
          <p className="contact-about__role label-caps">Creative developer — web &amp; game</p>

          <div className="contact-about__story">
            <p>
              I started out taking things apart to see how they worked, and never really stopped.
              That turned into building websites, then games, then realising the two disciplines
              are the same instinct pointed at different screens.
            </p>
            <p>
              These days I work across front-end engineering and real-time 3D — React and design
              systems on one side, Unity and shaders on the other, with a detour through Adobe and
              a film-editing timeline whenever a project needs one. The through-line is craft: I
              would rather ship one thing that feels considered than five that merely function.
            </p>
            <p>
              Outside of work you will usually find me somewhere with worse wifi and better views —
              a mountain, a trail, a camera in hand.
            </p>
          </div>

          <Spotlight block className="contact-about__secret" radius={140}>
            Fair warning: I&rsquo;m 207 cm (6&prime;9.5&Prime;). Yes, the weather is fine up here.
          </Spotlight>

          <dl className="contact-about__details">
            {DETAILS.map((detail) => (
              <div className="contact-about__detail" key={detail.label}>
                <dt className="label-caps">{detail.label}</dt>
                <dd>
                  {detail.href ? (
                    <a
                      href={detail.href}
                      target={detail.href.startsWith('http') ? '_blank' : undefined}
                      rel={detail.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {detail.value}
                    </a>
                  ) : (
                    detail.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- Form ---- */}
      <section className="contact-form-wrap" aria-labelledby="form-heading" data-reveal>
        <div className="contact-form-wrap__aside">
          <h2 id="form-heading" className="label-caps contact-form-wrap__label">
            Send a message
          </h2>
          <p className="contact-form-wrap__note">
            Tell me what you&rsquo;re building and roughly when you need it. No brief required —
            a paragraph is plenty to start from.
          </p>
        </div>

        <div className="contact-form-wrap__body">
          {status === 'sent' ? (
            <div className="contact-form__done" role="status">
              <p className="contact-form__done-title display-serif">Message sent.</p>
              <p className="contact-form__done-text">
                Thanks — it landed in my inbox. You&rsquo;ll hear back from me shortly.
              </p>
              <button type="button" className="btn btn--ghost" onClick={() => setStatus('idle')}>
                Send another
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <label className="contact-form__field">
                <span className="label-caps">Name</span>
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={update('name')}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="contact-form__field">
                <span className="label-caps">Email address</span>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={update('email')}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="contact-form__field">
                <span className="label-caps">Message</span>
                <textarea
                  name="message"
                  rows={7}
                  value={values.message}
                  onChange={update('message')}
                  required
                />
              </label>

              {/* Honeypot — hidden from people, irresistible to bots */}
              <div className="contact-form__trap" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.company}
                  onChange={update('company')}
                />
              </div>

              <div className="contact-form__actions">
                <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </button>
                <a href={`mailto:${EMAIL}`} className="contact-form__direct">
                  or email me directly
                </a>
              </div>

              <p className="contact-form__status" role="status" aria-live="polite">
                {error}
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
