import { useEffect, useRef } from 'react';

const PULL = 0.012;
const FRICTION = 0.93;
const BOUNCE = 0.7;
const ROLL = 0.6;
const FLEE_PAD = 32;
const FLEE_KICK = 24;
const FLEE_FORCE = 2.4;
const FLEE_RANGE = 340;

export default function ChaseMark() {
  const areaRef = useRef(null);
  const markRef = useRef(null);

  useEffect(() => {
    const area = areaRef.current;
    const mark = markRef.current;
    if (!area || !mark) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0, inside: false };
    let angle = 0;
    let dragging = false;
    let wasFleeing = false;
    let frame = null;

    const rx = mark.offsetWidth / 2;
    const ry = mark.offsetHeight / 2;
    const bounds = () => area.getBoundingClientRect();
    const avoid = area.parentElement?.querySelector('[data-mark-avoid]') ?? null;

    const start = bounds();
    pos.x = start.width * 0.78;
    pos.y = start.height * 0.45;

    // Checked geometrically rather than with hover events, because the mark
    // itself can be sitting on top of the link and swallow them
    function isFleeing(rect) {
      if (!avoid || dragging || !pointer.inside) return false;
      const link = avoid.getBoundingClientRect();
      const px = pointer.x + rect.left;
      const py = pointer.y + rect.top;
      return (
        px >= link.left - FLEE_PAD &&
        px <= link.right + FLEE_PAD &&
        py >= link.top - FLEE_PAD &&
        py <= link.bottom + FLEE_PAD
      );
    }

    function kickAway(rect) {
      const link = avoid.getBoundingClientRect();
      const cx = link.left - rect.left + link.width / 2;
      const cy = link.top - rect.top + link.height / 2;
      let dx = pos.x - cx;
      let dy = pos.y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 1) {
        dx = 0;
        dy = -1;
      } else {
        dx /= dist;
        dy /= dist;
      }
      vel.x += dx * FLEE_KICK;
      vel.y += dy * FLEE_KICK;
    }

    function tick() {
      const rect = bounds();
      const { width, height } = rect;

      const fleeing = isFleeing(rect);
      if (fleeing !== wasFleeing) {
        mark.classList.toggle('is-fleeing', fleeing);
        if (fleeing) kickAway(rect);
        wasFleeing = fleeing;
      }

      if (dragging) {
        vel.x = pointer.x - pos.x;
        vel.y = pointer.y - pos.y;
        pos.x = pointer.x;
        pos.y = pointer.y;
      } else {
        const dx = pointer.x - pos.x;
        const dy = pointer.y - pos.y;
        if (fleeing) {
          const dist = Math.hypot(dx, dy) || 1;
          const strength = Math.max(0, 1 - dist / FLEE_RANGE) * FLEE_FORCE;
          vel.x -= (dx / dist) * strength;
          vel.y -= (dy / dist) * strength;
        } else if (pointer.inside) {
          vel.x += dx * PULL;
          vel.y += dy * PULL;
        }
        vel.x *= FRICTION;
        vel.y *= FRICTION;
        pos.x += vel.x;
        pos.y += vel.y;
      }

      // Stay in the section, losing a little energy on every wall
      if (pos.x < rx) {
        pos.x = rx;
        vel.x = Math.abs(vel.x) * BOUNCE;
      } else if (pos.x > width - rx) {
        pos.x = width - rx;
        vel.x = -Math.abs(vel.x) * BOUNCE;
      }
      if (pos.y < ry) {
        pos.y = ry;
        vel.y = Math.abs(vel.y) * BOUNCE;
      } else if (pos.y > height - ry) {
        pos.y = height - ry;
        vel.y = -Math.abs(vel.y) * BOUNCE;
      }

      angle += vel.x * ROLL;
      mark.style.transform = `translate3d(${pos.x - rx}px, ${pos.y - ry}px, 0) rotate(${angle}deg)`;

      frame = requestAnimationFrame(tick);
    }

    const play = () => {
      if (frame === null) frame = requestAnimationFrame(tick);
    };
    const pause = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    // The footer is off screen most of the time — no sense simulating then
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { threshold: 0 },
    );
    observer.observe(area);

    const onPointerMove = (event) => {
      const rect = bounds();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
    };
    const onPointerDown = (event) => {
      dragging = true;
      mark.setPointerCapture(event.pointerId);
      onPointerMove(event);
    };
    const onPointerUp = (event) => {
      if (!dragging) return;
      dragging = false;
      mark.releasePointerCapture?.(event.pointerId);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    mark.addEventListener('pointerdown', onPointerDown);

    return () => {
      pause();
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      mark.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  return (
    <div className="egg-mark" ref={areaRef} aria-hidden="true">
      <span className="egg-mark__star" ref={markRef}>
        ✳
      </span>
    </div>
  );
}
