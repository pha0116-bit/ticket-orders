// Edit this list to add, remove, or update events.
// id: short unique code (no spaces) — used internally, not shown to customers
// name: event title shown on the page
// date: shown as text, format it however you like (e.g. "Sat, Sep 20, 2026 · 7:00 PM")
// price: shown as text, include currency symbol (e.g. "$25")
// description: optional short line under the event name
// soldOut: set to true to hide the event from the order form (card still shows, marked Sold Out)
// link / linkText: optional — shows a button linking out (e.g. to an external ticket/guestlist page)
// excludeFromForm: set to true to keep this event out of the order form dropdown (e.g. pricing/signup happens via the link instead)
// category: optional heading to group events under (e.g. "WEEKLY EVENTS"). Events without a category are grouped under "Upcoming Events".
// unitPrice: numeric price per ticket, used to calculate the "Estimated total" on the order form. Leave unset (or use null) if the price isn't a fixed number — it'll be marked "priced separately" instead of added to the total.
// requireEmail: set to true to force customers to enter a valid email (not just a phone number) in the contact field when this event is selected.
// highlight: optional short badge text shown prominently on the card (e.g. "HAO PHAM'S GUESTLIST — AT DOOR").

window.EVENTS = [
  {
    id: "scarlett-frees",
    name: "Scarlett Frees (subject to availability)",
    date: "Every Saturday night",
    price: "FREE",
    unitPrice: 0,
    description: "Submit your email in the form below to reserve your free spot.",
    category: "WEEKLY EVENTS",
    requireEmail: true,
    soldOut: false
  },
  {
    id: "scarlett-nova",
    name: "Scarlett/NOVA tickets",
    date: "Scarlett: Saturday nights\nNOVA: Friday nights",
    price: "See link below",
    description: "",
    highlight: "Hao Pham's Guestlist AT DOOR",
    link: "https://site.fourvenues.com/en/haopham",
    linkText: "BUY TICKETS",
    excludeFromForm: true,
    category: "WEEKLY EVENTS",
    soldOut: false
  },
  {
    id: "marlo-altitude",
    name: "MaRLo Presents ALTITUDE: The Decade",
    date: "Sat, Sep 5, 2026 · 4:00 PM",
    price: "$170",
    unitPrice: 170,
    description: "Flemington Racecourse, Melbourne.",
    category: "UPCOMING EVENTS",
    soldOut: false
  },
  {
    id: "sandbox-2026",
    name: "Sandbox Music Festival",
    date: "Fri, Sep 25, 2026 · 3:00 PM",
    price: "$135",
    unitPrice: 135,
    description: "PICA, Port Melbourne.",
    category: "UPCOMING EVENTS",
    soldOut: false
  },
  {
    id: "echoes-of-us-ga",
    name: "Echoes Of Us (GA)",
    date: "Sat, Nov 7, 2026",
    price: "$155",
    unitPrice: 155,
    description: "Melbourne. General admission.",
    category: "UPCOMING EVENTS",
    soldOut: false
  },
  {
    id: "echoes-of-us-vip",
    name: "Echoes Of Us (VIP)",
    date: "Sat, Nov 7, 2026",
    price: "$250",
    unitPrice: 250,
    description: "Melbourne. VIP.",
    category: "UPCOMING EVENTS",
    soldOut: false
  },
  {
    id: "84fest-2026",
    name: "84FEST",
    date: "Sat, Nov 14, 2026",
    price: "Ask for price",
    description: "Use code HAOPHAM at checkout for $5 off.",
    link: "https://premier.ticketek.com.au/shows/show.aspx?sh=ATEYFORF26",
    linkText: "Buy tickets",
    category: "UPCOMING EVENTS",
    soldOut: false
  },
  {
    id: "hypersonic-2026",
    name: "Hypersonic Festival",
    date: "Sat, Nov 30 – Dec 1, 2026",
    price: "$175",
    unitPrice: 175,
    description: "Flemington Racecourse, Melbourne.",
    category: "UPCOMING EVENTS",
    soldOut: false
  },
  {
    id: "kandy-carnival-2026",
    name: "Kandy Carnival",
    date: "Fri, Dec 11, 2026",
    price: "On request",
    description: "Festival Hall, Melbourne. Message me for pricing.",
    category: "UPCOMING EVENTS",
    soldOut: false
  },
  {
    id: "dreamstate-2027",
    name: "Dreamstate Australia",
    date: "Sun, Feb 7, 2027 · 2:00 PM",
    price: "$180",
    unitPrice: 180,
    description: "Melbourne.",
    category: "UPCOMING EVENTS",
    soldOut: false
  }
];
