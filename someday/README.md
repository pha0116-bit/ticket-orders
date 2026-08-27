# The Someday List

A shared list of activities we keep meaning to do. The running joke is the point:
every item shows how long it has been sitting there, and the header keeps a
follow-through percentage that is usually bleak.

## The files

| File | What it is |
| --- | --- |
| `app.html` | The source. Edit this one. It deliberately has no `<html>`/`<head>/<body>` tags, because the Claude Artifact publisher supplies them. |
| `index.html` | Generated. A standalone copy for GitHub Pages. |
| `build.sh` | Wraps `app.html` into `index.html`. Run it after every edit. |

```bash
./build.sh
```

## Two ways to run it

**As a shared Artifact (what you want for sharing).** Published from `app.html`
with the `artifact` capability. Anyone you give edit access to can add items, and
every open view reloads to the newest version. The page saves by republishing
itself, so the list lives inside the page — there is no database and no server.

**As a plain web page (GitHub Pages).** `index.html` works on its own but has no
shared storage, so it falls back to `localStorage` and the list stays in one
browser. The page says so in a banner rather than pretending to sync.

The same code handles both: it asks for the `artifact` capability at load, and if
nothing answers it goes local.

## The paste reader

Paste an Instagram link, the caption, or both, then press **Read it**. It fills in:

- the **link** and which platform it came from
- a **title** from the first real line of the caption
- a **place** from a 📍 pin, or from "at Somewhere" / "in Somewhere"
- a **cost** from `$12`, `$12-20`, or the word "free"
- a **date hint** like "Nov 20" or "this weekend"
- a **kind** (Eat, Drink, Outdoors, Culture, Show, Travel, Move, Make) scored from keywords
- **tags** from hashtags

Everything it fills is editable before you save, and it never overwrites a field
you typed yourself. If you paste a link that is already on the list, it says who
saved it and how long ago instead of adding a duplicate.

**This is pattern matching, not a language model.** A published Artifact has no
way to call Claude at runtime, and Instagram blocks reading a post's caption from
a URL alone — a logged-out fetch gets a login wall. So a bare link gives you the
link, the platform and not much else. Paste the caption with it and the reader has
something to work with.

If you later want real extraction from a bare link, it needs a small backend
holding an Instagram token and an API key — see the note at the bottom of this file.

## Item states

- **Someday** — the default. Shows `day N` and a decay label that moves from
  "still warm" through "gathering dust" to "archaeological". The stripe down the
  left edge changes colour with it, and items past 90 days pick up a faint hatch.
- **We did it** — stamped, and the card records how long it took.
- **Let go** — the honest exit. Counts as resolved, but not as done.

**I'm in** lets the other person signal interest without changing the status.

## Editing

1. Edit `app.html`.
2. Run `./build.sh`.
3. Open `index.html` in a browser to check it.
4. Republish the Artifact from `app.html` to the same URL to update the shared copy.

Note that republishing from a file resets the list to whatever is in that file's
`app-state` block. Export a CSV from the page footer first if the live list has
anything in it you care about.

## If you want real AI extraction later

The page cannot call an LLM itself. Two options that would work:

1. **A small serverless function** (Cloudflare Worker, Vercel) that takes an
   Instagram URL, fetches the post through the Instagram Graph API, sends the
   caption to the Claude API, and returns structured fields. The page would call
   it from the intake slip. Needs an Instagram token and an API key, so it cannot
   live in the page.
2. **A Make.com scenario** doing the same thing, called from the page through the
   Artifact `mcp` capability using your connected Make account. No server to run,
   but it ties the page to your Make connection and stops it being publicly
   shareable.
