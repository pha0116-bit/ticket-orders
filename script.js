(function () {
  const CONFIG = window.SITE_CONFIG || {};
  const EVENTS = window.EVENTS || [];

  document.getElementById("business-name").textContent = CONFIG.businessName || "Your Name / Business";
  document.getElementById("tagline").textContent = CONFIG.tagline || "";

  const availableEvents = EVENTS.filter((e) => !e.soldOut && !e.excludeFromForm);

  renderEventList();
  addOrderRow();

  document.getElementById("add-row-btn").addEventListener("click", () => addOrderRow());
  document.getElementById("order-form").addEventListener("submit", handleSubmit);
  document.getElementById("ig-btn").addEventListener("click", handleInstagramFallback);

  function renderEventList() {
    const list = document.getElementById("event-list");
    list.innerHTML = "";

    if (EVENTS.length === 0) {
      list.innerHTML = '<p class="hint">No events posted right now — check back soon.</p>';
      return;
    }

    const groups = new Map();
    EVENTS.forEach((ev) => {
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
        card.className = "event-card" + (ev.soldOut ? " sold-out" : "");
        card.innerHTML = `
          <div class="event-info">
            <h3>${escapeHtml(ev.name)}</h3>
            ${ev.highlight ? `<div class="event-highlight">${escapeHtml(ev.highlight)}</div>` : ""}
            <div class="meta">${escapeHtml(ev.date)}</div>
            ${ev.description ? `<div class="desc">${escapeHtml(ev.description)}</div>` : ""}
            ${ev.link
              ? `<a class="event-link-btn" href="${escapeHtml(ev.link)}" target="_blank" rel="noopener">${escapeHtml(ev.linkText || "View details")}</a>`
              : ""}
          </div>
          <div>
            ${ev.soldOut
              ? '<span class="sold-out-tag">Sold Out</span>'
              : `<span class="event-price">${escapeHtml(ev.price)}</span>`}
          </div>
        `;
        group.appendChild(card);
      });

      list.appendChild(group);
    });
  }

  function addOrderRow() {
    if (availableEvents.length === 0) return;

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
        <label>Event</label>
        <select name="event_id" required>
          ${options}
          <option value="__other__">Other (not listed)</option>
        </select>
        <input type="text" name="custom_event_name" class="other-input" placeholder="Which event?" style="display:none" />
      </div>
      <div class="field qty-field">
        <label>Qty</label>
        <input type="number" name="quantity" min="1" max="20" value="1" required />
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
