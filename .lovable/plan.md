# Favicon refresh

## What's already correct

- `public/favicon.ico` (the old default) is deleted.
- `public/favicon.png` is your new logo.
- `index.html` references only `/favicon.png`.

So there is no lingering favicon file to remove. The stale "ML" icon in the Google search screenshot is served by Google, not by our site.

## What we can still do

1. **Cache-bust the browser tab icon** — update the `<link rel="icon">` tag in `index.html` to `/favicon.png?v=2` so returning visitors' browsers refetch the new PNG immediately instead of using their locally cached copy. Also add an explicit `<link rel="apple-touch-icon" href="/favicon.png">` so iOS/home-screen shortcuts pick it up.
2. **Leave the file itself alone** — deleting `favicon.png` would just show a blank icon; keeping it is what makes the new one appear.

## What we cannot do from the code

- Google's search-result favicon is fetched and cached by Google. It refreshes only after Googlebot recrawls `materialink.ai` and updates its icon store. Typical wait: a few days to a few weeks. Requesting a recrawl in Google Search Console can speed this up, but there is no code change that forces it.
- Social preview crawlers (LinkedIn, Slack, X) similarly cache. Each has its own debugger/re-scrape tool if needed.

## Files touched

- `index.html` — bump the icon href to `/favicon.png?v=2`, add `apple-touch-icon`.
