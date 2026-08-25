(function () {
  const CONFIG = window.SITE_CONFIG || {};
  const EVENTS = window.EVENTS || [];

  document.getElementById("business-name").textContent = CONFIG.businessName || "Your Name / Business";
  document.getElementById("tagline").textContent = CONFIG.tagline || "";

  const liveEvents = sortByDate(EVENTS.filter(isStillUpcoming));
  const availableEvents = liveEvents.filter((e) => !e.soldOut && !e.excludeFromForm);

  // An event stays listed until the end of its final day, so a festival doesn't
  // vanish from the page while it's still running. Recurring events (no
  // startDate) never expire.
  function isStillUpcoming(ev) {
    const last = ev.endDate || ev.startDate;
    if (!last) return true;

    const parts = String(last).split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return true;

    const endOfDay = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
    return endOfDay >= new Date();
  }

  function sortByDate(events) {
    // Recurring events (no startDate) sort first, then everything by date.
    return events.slice().sort((a, b) => {
      if (!a.startDate && !b.startDate) return 0;
      if (!a.startDate) return -1;
      if (!b.startDate) return 1;
      return a.startDate.localeCompare(b.startDate);
    });
  }

  // Customers search by venue and month as often as by event name, so match
  // against everything visible on the card.
  function matchesSearch(ev, query) {
    return [ev.name, ev.date, ev.description, ev.category, ev.price, ev.highlight]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  }

  renderEventList();
  addOrderRow();

  document.getElementById("add-row-btn").addEventListener("click", () => addOrderRow());
  document.getElementById("order-form").addEventListener("submit", handleSubmit);
  document.getElementById("ig-btn").addEventListener("click", handleInstagramFallback);
  document.getElementById("event-search").addEventListener("input", (e) => renderEventList(e.target.value));

  function renderEventList(searchText) {
    const list = document.getElementById("event-list");
    const emptyMsg = document.getElementById("event-search-empty");
    list.innerHTML = "";

    if (liveEvents.length === 0) {
      list.innerHTML = '<p class="hint">No events posted right now — check back soon.</p>';
      emptyMsg.style.display = "none";
      return;
    }

    const query = (searchText || "").trim().toLowerCase();
    const visibleEvents = query
      ? liveEvents.filter((ev) => matchesSearch(ev, query))
      : liveEvents;

    if (visibleEvents.length === 0) {
      emptyMsg.style.display = "block";
      return;
    }
    emptyMsg.style.display = "none";

    const groups = new Map();
    visibleEvents.forEach((ev) => {
      const key = ev.category || "Upcoming Events";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(ev);
    });

    groups.forEach((events, category) => {
      const heading = document.createElement("h2");
      heading.className = "section-title category-title";
      heading.textContent = category;
      list.appendChild(heading);

      const group = document.createElement("div");
      group.className = "event-list";

      events.forEach((ev) => {
        const card = document.createElement("div");
        // Only cards you can actually order through the form are clickable —
        // sold out, external-link, and form-excluded events have nowhere to go.
        const isClickable = !ev.soldOut && !ev.link && !ev.excludeFromForm;
        card.className = "event-card" + (ev.soldOut ? " sold-out" : "") + (isClickable ? " event-card--clickable" : "");

        const priceIsLink = !ev.soldOut && ev.link && typeof ev.unitPrice !== "number";

        card.innerHTML = `
          <div class="event-info">
            <h3>${escapeHtml(ev.name)}</h3>
            ${ev.highlight ? `<div class="event-highlight">${escapeHtml(ev.highlight)}</div>` : ""}
            <div class="meta">${escapeHtml(ev.date)}</div>
            ${ev.description ? `<div class="desc">${escapeHtml(ev.description)}</div>` : ""}
            ${ev.link && !priceIsLink
              ? `<a class="event-link-btn" href="${escapeHtml(ev.link)}" target="_blank" rel="noopener">${escapeHtml(ev.linkText || "View details")}</a>`
              : ""}
          </div>
          <div>
            ${ev.soldOut
              ? '<span class="sold-out-tag">Sold Out</span>'
              : priceIsLink
                ? `<a class="event-price-link" href="${escapeHtml(ev.link)}" target="_blank" rel="noopener">${escapeHtml(ev.linkText || "Buy Tickets")}</a>`
                : `<span class="event-price">${escapeHtml(ev.price)}</span>`}
          </div>
        `;

        if (isClickable) {
          // Expose the card as a real button so keyboard and screen reader
          // users get the same shortcut mouse users do.
          card.setAttribute("role", "button");
          card.setAttribute("tabindex", "0");
          card.setAttribute("aria-label", `Request tickets for ${ev.name}`);
          card.addEventListener("click", () => requestEvent(ev.id));
          card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
              e.preventDefault();
              requestEvent(ev.id);
            }
          });
        }

        group.appendChild(card);
      });

      list.appendChild(group);
    });
  }

  // Clicking an event card should leave the customer with that event already
  // chosen in the form — otherwise they have to hunt for it again in the dropdown.
  function requestEvent(eventId) {
    const rows = Array.from(document.querySelectorAll(".order-row"));

    // Already in the order? Just point at it rather than adding a duplicate row.
    let targetRow = rows.find((row) => row.querySelector('select[name="event_id"]').value === eventId);

    if (!targetRow) {
      // Reuse a row the customer hasn't chosen anything in yet, else start a new one.
      targetRow = rows.find((row) => row.dataset.userSet !== "true");
      if (!targetRow) targetRow = addOrderRow();
      if (!targetRow) return;

      const select = targetRow.querySelector('select[name="event_id"]');
      select.value = eventId;
      select.dispatchEvent(new Event("change"));
    }

    const heading = document.getElementById("request-tickets-heading");
    if (heading) heading.scrollIntoView({ behavior: "smooth", block: "start" });

    flashField(targetRow.querySelector(".event-field"));
  }

  function flashField(field) {
    if (!field) return;
    field.classList.remove("field--flash");
    // Force reflow so the animation restarts if another card is clicked quickly.
    void field.offsetWidth;
    field.classList.add("field--flash");
    field.addEventListener("animationend", () => field.classList.remove("field--flash"), { once: true });
  }

  function addOrderRow() {
    if (availableEvents.length === 0) return null;

    const rows = document.getElementById("order-rows");
    const rowId = "row-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);

    const row = document.createElement("div");
    row.className = "order-row";
    row.dataset.rowId = rowId;

    const options = availableEvents
      .map((ev) => `<option value="${escapeHtml(ev.id)}">${escapeHtml(ev.name)} — ${escapeHtml(ev.price)}</option>`)
      .join("");

    row.innerHTML = `
      <div class="field event-field">
        <label for="event-${rowId}">Event</label>
        <select name="event_id" id="event-${rowId}" required>
          ${options}
          <option value="__other__">Other (not listed)</option>
        </select>
        <input type="text" name="custom_event_name" class="other-input" placeholder="Which event?" aria-label="Name of the event you want" style="display:none" />
      </div>
      <div class="field qty-field">
        <label for="qty-${rowId}">Qty</label>
        <input type="number" name="quantity" id="qty-${rowId}" min="1" max="20" value="1" required />
      </div>
      <button type="button" class="remove-row-btn" aria-label="Remove event">✕</button>
    `;

    const select = row.querySelector('select[name="event_id"]');
    const otherInput = row.querySelector('input[name="custom_event_name"]');
    const qtyInput = row.querySelector('input[name="quantity"]');

    function toggleOtherInput() {
      const isOther = select.value === "__other__";
      otherInput.style.display = isOther ? "block" : "none";
      otherInput.required = isOther;
    }

    select.addEventListener("change", () => {
      row.dataset.userSet = "true";
      toggleOtherInput();
      updateOrderTotal();
    });
    qtyInput.addEventListener("input", updateOrderTotal);

    row.querySelector(".remove-row-btn").addEventListener("click", () => {
      const allRows = rows.querySelectorAll(".order-row");
      if (allRows.length > 1) {
        row.remove();
        updateOrderTotal();
      }
    });

    rows.appendChild(row);
    updateOrderTotal();
    return row;
  }

  function collectOrder() {
    const rows = Array.from(document.querySelectorAll(".order-row"));
    return rows.map((row) => {
      const eventId = row.querySelector('select[name="event_id"]').value;
      const qty = parseInt(row.querySelector('input[name="quantity"]').value, 10) || 0;

      if (eventId === "__other__") {
        const customName = row.querySelector('input[name="custom_event_name"]').value.trim();
        return {
          event: {
            id: "other",
            name: customName ? `Other: ${customName}` : "Other (unspecified event)",
            price: "TBD",
            unitPrice: null
          },
          quantity: qty
        };
      }

      const ev = EVENTS.find((e) => e.id === eventId);
      return { event: ev, quantity: qty };
    }).filter((item) => item.event && item.quantity > 0);
  }

  function updateOrderTotal() {
    const amountEl = document.getElementById("order-total-amount");
    const noteEl = document.getElementById("order-total-note");
    if (!amountEl || !noteEl) return;

    const order = collectOrder();
    let total = 0;
    let hasUnknown = false;

    order.forEach((item) => {
      if (typeof item.event.unitPrice === "number") {
        total += item.event.unitPrice * item.quantity;
      } else {
        hasUnknown = true;
      }
    });

    amountEl.textContent = formatCurrency(total);
    noteEl.style.display = hasUnknown ? "block" : "none";
  }

  function formatCurrency(amount) {
    const fixed = amount.toFixed(2).replace(/\.00$/, "");
    return `$${fixed}`;
  }

  function buildSummaryText(order) {
    const name = document.getElementById("customer-name").value.trim();
    const contact = document.getElementById("customer-contact").value.trim();

    const lines = [];
    lines.push(`Ticket request from ${name || "(no name)"}`);
    lines.push(`Contact: ${contact || "(none)"}`);
    lines.push("");
    lines.push("Order:");
    order.forEach((item) => {
      lines.push(`- ${item.event.name} x${item.quantity} (${item.event.price} each)`);
    });

    return lines.join("\n");
  }

  function showStatus(message, type) {
    const el = document.getElementById("status-msg");
    el.textContent = message;
    el.className = "status-msg show " + type;

    // The message sits at the bottom of a long form — make sure it's actually
    // on screen, otherwise a failed submit looks like nothing happened.
    const rect = el.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function isValidEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function checkEmailRequirement(order) {
    const requiresEmail = order.some((item) => item.event.requireEmail);
    if (!requiresEmail) return true;

    const contact = document.getElementById("customer-contact").value.trim();
    if (!isValidEmail(contact)) {
      showStatus("Please enter a valid email address above to reserve your free Scarlett Frees spot.", "error");
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const order = collectOrder();
    if (order.length === 0) {
      showStatus("Please select at least one event and quantity.", "error");
      return;
    }

    if (!checkEmailRequirement(order)) return;

    const summary = buildSummaryText(order);
    document.getElementById("order-summary-field").value = summary;

    const endpoint = CONFIG.formspreeEndpoint;
    if (!endpoint || endpoint.includes("REPLACE_ME")) {
      showStatus("Form isn't fully set up yet — the site owner needs to add a Formspree endpoint in config.js.", "error");
      return;
    }

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const formData = new FormData(document.getElementById("order-form"));
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        showStatus("Thanks! Your request has been sent — I'll confirm your order and payment soon.", "success");
        document.getElementById("order-form").reset();
        document.getElementById("order-rows").innerHTML = "";
        addOrderRow();
      } else {
        showStatus("Something went wrong sending your request. Try the Instagram option below instead.", "error");
      }
    } catch (err) {
      showStatus("Something went wrong sending your request. Try the Instagram option below instead.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Request";
    }
  }

  async function handleInstagramFallback() {
    const order = collectOrder();
    if (order.length === 0) {
      showStatus("Please select at least one event and quantity first.", "error");
      return;
    }

    if (!checkEmailRequirement(order)) return;

    const summary = buildSummaryText(order);
    const handle = CONFIG.instagramHandle || "";

    try {
      await navigator.clipboard.writeText(summary);
      showStatus("Order details copied! Paste them into the Instagram chat that just opened.", "success");
    } catch (err) {
      showStatus("Couldn't copy automatically — please copy your order details manually before messaging.", "error");
    }

    const url = handle ? `https://ig.me/m/${encodeURIComponent(handle)}` : "https://instagram.com";
    window.open(url, "_blank", "noopener");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }
})();
