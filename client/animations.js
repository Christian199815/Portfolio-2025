import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initCustomCursor() {
  if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  const follower = document.createElement('div');
  follower.className = 'custom-cursor-follower';
  follower.setAttribute('aria-hidden', 'true');
  document.body.appendChild(follower);

  document.body.classList.add('has-custom-cursor');

  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.08, ease: 'power2.out' });
    gsap.to(follower, { x: mouseX, y: mouseY, duration: 0.35, ease: 'power2.out' });
  });

  const interactive = 'a, button, [data-cursor-hover], .hero-card, .portfolio-card, .skill-item';
  document.querySelectorAll(interactive).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-hover');
      follower.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-hover');
      follower.classList.remove('is-hover');
    });
  });
}

function initHeaderAnimation() {
  const header = document.querySelector('[data-animate="header"]');
  if (!header || prefersReducedMotion) return;

  gsap.from(header.children, {
    y: -30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.2,
  });
}

function initHeroAnimation() {
  const hero = document.querySelector('[data-animate="hero"]');
  if (!hero || prefersReducedMotion) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('[data-hero="eyebrow"]', { y: 40, opacity: 0, duration: 0.7 })
    .from('[data-hero="title"]', { y: 60, opacity: 0, duration: 0.9 }, '-=0.4')
    .from('[data-hero="stars"]', { scale: 0, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.5')
    .from('[data-hero="contact"] > *', { x: -30, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.4')
    .from('[data-hero="intro"] > *', { x: 30, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.5')
    .from('[data-hero="card"]', { y: 80, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' }, '-=0.3');
}

function initScrollReveals() {
  if (prefersReducedMotion) return;

  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      y: 50,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
    });
  });

  gsap.utils.toArray('[data-reveal-stagger]').forEach((container) => {
    const items = container.querySelectorAll('[data-reveal-item]');
    gsap.from(items, {
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
    });
  });
}

function initHeroParallax() {
  if (prefersReducedMotion) return;

  const cards = document.querySelectorAll('[data-hero="card"]');
  cards.forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: '[data-animate="hero"]',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
      y: (i + 1) * 30,
      ease: 'none',
    });
  });
}

function initProcessCircles() {
  if (prefersReducedMotion) return;

  const circles = document.querySelectorAll('[data-process-circle]');
  gsap.from(circles, {
    scrollTrigger: {
      trigger: '[data-process-section]',
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
    scale: 0.6,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: 'back.out(1.4)',
  });
}

function initPortfolioHover() {
  if (prefersReducedMotion) return;

  document.querySelectorAll('.portfolio-card').forEach((card) => {
    const img = card.querySelector('.portfolio-card__image img');
    if (!img) return;

    card.addEventListener('mouseenter', () => {
      gsap.to(img, { scale: 1.05, duration: 0.5, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
    });
  });
}

function initFooterAnimation() {
  if (prefersReducedMotion) return;

  const footer = document.querySelector('[data-animate="footer"]');
  if (!footer) return;

  gsap.from('[data-footer-reveal]', {
    scrollTrigger: {
      trigger: footer,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
  });
}

function initHomepage() {
  if (window.location.pathname !== '/' || window.location.hash || window.location.search) return;

  initCustomCursor();
  initHeaderAnimation();
  initHeroAnimation();
  initHeroParallax();
  initScrollReveals();
  initProcessCircles();
  initPortfolioHover();
  initFooterAnimation();
}

document.addEventListener('DOMContentLoaded', initHomepage);
