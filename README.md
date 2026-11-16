# Editable Portfolio

React portfolio built with Vite, React Router, and Motion.

## Run locally

```powershell
npm install
npm run dev
```
Vite prints the local URL when the development server starts.

## Build

```powershell
npm run build
npm run preview
```

## Vercel deployment preparation

The root `vercel.json` selects Vite, installs with `npm ci` using the committed
lockfile, builds with `npm run build`, and serves `dist`. Its SPA rewrite sends
direct route visits (for example, `/gallery` and `/work/gamay`) to `index.html`.
Existing static build assets continue to be served by Vercel.

Use these settings when you are ready to import the GitHub repository:

- Framework: Vite.
- Root directory: the directory containing this `package.json` and `vercel.json`.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Node.js version: 24.x, matching the locally verified major version.
- Leave `BASE_PATH` unset so Vite and React Router use the root URL `/`.
- `VITE_FORMSPREE_ENDPOINT` is optional; the existing public endpoint in
  `content.js` remains the default. Never add private credentials to `VITE_` variables.
- Request project name `trshq`; the exact `trshq.vercel.app` address depends on
  Vercel availability and assignment. No domain has been reserved by this setup.

This downloaded working folder has no Git metadata. Safest next steps, only after
approval: clone the existing repository into a separate folder, create a review
branch, compare and copy the current source/configuration/assets into that clone,
and review `git status`/`git diff` before committing or pushing. Preserve the clone's
`.git` directory and remote history; do not initialize an unrelated replacement
history or force-push. Exclude `node_modules`, `dist`, local environment files,
credentials, and `.vercel` metadata. Preserve intentional deletions during comparison
(including the removed music component); copying files alone cannot apply deletions.
The current remote also has legacy image paths missing from this downloaded folder.
Review these separately and retain remote-only assets unless their removal is
explicitly approved; do not mirror-delete the remote tree automatically.

The existing GitHub Pages workflow is still present and runs on pushes to `main`
or `master`. Review it before a future push if you do not want GitHub Pages to
deploy alongside Vercel. No workflow has been disabled or executed by these changes.

References:
- [Vercel Vite SPA deployment](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

## Edit content

- Update the profile, projects, articles, FAQs, and service copy in `content.js`.
- Put image files in `images/` and update their filenames in `content.js`.
- React routes and shared components are in `src/App.jsx`.
- Visual styling is in `styles.css`.

## Direct inquiry delivery

The contact dialog submits asynchronously to Formspree and stays on the portfolio.
Your supplied public endpoint, `https://formspree.io/f/mbgojpee`, is configured as
`profile.formspreeEndpoint` in `content.js`, including for GitHub Pages builds.

- In Formspree, confirm that the form is active and its verified recipient is
  `oronantrishamarie@gmail.com`. Receiving an acceptance response from the service
  does not prove that an email reached the inbox; check the recipient inbox too.
- To change the form, edit `profile.formspreeEndpoint`, or optionally copy
  `.env.example` to `.env.local` and set `VITE_FORMSPREE_ENDPOINT` to your form URL.
  Restart Vite after changing environment files.
- For an optional GitHub Pages override, add a repository Actions **variable**
  named `VITE_FORMSPREE_ENDPOINT`. The deployment workflow passes it to the build.
  Without this override, the endpoint from `content.js` is used. Rebuild/redeploy
  after changing the configuration.

The form URL is public. Never put private Formspree API keys, account passwords,
or email credentials in a `VITE_` variable. Keep Formspree's spam protection
enabled; the form also supplies its supported `_gotcha` honeypot field.

The required inquiry type is submitted as `subject` and `_subject`. Name, email,
and message are submitted with it. The UI preserves all fields on failure and
clears them only after an explicit successful service response. Network timeout,
service rejection, and unavailable configuration never display fake success.

See [Formspree submission documentation](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax/)
and [honeypot documentation](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering/).

## Project visuals and interface details

- The former `/work` listing redirects to `/#projects`. Individual `/work/:slug`
  case pages and all original records remain available. The Work navigation and
  case-page return links lead directly to the homepage Featured Projects carousel.
- Video Editing uses the existing project collection. Four supplied Shorts were
  added without unverified dates or descriptions. All eight use the supplied
  artwork titles in the shared project data. YouTube
  thumbnails fill 16:9 cards immediately, and players load/play only when selected.
  Video cards keep their YouTube links and omit detail-page buttons. Old video
  detail URLs remain available so saved links and original descriptions survive.

- Featured cards use the original assets in `images/FeaturedWork Preview/`.
  GLAM ESSENCE's supplied file is `glamessence-preview.png`.
- Case pages use the original assets in `images/My Projects Logos/`.
- All four interface presentations and their 16 prepared screen slots are retained
  in `content.js` for future use. The case pages omit the redundant interface
  process section. Existing `/uiux?project=…` links
  redirect to the matching case page; `/uiux` and `/#uiux` lead to Featured Projects.
- Sketches, doodle hover reactions, and background interactions are in
  `src/Decorations.jsx`; inquiry behavior is in `src/ContactForm.jsx`.
