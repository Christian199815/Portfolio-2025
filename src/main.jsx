import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { storyblokInit, apiPlugin } from '@storyblok/react';

import './index.css';
import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import WorkPage from './pages/WorkPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import StoryblokPage from './pages/StoryblokPage.jsx';

import Page from './storyblok/Page';
import Teaser from './storyblok/Teaser';
import Feature from './storyblok/Feature';
import Grid from './storyblok/Grid';
import Hero from './storyblok/Hero';
import TextBlock from './storyblok/TextBlock';
import CtaBanner from './storyblok/CtaBanner';
import ContactSection from './storyblok/ContactSection';
import ProcessStep from './storyblok/ProcessStep';
import ProcessList from './storyblok/ProcessList';
import PortfolioItem from './storyblok/PortfolioItem';
import PortfolioGrid from './storyblok/PortfolioGrid';
import Quote from './storyblok/Quote';

storyblokInit({
  accessToken: import.meta.env.STORYBLOK_DELIVERY_API_TOKEN,
  apiOptions: {
    region: import.meta.env.STORYBLOK_REGION || 'eu',
    endpoint: import.meta.env.STORYBLOK_API_BASE_URL
      ? `${new URL(import.meta.env.STORYBLOK_API_BASE_URL).origin}/v2`
      : undefined,
  },
  use: [apiPlugin],
  components: {
    page: Page,
    teaser: Teaser,
    feature: Feature,
    grid: Grid,
    hero: Hero,
    text_block: TextBlock,
    cta_banner: CtaBanner,
    contact_section: ContactSection,
    process_step: ProcessStep,
    process_list: ProcessList,
    portfolio_item: PortfolioItem,
    portfolio_grid: PortfolioGrid,
    quote: Quote,
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'home', element: <Navigate to="/" replace /> },
      { path: 'work', element: <WorkPage /> },
      { path: 'work/:id', element: <ProjectDetailPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: ':slug', element: <StoryblokPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
