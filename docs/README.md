# HygieneRoboBench project website

Project website for **HygieneRoboBench: Benchmarking Hygiene-Aware Planning for Household Robots**.

The page opens with a multiscene showcase: a real-robot motivating case alongside five native household task illustrations. View controls switch between Overview, Real robot, and Household tasks. The real-only view contains a 72-second sequence with five seekable beats. A TL;DR leads into the problem, benchmark, findings, and companion planner. Four main sections use consistent 01–04 indices in the navigation and headings, large native media, restrained separators, and continuous editorial layouts.

Original Figures 1, 2, and 3 from the manuscript are embedded in their corresponding explanations. Focus controls highlight existing regions without redrawing the scientific content; an accessible enlarged viewer supports inspecting the original labels. The research introduction includes the real-robot story and narrated figure walkthroughs. It is embedded from YouTube and loads after a play or chapter click; the original MP4 remains available for download. The supplementary video opens separately from its homepage link. Caption files remain included in the assets directory.

The benchmark includes a fixed scene viewport for five activity groups, a shared registry viewer, and an interactive priority comparison. Results can be viewed overall, by difficulty, or by activity; every displayed value comes from `data.json`. The full film, saved-output swaps, and contact-event results remain available.

The real-robot sequence uses the existing HDR-to-BT.709 SDR working masters, with local label blur and explicit speed indicators. It is a motivating demonstration. Native simulation scenes illustrate benchmark definitions. Ambient media pause off screen and respect reduced-motion preferences. History selection preserves the same physical decision point.

## Preview

Serve this directory with a static HTTP server:

```bash
python3 preview_server.py --port 8000
```

Open `http://localhost:8000`. An HTTP server is required because the page loads its data from JSON files.

The included preview server supports byte ranges for video seeking. No build step, package installation, external fonts, analytics, or planning backend is required. Short native-scene loops play only while visible and respect reduced-motion preferences.

## Files

- `index.html`, `style.css`, `app.js`: responsive page and accessible history interaction.
- `paper.css`, `paper.js`, `assets/paper/`: original manuscript figures, focus controls, and enlarged viewer.
- `film.js`, `film.css`: YouTube film player, original real-robot cover, and chapter seeking.
- `data.json`: manuscript and supplementary result values.
- `transcript.json`: the complete film narration.
- `assets/`: native scene images and loops, share image, film, captions, and manuscript.

All website media are included as regular files in this directory. Paper figures use lossless WebP with pixels identical to the original PNG files. The 72-second hero has a smaller streaming copy; off-screen videos wait until playback rather than preloading video data. The paper download is the 9-page preprint with formal authors and affiliations.

## Publication fields

The page is publicly deployed through GitHub Pages, with search indexing enabled. The public preprint is available at [arXiv:2610.08642](https://arxiv.org/abs/2610.08642); code and data are being prepared for release through the repository. Authors and affiliations are listed in the approved order; no corresponding-author marker is displayed.

The official repository is `Euron-ZC/HygieneRoboBench`; its `docs/` directory is the prepared GitHub Pages source. The public URL is `https://euron-zc.github.io/HygieneRoboBench/`. The arXiv abstract and homepage resource links use these canonical addresses. GitHub Pages publishes the `main` branch from `/docs`. Code and data will be released in stages through the official repository.

Native scene media are OmniGibson / BEHAVIOR-1K illustrations. Task costs are abstract modeling units; evaluated success rates refer to submitted plans and judgments under the benchmark protocol.
