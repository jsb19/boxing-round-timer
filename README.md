# Boxing Round Timer

A personal, ad-free boxing round timer. Set rounds, work time, and rest
time, save it as a preset, and run the session with a 10s prep countdown
and audio cues at every transition.

No ads, no accounts, no backend — everything runs in the browser and
presets are stored in `localStorage`.

## Local development

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/ (ES modules and localStorage require a
real origin, not `file://`).

## Tests

Pure logic modules have plain Node assert-based tests, no framework:

```bash
node timer-logic.test.mjs
node presets.test.mjs
```

## Deploying

`service-worker.js` uses a cache-first strategy with a hardcoded
`CACHE_NAME`. Bump `CACHE_NAME` (e.g. `boxing-round-timer-v2`) on every
deploy that changes any cached file — otherwise installed/home-screen
instances will keep serving stale cached files indefinitely.
