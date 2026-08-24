// Edit this list to add, remove, or update events.
// id: short unique code (no spaces) — used internally, not shown to customers
// name: event title shown on the page
// date: shown as text, format it however you like (e.g. "Sat, Sep 20, 2026 · 7:00 PM")
// price: shown as text, include currency symbol (e.g. "$25")
// description: optional short line under the event name
// soldOut: set to true to hide the event from the order form (card still shows, marked Sold Out)
// link / linkText: optional — shows a button linking out (e.g. to an external ticket/guestlist page)
// excludeFromForm: set to true to keep this event out of the order form dropdown (e.g. pricing/signup happens via the link instead)

window.EVENTS = [
  {
    id: "scarlett-frees",
    name: "Scarlett Frees (subject to availability)",
    date: "Every Saturday night",
    price: "FREE",
    description: "",
    soldOut: false
  },
  {
    id: "scarlett-nova",
    name: "Scarlett/NOVA tickets (Hao's Guestlist)",
    date: "Scarlett: Saturday nights · NOVA: Friday nights",
    price: "See link below",
    description: "",
    link: "https://site.fourvenues.com/en/haopham",
    linkText: "Get on the guestlist",
    excludeFromForm: true,
    soldOut: false
  }
];
