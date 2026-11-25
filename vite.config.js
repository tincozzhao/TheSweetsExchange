import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The base path is what makes the site work on GitHub Pages.
//
// - On GitHub Pages the deploy workflow sets VITE_BASE to "/<your-repo-name>/"
//   automatically (or "/" for a <user>.github.io repository), so you never need
//   to edit this file.
// - Locally, and on hosts like Netlify or Cloudflare Pages, it falls back to
//   "./", which uses relative asset paths and works from any folder.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || './',
});
