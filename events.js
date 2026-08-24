// Edit this list to add, remove, or update events.
// id: short unique code (no spaces) — used internally, not shown to customers
// name: event title shown on the page
// date: shown as text, format it however you like (e.g. "Sat, Sep 20, 2026 · 7:00 PM")
// price: shown as text, include currency symbol (e.g. "$25")
// description: optional short line under the event name
// soldOut: set to true to hide the event from the order form (card still shows, marked Sold Out)

window.EVENTS = [
  {
    id: "event1",
    name: "Sample Event Name",
    date: "Sat, Sep 20, 2026 · 7:00 PM",
    price: "$25",
    description: "Short description of the event goes here.",
    soldOut: false
  },
  {
    id: "event2",
    name: "Another Event",
    date: "Sun, Oct 5, 2026 · 2:00 PM",
    price: "$15",
    description: "Short description of the event goes here.",
    soldOut: false
  }
];
