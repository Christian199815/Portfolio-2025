import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Spotlight from './Spotlight';

const OPTIONS = [
  { id: 'web', label: 'Web' },
  { id: 'both', label: 'Both' },
  { id: 'game', label: 'Game' },
];

const CARDS = [
  {
    prompt: 'Sixteen milliseconds. Every single frame.',
    answer: 'game',
    note: 'Miss the frame budget and people feel it before they can name it.',
  },
  {
    prompt: 'Someone will open this on a five-year-old phone.',
    answer: 'both',
    note: 'Different hardware, same discipline: budget first, features second.',
  },
  {
    prompt: 'Ship on Friday, patch it on Monday.',
    answer: 'web',
    note: 'The web forgives. A shipped build on a console does not.',
  },
  {
    prompt: 'If it feels wrong, the numbers do not matter.',
    answer: 'both',
    note: 'Benchmarks are evidence. The hand on the mouse is the verdict.',
  },
  {
    prompt: 'State lives in a store, not a scene graph.',
    answer: 'web',
    note: 'One is a tree you render. The other is a world you simulate.',
  },
  {
    prompt: 'Playtesting beats opinions — including mine.',
    answer: 'both',
    note: 'Call it usability testing on one side. Same humbling result.',
  },
  {
    prompt: 'Accessibility is not a nice-to-have, it is the law.',
    answer: 'web',
    note: 'Games are catching up fast, but the web got there first.',
  },
  {
    prompt: 'The whole thing has to load before anyone judges it.',
    answer: 'game',
    note: 'On the web you can stream in. In a build, the door opens once.',
  },
];

const REVEAL_MS = 1700;

export default function DisciplineQuiz() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const promptRef = useRef(null);
  const timerRef = useRef(null);

  const card = CARDS[index];
  const revealed = choice !== null;

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (done || !promptRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      promptRef.current,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' },
    );
  }, [index, done]);

  function answer(optionId) {
    if (revealed) return;
    const correct = optionId === card.answer;
    setChoice(optionId);
    if (correct) setScore((value) => value + 1);

    timerRef.current = setTimeout(() => {
      setChoice(null);
      if (index + 1 >= CARDS.length) setDone(true);
      else setIndex((value) => value + 1);
    }, REVEAL_MS);
  }

  function restart() {
    clearTimeout(timerRef.current);
    setIndex(0);
    setChoice(null);
    setScore(0);
    setDone(false);
  }

  const bothCount = CARDS.filter((item) => item.answer === 'both').length;

  return (
    <section className="quiz" aria-labelledby="quiz-heading">
      <header className="quiz__header" data-reveal>
        <h2 id="quiz-heading" className="quiz__title display-serif">
          Same craft, <em>two rulebooks</em>
        </h2>
        <p className="quiz__intro">
          People assume web work and game work are different jobs. Call each one — the answers
          say more about the overlap than any list I could write.
        </p>
        <Spotlight block className="quiz__secret" radius={150}>
          Both answer to the same question: does it feel right yet?
        </Spotlight>
      </header>

      <div className="quiz__panel" data-reveal>
        {done ? (
          <div className="quiz__result">
            <span className="label-caps quiz__result-label">Result</span>
            <p className="quiz__result-score display-caps">
              {score}
              <span className="quiz__result-total">/{CARDS.length}</span>
            </p>
            <p className="quiz__result-text display-serif">
              {bothCount} of them were <em>both</em>. That is the honest answer to
              &ldquo;web or game?&rdquo;
            </p>
            <button type="button" className="btn btn--ghost" onClick={restart}>
              Play again
            </button>
          </div>
        ) : (
          <>
            <div className="quiz__meta">
              <span className="label-caps">
                {String(index + 1).padStart(2, '0')} / {String(CARDS.length).padStart(2, '0')}
              </span>
              <span className="label-caps quiz__score">
                {String(score).padStart(2, '0')} correct
              </span>
            </div>

            <div className="quiz__progress" aria-hidden="true">
              <span
                className="quiz__progress-fill"
                style={{ transform: `scaleX(${index / CARDS.length})` }}
              />
            </div>

            <p className="quiz__prompt display-serif" ref={promptRef}>
              {card.prompt}
            </p>

            <div className="quiz__options" role="group" aria-label="Choose a discipline">
              {OPTIONS.map((option) => {
                const isAnswer = option.id === card.answer;
                const isPicked = option.id === choice;
                const state = !revealed
                  ? ''
                  : isAnswer
                    ? ' is-answer'
                    : isPicked
                      ? ' is-wrong'
                      : ' is-dim';

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`quiz__option quiz__option--${option.id}${state}`}
                    onClick={() => answer(option.id)}
                    disabled={revealed}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <p className="quiz__note" role="status" aria-live="polite">
              {revealed ? (
                <>
                  <span className="quiz__verdict label-caps">
                    {choice === card.answer
                      ? 'Correct'
                      : `Actually — ${OPTIONS.find((o) => o.id === card.answer).label.toLowerCase()}`}
                  </span>
                  {card.note}
                </>
              ) : (
                <span className="quiz__hint">Pick one. There is no penalty for being wrong.</span>
              )}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
