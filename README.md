# crossword-puzzle

[![CI](https://github.com/tdouillard/crossword-puzzle/actions/workflows/ci.yml/badge.svg)](https://github.com/tdouillard/crossword-puzzle/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/tdouillard/crossword-puzzle/branch/dev/graph/badge.svg?token=)](https://codecov.io/gh/tdouillard/crossword-puzzle)

A small client-side crossword / mots fléchés web app built with plain JavaScript and Vite-friendly structure. It includes a playable grid, utilities in `src/grid-tools`, a small UI, and a lightweight test + coverage setup using Vitest.

## Features
- Interactive crossword grid and controls
- Progress bar and status UI
- Info popup and favicon (crossword icon)
- Test runner (Vitest) with coverage reporting

## Quick start

Requirements: Node.js 16+ and npm

1. Install dependencies

```bash
cd crossword-puzzle
npm install
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview the production build

```bash
npm run preview
```

## Tests & Coverage

This repository includes a minimal Vitest configuration. Run tests with:

```bash
npm test
npm run test:run  # run tests in CI mode
```

Generate coverage (text + HTML) with:

```bash
npm run coverage
```

After running coverage, open `coverage/index.html` for the full HTML report.

Notes:
- The coverage folder is generated and should not be checked into Git. It's included in `.gitignore` by default.

## Project Structure

Important files and folders:

- `index.html` - main entry page. Contains the info popup and favicon link.
- `script.js` - application bootstrap and event wiring.
- `style.css` - app styles.
- `src/grid-tools/` - crossword logic (engine, renderer, clue manager).
- `vitest.config.js` - test and coverage configuration.
- `package.json` - scripts and devDependencies.
- `favicon.svg` - project favicon (crossword-style SVG).
- `coverage/` - generated test coverage reports (do not commit).

## Development notes

- The UI includes a small description/info popup (ℹ️) implemented directly in `index.html`. Move styles to `style.css` if you prefer a centralized stylesheet.
- The favicon is an SVG at the project root and is referenced from `index.html` as `/favicon.svg`.

## Contributing

Contributions are welcome. Please open issues or PRs. Keep changes small and include tests where appropriate.

## License

This project is provided as-is. Add a license file if you intend to publish or share widely.

## Roadmap / TODO

Planned improvements and known work items:

- [ ] Show hint in corresponding cells
	- Implement showing clue/hint text inside or overlaying the grid cell(s) that correspond to the selected clue. Acceptance: clicking a clue highlights the correct cells and displays the hint inline or as an overlay; works on mobile and desktop; accessible (aria).

- [ ] Fix Grid Verification
	- Investigate and fix the verification logic so the 'Vérifier' button marks letters and words correctly and reports accurate scores.

- [ ] Fix Progress Bar
	- Ensure the progress bar reflects the percentage of correctly filled cells and updates in real-time as the user types.

- [ ] Fix cache/history for answers
	- Implement reliable caching/history for user answers (localStorage or IndexedDB) and add undo/redo history.

- [ ] Create GitHub Actions config to generate static page
	- Add a workflow to run tests, generate coverage, build the site, and deploy or upload artifacts (for example, to GitHub Pages).

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow (`.github/workflows/deploy-gh-pages.yml`) which builds the site and publishes the `dist/` folder to the `gh-pages` branch using `peaceiris/actions-gh-pages`.

How to use:

1. Push to `main` or manually trigger the workflow from the Actions tab.
2. The workflow runs `npm ci`, `npm run build` and deploys `dist/` to the `gh-pages` branch.
3. Go to the repository's Settings → Pages and enable GitHub Pages using the `gh-pages` branch as the source.

If you'd like a different branch or a custom domain configured automatically, tell me and I can update the workflow accordingly.


