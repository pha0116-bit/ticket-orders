# Ticket Request Site — Setup Guide

A simple static page for your Instagram bio link. Customers pick events, enter quantity
and contact info, and submit a request. You confirm and take payment manually — nothing
here processes money automatically.

## 1. Edit your content before publishing

- **`config.js`** — your business name, tagline, Instagram handle, and Formspree endpoint (see step 3).
- **`events.js`** — your list of events (name, date, price, description). Add or remove entries any time.

## 2. Preview it locally

Just double-click `index.html` to open it in your browser and try the form. (The "Send
Request" button won't actually send anywhere until you set up Formspree in step 3.)

## 3. Set up free form delivery (Formspree)

1. Go to https://formspree.io and sign up for a free account (50 submissions/month free).
2. Create a new form, and copy the endpoint it gives you — it looks like
   `https://formspree.io/f/xxxxxxxx`.
3. Paste that into `formspreeEndpoint` in `config.js`.
4. Submit a test order on your page once it's live — Formspree will ask you to confirm
   your email the first time before it starts forwarding submissions.

If you skip this, customers can still use the "Message me on Instagram instead" button,
which copies their order details and opens a DM to you.

## 4. Publish for free with GitHub Pages

If you don't have a GitHub account yet:

1. Go to https://github.com/signup and create a free account.

Then, to publish:

1. Go to https://github.com/new and create a new repository (e.g. `ticket-orders`).
   Keep it **Public** (required for free GitHub Pages) and don't add a README.
2. On your computer, open a terminal in this `ticket-order-site` folder and run:

   ```bash
   git init
   git add .
   git commit -m "Initial ticket request site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/ticket-orders.git
   git push -u origin main
   ```

3. On GitHub, open your new repo → **Settings** → **Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a branch", branch
   `main`, folder `/ (root)`, then **Save**.
5. After a minute or two, your site will be live at:

   ```
   https://YOUR-USERNAME.github.io/ticket-orders/
   ```

6. Put that link in your Instagram bio.

## 5. Updating events later

Edit `events.js`, then from the same folder run:

```bash
git add events.js
git commit -m "Update events"
git push
```

GitHub Pages will redeploy automatically within a minute or two.

## Notes

- This site collects requests only — no payment is taken on the page. You confirm
  availability and payment with each customer directly, then log confirmed orders in
  your own ticket sales tracker (e.g. your Google Apps Script sheet) yourself.
- There's no ticket-count limiting — you're managing availability manually, so keep an
  eye on requests as they come in.
