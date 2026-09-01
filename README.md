# Chris Donker Portfolio

Minimal portfolio inspired by [Shakuro's Mirko Romanelli case study](https://shakuro.com/works/mirko-romanelli) — neutral palette, project-first scroll flow, GSAP motion.

## Stack

- **React 19** + **Vite**
- **GSAP** + ScrollTrigger
- **Storyblok** for `/contact`
- Projects from `projects.json` via `/api/projects`

## Setup

```bash
npm install
npm run dev
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Minimal hero + project index + scroll case-study panels |
| `/work` | Full project grid with All/Web/Game tabs |
| `/work/:id` | Project detail |
| `/contact` | Contact page |
