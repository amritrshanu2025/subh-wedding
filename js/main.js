/* =====================================================================
   Indian Wedding Invitation — rendering & behaviour
   All wedding content comes from js/config.js. You should not need to
   edit this file to personalise the invitation.
   ===================================================================== */
(function () {
  "use strict";

  const C = window.WEDDING_CONFIG || {};
  const REDUCED = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  const isSet = (v) =>
    typeof v === "string" ? v.trim() !== "" && v.indexOf("REPLACE_WITH") === -1 : v !== undefined && v !== null && v !== false;
  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
  const show = (v, fallback) => (isSet(v) ? esc(v.trim()) : `<span class="tbd">${esc(fallback)}</span>`);
  const safeLink = (u) => (isSet(u) && /^(https?:\/\/|mailto:|tel:)/i.test(u.trim()) ? u.trim() : "");
  const safeSrc = (u) => (isSet(u) && !/^\s*(javascript:|data:text|vbscript:)/i.test(u) ? u.trim() : "");
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const TIME_RE = /^\d{1,2}:\d{2}$/;
  function parseDay(d) {
    if (!isSet(d) || !DATE_RE.test(d.trim())) return null;
    const [y, m, dd] = d.trim().split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, dd, 12));
    return isNaN(dt) || dt.getUTCDate() !== dd ? null : dt;
  }
  const fmt = (d, opts) => {
    const dt = parseDay(d);
    return dt ? new Intl.DateTimeFormat("en-IN", Object.assign({ timeZone: "UTC" }, opts)).format(dt) : null;
  };
  const fmtDate = (d) => fmt(d, { day: "numeric", month: "long", year: "numeric" });
  const fmtShort = (d) => fmt(d, { day: "numeric", month: "short" });
  const weekday = (d) => fmt(d, { weekday: "long" });
 function fmtTime(t) {
  if (!isSet(t)) return null;

  const value = t.trim();

  // Support both 12-hour AM/PM and 24-hour formats
  const twelveHour = value.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (twelveHour) {
    let h = Number(twelveHour[1]);
    const m = Number(twelveHour[2]);
    const period = twelveHour[3].toUpperCase();

    if (h < 1 || h > 12 || m > 59) return null;

    h = h % 12;
    if (period === "PM") h += 12;

    const displayHour = h % 12 || 12;
    return `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
  }

  const twentyFourHour = value.match(
    /^(\d{1,2}):(\d{2})$/
  );

  if (twentyFourHour) {
    const h = Number(twentyFourHour[1]);
    const m = Number(twentyFourHour[2]);

    if (h > 23 || m > 59) return null;

    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;

    return `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
  }

  return null;
}

  const B = C.bride || {}, G = C.groom || {}, W = C.wedding || {}, T = C.text || {}, CP = C.couple || {};
  const tz = isSet(W.timeZoneLabel) ? " " + W.timeZoneLabel.trim() : "";
  const shortName = (p) =>
    isSet(p.displayName) ? p.displayName.trim() : isSet(p.fullName) ? p.fullName.trim().split(/\s+/)[0] : null;
  const brideShort = shortName(B), groomShort = shortName(G);
  const namesSet = !!(brideShort && groomShort);
  const coupleHTML = () =>
    `${show(groomShort, "Groom")} <span class="amp" aria-hidden="true">&amp;</span><span class="sr"> and </span> ${show(brideShort, "Bride")}`;
  const weddingDateLong = fmtDate(W.date);
  const weddingDateText = weddingDateLong ? `${weekday(W.date)}, ${weddingDateLong}` : null;
  const weddingPlace = [W.venueName, W.city].filter(isSet).map((s) => s.trim()).join(", ");
  const EVENTS = (Array.isArray(C.events) ? C.events : []).filter((e) => e && e.visible !== false);

  /* ------------------------------------------------------------------
     Icons (Lucide-style, inline) & decorative SVG symbols
     ------------------------------------------------------------------ */
  const I = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    shirt: '<path d="M20.4 3.5 16 2a4 4 0 0 1-8 0L3.6 3.5a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.1a1 1 0 0 0 1-.8l.6-3.5a2 2 0 0 0-1.3-2.2z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>',
    vol: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    mute: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.2-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
    nav: '<path d="M3 11 22 2l-9 19-2-8-8-2z"/>',
    park: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
    bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>'
  };
  const ic = (n, cls) =>
    `<svg class="ic ${cls || ""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${I[n] || ""}</svg>`;
  const use = (id, cls, extra) => `<svg class="${cls || ""}" aria-hidden="true" focusable="false" ${extra || ""}><use href="#${id}"/></svg>`;

  const rep = (n, inner, off) =>
    Array.from({ length: n }, (_, k) => `<g transform="rotate(${((k * 360) / n + (off || 0)).toFixed(2)})">${inner}</g>`).join("");

  const SYMBOLS = `
  <symbol id="mandala" viewBox="-100 -100 200 200">
    <g fill="none" stroke="currentColor" stroke-width="1.1">
      <circle r="97"/><circle r="64"/><circle r="38"/><circle r="15"/>
      ${rep(16, '<path transform="translate(0 -64)" d="M0 0C-10-8-9-22 0-28C9-22 10-8 0 0Z"/>')}
      ${rep(16, '<path transform="translate(0 -64)" d="M0 0C-5-5-5-13 0-17C5-13 5-5 0 0Z"/>', 11.25)}
      ${rep(8, '<path transform="translate(0 -38)" d="M0 0C-13-8-11-21 0-24C11-21 13-8 0 0Z"/>')}
      ${rep(8, '<path transform="translate(0 -15)" d="M0 0C-7-6-6-16 0-23C6-16 7-6 0 0Z"/>', 22.5)}
      ${rep(12, '<path transform="translate(0 -15)" d="M0 0C-3-3-3-7 0-9C3-7 3-3 0 0Z"/>')}
      ${rep(24, '<path d="M0-92C-4-96 4-96 0-92Z" fill="currentColor"/>')}
    </g>
    <g fill="currentColor">
      ${rep(36, '<circle cy="-82" r="1.6"/>')}
      ${rep(16, '<circle cy="-50" r="1.4"/>', 11.25)}
      <circle r="4"/>
    </g>
  </symbol>
  <symbol id="lotus" viewBox="-50 -42 100 50">
    <g fill="currentColor">
      <path d="M0 0C-8-14-6-30 0-40C6-30 8-14 0 0Z"/>
      <path opacity=".8" d="M0 0C-16-6-26-22-24-33C-14-29-4-17 0 0Z"/>
      <path opacity=".8" d="M0 0C16-6 26-22 24-33C14-29 4-17 0 0Z"/>
      <path opacity=".6" d="M0 0C-20 0-40-10-46-18C-32-21-12-13 0 0Z"/>
      <path opacity=".6" d="M0 0C20 0 40-10 46-18C32-21 12-13 0 0Z"/>
    </g>
    <path d="M-34 4Q0 12 34 4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </symbol>
  <symbol id="divider" viewBox="0 0 240 20">
    <g fill="none" stroke="currentColor" stroke-width="1"><path d="M0 10H92M148 10H240"/><path d="M120 1 129 10 120 19 111 10Z"/></g>
    <g fill="currentColor"><circle cx="86" cy="10" r="2"/><circle cx="154" cy="10" r="2"/><circle cx="120" cy="10" r="2.6"/>
    <path d="M94 10q6-7 13 0q-7 7-13 0Z"/><path d="M146 10q-6-7-13 0q7 7 13 0Z"/></g>
  </symbol>
  <symbol id="corner" viewBox="0 0 100 100">
    <g fill="none" stroke="currentColor" stroke-linecap="round">
      <path stroke-width="1.6" d="M6 96V42Q6 6 42 6H96"/>
      <path stroke-width=".8" d="M14 96V48Q14 14 48 14H96"/>
      <path stroke-width="1.2" d="M24 24q20 2 26 26q-24-6-26-26Z"/>
      <path stroke-width="1" d="M50 6q4 9 0 18M6 50q9 4 18 0M70 14q-2 8 6 12M14 70q8-2 12 6"/>
    </g>
    <circle cx="24" cy="24" r="3.5" fill="currentColor"/>
  </symbol>
  <symbol id="bell" viewBox="0 0 40 70">
    <path d="M20 0V22" stroke="url(#g-gold)" stroke-width="1.5"/>
    <circle cx="20" cy="22" r="3" fill="none" stroke="url(#g-gold)" stroke-width="1.5"/>
    <path d="M7 56Q7 30 20 26Q33 30 33 56Z" fill="url(#g-gold)"/>
    <path d="M4 56H36" stroke="#A57F35" stroke-width="3" stroke-linecap="round"/>
    <circle cx="20" cy="62" r="4" fill="url(#g-gold)"/>
    <path d="M13 44Q20 40 27 44" stroke="#7A263A" stroke-width="1.2" fill="none" opacity=".6"/>
  </symbol>
  <symbol id="paisley" viewBox="-22 -30 44 52">
    <g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
      <path d="M0 20C-18 16-20-6-6-18C6-28 20-18 12-4C8 3-2 0 2-8"/>
      <path d="M-1 12C-11 9-12-4-4-11C3-16 11-10 7-3"/>
      <circle cx="0" cy="0" r="2.5" fill="currentColor"/>
    </g>
    <g fill="currentColor">${rep(8, '<circle cy="-14" r="1"/>')}</g>
  </symbol>
  <symbol id="marigold" viewBox="-20 -20 40 40">
    <g fill="#E8890C">${rep(14, '<ellipse cy="-11" rx="4.6" ry="8"/>')}</g>
    <g fill="#F7B32B">${rep(12, '<ellipse cy="-7" rx="3.6" ry="6"/>', 15)}</g>
    <g fill="#FFD25A">${rep(10, '<ellipse cy="-4" rx="2.4" ry="4"/>')}</g>
    <circle r="2.5" fill="#B5620A"/>
  </symbol>
  <symbol id="note" viewBox="0 0 24 24">
    <path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="18" cy="16" r="3" fill="currentColor"/>
  </symbol>
  <symbol id="sparkle" viewBox="-10 -10 20 20"><path d="M0-10Q1.6-1.6 10 0Q1.6 1.6 0 10Q-1.6 1.6-10 0Q-1.6-1.6 0-10Z" fill="currentColor"/></symbol>
  <symbol id="chhatra" viewBox="0 0 120 150">
    <path d="M60 14V140" stroke="url(#g-gold)" stroke-width="4"/>
    <circle cx="60" cy="10" r="6" fill="url(#g-gold)"/>
    <path d="M8 62Q60 0 112 62Z" fill="url(#g-gold)"/>
    <path d="M14 56Q60 8 106 56" fill="none" stroke="#7A263A" stroke-width="2" opacity=".6"/>
    <path d="M8 62q5 10 10.4 0q5 10 10.4 0q5 10 10.4 0q5 10 10.4 0q5 10 10.4 0q5 10 10.4 0q5 10 10.4 0q5 10 10.4 0q5 10 10.4 0q5 10 10.4 0Z" fill="#FFF8EC"/>
    <g stroke="#FFF8EC" stroke-width="1.5">${Array.from({ length: 11 }, (_, k) => `<path d="M${8 + k * 10.4} 64v14"/>`).join("")}</g>
    <g fill="#FFF8EC">${Array.from({ length: 11 }, (_, k) => `<circle cx="${8 + k * 10.4}" cy="80" r="2.2"/>`).join("")}</g>
  </symbol>
  <symbol id="dhol" viewBox="0 0 100 60">
    <rect x="10" y="10" width="80" height="40" rx="20" fill="url(#g-gold)"/>
    <ellipse cx="12" cy="30" rx="7" ry="20" fill="#FFF8EC"/><ellipse cx="88" cy="30" rx="7" ry="20" fill="#FFF8EC"/>
    <path d="M20 12 32 48 44 12 56 48 68 12 80 48" stroke="#7A263A" stroke-width="2.2" fill="none"/>
  </symbol>
  <symbol id="glasses" viewBox="0 0 100 100">
    <g stroke="url(#g-gold)" stroke-width="2.4" stroke-linecap="round">
      <g transform="rotate(-14 38 60)"><path d="M28 18h20l-3 34q-7 8-14 0z" fill="#F6E3A8" fill-opacity=".35"/><path d="M38 54v28M30 84h16"/></g>
      <g transform="rotate(14 62 60)"><path d="M52 18h20l-3 34q-7 8-14 0z" fill="#F6E3A8" fill-opacity=".35"/><path d="M62 54v28M54 84h16"/></g>
    </g>
    <use href="#sparkle" x="42" y="0" width="16" height="16" style="color:#F6E3A8"/>
  </symbol>
  <symbol id="diya-ic" viewBox="0 0 60 60">
    <path d="M30 34C22 26 26 16 30 6C34 16 38 26 30 34Z" fill="url(#g-flame)"/>
    <path d="M6 36Q30 60 54 36Q30 44 6 36Z" fill="url(#g-gold)"/>
  </symbol>
  <symbol id="arch" viewBox="0 0 200 260" preserveAspectRatio="none">
    <path d="M6 258V112Q6 64 46 50Q66 12 100 6Q134 12 154 50Q194 64 194 112V258" fill="none" stroke="currentColor" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
    <path d="M16 258V116Q16 72 52 60Q72 24 100 16Q128 24 148 60Q184 72 184 116V258" fill="none" stroke="currentColor" stroke-width=".8" stroke-dasharray="2 5" vector-effect="non-scaling-stroke"/>
  </symbol>
  <symbol id="mandap" viewBox="0 0 320 200">
    <rect x="30" y="182" width="260" height="10" rx="3" fill="#7A263A"/>
    <rect x="44" y="170" width="232" height="14" rx="3" fill="url(#g-gold)"/>
    <rect x="58" y="74" width="10" height="96" fill="url(#g-gold)"/><rect x="252" y="74" width="10" height="96" fill="url(#g-gold)"/>
    <rect x="104" y="86" width="7" height="84" fill="url(#g-gold)" opacity=".7"/><rect x="209" y="86" width="7" height="84" fill="url(#g-gold)" opacity=".7"/>
    <path d="M44 76Q160 4 276 76Z" fill="#7A263A"/>
    <path d="M44 76Q160 22 276 76" fill="none" stroke="url(#g-gold)" stroke-width="3"/>
    <path d="M44 76H276" stroke="url(#g-gold)" stroke-width="4"/>
    <path d="M138 34Q160 2 182 34Z" fill="url(#g-gold)"/>
    <circle cx="160" cy="8" r="5" fill="url(#g-gold)"/>
    <path d="M48 78Q74 116 63 170" stroke="#F4DDE0" stroke-width="7" fill="none" opacity=".9"/>
    <path d="M272 78Q246 116 257 170" stroke="#F4DDE0" stroke-width="7" fill="none" opacity=".9"/>
    <path d="M68 80Q160 128 252 80" fill="none" stroke="#E8890C" stroke-width="5" stroke-dasharray="1 7" stroke-linecap="round"/>
    <path d="M68 80Q160 112 252 80" fill="none" stroke="#FFD25A" stroke-width="3" stroke-dasharray="1 6" stroke-linecap="round"/>
    <path d="M150 168h20l-3-10h-14z" fill="url(#g-gold)"/>
    <path d="M160 158C152 150 155 140 160 130C165 140 168 150 160 158Z" fill="url(#g-flame)"/>
  </symbol>`;

  function diyaHTML() {
    return `<svg class="diya" viewBox="0 0 60 60" aria-hidden="true" focusable="false">
      <circle cx="30" cy="24" r="16" fill="#FFC94A" opacity=".18"/>
      <path class="flame" d="M30 36C22 28 26 18 30 8C34 18 38 28 30 36Z" fill="url(#g-flame)"/>
      <path d="M6 38Q30 60 54 38Q30 46 6 38Z" fill="url(#g-gold)"/>
      <path d="M12 41Q30 54 48 41" fill="none" stroke="#7A263A" stroke-width="1.2" opacity=".55"/>
    </svg>`;
  }

  /* ------------------------------------------------------------------
     Photos with graceful placeholders
     ------------------------------------------------------------------ */
  const placeholder = (label) =>
    `<div class="ph" role="img" aria-label="${esc(label)} (photograph to be added)">${ic("user", "ph-ic")}<span>${esc(label)}</span><small></small></div>`;
  function photo(src, alt, fallback) {
    const s = safeSrc(src);
    return `<div class="photo"><div class="ph-wrap"${s ? ' aria-hidden="true"' : ""}>${fallback}</div>${
      s ? `<img src="${esc(s)}" alt="${esc(alt)}" loading="lazy" decoding="async">` : ""
    }</div>`;
  }
  // Missing image file → remove it and reveal the placeholder underneath
  document.addEventListener(
    "error",
    (e) => {
      const t = e.target;
      if (t && t.tagName === "IMG" && t.closest(".photo")) {
        const wrap = t.parentNode.querySelector(".ph-wrap");
        if (wrap) wrap.removeAttribute("aria-hidden");
        t.remove();
      }
    },
    true
  );

  /* Letter-by-letter name markup */
  function letters(text, baseMs) {
    let i = 0;
    const words = String(text).trim().split(/\s+/).map((w) => {
      const html = Array.from(w).map((ch) => `<span class="ch" style="--i:${i++}">${esc(ch)}</span>`).join("");
      i++;
      return `<span class="w">${html}</span>`;
    });
    return `<span class="letters" style="--base:${baseMs || 0}ms" aria-hidden="true">${words.join(" ")}</span><span class="sr">${esc(text)}</span>`;
  }

  /* ------------------------------------------------------------------
     Event illustrations
     ------------------------------------------------------------------ */
  const EVENT_ICON = { mehndi: "paisley", haldi: "marigold", sangeet: "note", baraat: "chhatra", wedding: "diya-ic", reception: "glasses" };
  function art(theme) {
    const open = '<svg viewBox="0 0 320 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">';
    const sparks = (color, pts) =>
      pts.map(([x, y, s]) => `<use class="twinkle" href="#sparkle" x="${x}" y="${y}" width="${s}" height="${s}" style="color:${color}"/>`).join("");
    switch (theme) {
      case "mehndi":
        return `${open}<defs><linearGradient id="a-me" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3E6F55"/><stop offset="1" stop-color="#22402F"/></linearGradient></defs>
          <rect width="320" height="170" fill="url(#a-me)"/>
          <use href="#mandala" x="105" y="10" width="110" height="110" style="color:#E9D27A" opacity=".45"/>
          <g style="color:#E9D27A">
            <use class="drift" href="#paisley" x="18" y="18" width="44" height="52"/><use class="drift" href="#paisley" x="258" y="22" width="44" height="52"/>
            <use class="drift" href="#paisley" x="40" y="104" width="34" height="40"/><use class="drift" href="#paisley" x="246" y="108" width="34" height="40"/>
          </g>
          <path d="M0 150C60 118 100 160 160 132S262 112 320 140" fill="none" stroke="#C9B037" stroke-width="2"/>
          <g fill="#9BC48A">${[30, 80, 130, 190, 240, 290].map((x, k) => `<path d="M${x} ${142 - (k % 2) * 8}q8-14 18-10q-6 12-18 10Z"/>`).join("")}</g>
          ${sparks("#F6E3A8", [[80, 30, 10], [226, 70, 12], [150, 140, 9]])}</svg>`;
      case "haldi":
        return `${open}<defs><linearGradient id="a-ha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#F2A81D"/></linearGradient></defs>
          <rect width="320" height="170" fill="url(#a-ha)"/>
          <path d="M0 6H320" stroke="#3E7B3A" stroke-width="3"/>
          ${Array.from({ length: 13 }, (_, k) => `<use href="#marigold" x="${k * 26 - 6}" y="0" width="22" height="22"/><path d="M${k * 26 + 5} 20l-5 12h10z" fill="#3E7B3A"/>`).join("")}
          ${[[34, 80, 46], [250, 86, 52], [140, 104, 40], [92, 46, 24], [208, 44, 26]].map(([x, y, s]) => `<use class="drift" href="#marigold" x="${x}" y="${y}" width="${s}" height="${s}"/>`).join("")}
          <circle cx="160" cy="80" r="26" fill="#FFF8EC" opacity=".55"/><circle cx="160" cy="80" r="16" fill="#F2B21B"/>
          ${sparks("#FFF8EC", [[60, 140, 10], [290, 54, 9], [196, 140, 8]])}</svg>`;
      case "sangeet":
        return `${open}<defs><linearGradient id="a-sa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A2160"/><stop offset="1" stop-color="#7A263A"/></linearGradient>
          <radialGradient id="a-bulb"><stop offset="0" stop-color="#FFF6C8"/><stop offset="1" stop-color="#FFC94A" stop-opacity="0"/></radialGradient></defs>
          <rect width="320" height="170" fill="url(#a-sa)"/>
          <path d="M-10 18Q80 62 160 26T330 22" fill="none" stroke="#C79A4B" stroke-width="1"/>
          ${Array.from({ length: 12 }, (_, k) => { const x = k * 28 + 4; const y = 18 + Math.sin((k / 11) * Math.PI * 2) * 14 + (k < 6 ? 16 : 4); return `<circle class="twinkle" cx="${x}" cy="${y.toFixed(1)}" r="9" fill="url(#a-bulb)"/><circle cx="${x}" cy="${y.toFixed(1)}" r="2.6" fill="#FFF0B3"/>`; }).join("")}
          <g style="color:#E7C77F">
            <use class="drift" href="#note" x="40" y="70" width="34" height="34"/><use class="drift" href="#note" x="244" y="64" width="40" height="40"/>
            <use class="drift" href="#note" x="196" y="118" width="24" height="24"/><use class="drift" href="#note" x="96" y="124" width="22" height="22"/>
          </g>
          <g transform="translate(160 132)" fill="none" stroke="#F6E3A8" stroke-width="2" stroke-linecap="round">
            <path class="bob" d="M0-58a8 8 0 1 0 .1 0M0-42V-8M0-30l-18-14M0-30l18-16M0-8l-14 24M0-8l14 24"/>
            <path d="M-26 12Q0 -2 26 12" stroke="#C79A4B"/>
          </g>
          ${sparks("#FFF0B3", [[120, 60, 9], [210, 40, 8], [24, 140, 10], [290, 140, 9]])}</svg>`;
      case "baraat":
        return `${open}<defs><linearGradient id="a-ba" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B3203A"/><stop offset="1" stop-color="#6E0F22"/></linearGradient></defs>
          <rect width="320" height="170" fill="url(#a-ba)"/>
          <path d="M0 4Q160 30 320 4" fill="none" stroke="#D4AF65" stroke-width="1.5"/>
          ${Array.from({ length: 12 }, (_, k) => { const x = 8 + k * 27; const y = 4 + Math.sin((k / 11) * Math.PI) * 13; return `<path d="M${x} ${y.toFixed(1)}l9 0-4.5 14z" fill="${k % 2 ? "#FFF8EC" : "#D4AF65"}"/>`; }).join("")}
          <use class="bob" href="#chhatra" x="112" y="30" width="96" height="120"/>
          <use href="#dhol" x="22" y="108" width="74" height="44" transform="rotate(-10 59 130)"/>
          <use href="#dhol" x="226" y="108" width="74" height="44" transform="rotate(10 263 130)"/>
          ${sparks("#F6E3A8", [[40, 50, 12], [270, 60, 12], [74, 84, 8], [246, 92, 8]])}</svg>`;
      case "wedding":
        return `${open}<defs><linearGradient id="a-we" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8EC"/><stop offset="1" stop-color="#F4DDE0"/></linearGradient></defs>
          <rect width="320" height="170" fill="url(#a-we)"/>
          <use href="#mandala" x="70" y="-50" width="180" height="180" style="color:#D4AF65" opacity=".25"/>
          <use href="#mandap" x="40" y="18" width="240" height="150"/>
          ${sparks("#D4AF65", [[30, 40, 12], [280, 40, 12], [24, 120, 8], [290, 116, 8]])}</svg>`;
      case "reception":
        return `${open}<defs><linearGradient id="a-re" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E2426"/><stop offset="1" stop-color="#15100F"/></linearGradient>
          <radialGradient id="a-glow"><stop offset="0" stop-color="#E9D29E" stop-opacity=".45"/><stop offset="1" stop-color="#E9D29E" stop-opacity="0"/></radialGradient></defs>
          <rect width="320" height="170" fill="url(#a-re)"/>
          <circle cx="160" cy="58" r="90" fill="url(#a-glow)"/>
          <g stroke="#C2A36B" stroke-width="1.2" fill="none">
            <path d="M160 0V22M110 40Q160 70 210 40M124 40Q160 58 196 40"/>
            <path d="M110 40V54M124 40V58M142 48V66M160 50V72M178 48V66M196 40V58M210 40V54"/>
          </g>
          <g fill="#F6E3A8">${[110, 124, 142, 160, 178, 196, 210].map((x, k) => `<circle class="twinkle" cx="${x}" cy="${[56, 60, 68, 74, 68, 60, 56][k]}" r="3"/>`).join("")}</g>
          <ellipse cx="160" cy="24" rx="20" ry="6" fill="#C2A36B"/>
          <use href="#glasses" x="120" y="82" width="80" height="80"/>
          ${sparks("#E9D29E", [[40, 40, 10], [270, 30, 12], [60, 130, 8], [256, 124, 9], [230, 80, 7]])}</svg>`;
      default:
        return `${open}<rect width="320" height="170" fill="#7A263A"/><use href="#mandala" x="90" y="15" width="140" height="140" style="color:#D4AF65" opacity=".5"/></svg>`;
    }
  }

  /* ==================================================================
     RENDER
     ================================================================== */
  function renderStatic() {
    $("#svg-defs").insertAdjacentHTML("beforeend", SYMBOLS);
    $$(".diyas").forEach((d) => (d.innerHTML = diyaHTML() + diyaHTML() + diyaHTML()));

    document.title = namesSet ? `${groomShort} & ${brideShort} — Wedding Invitation` : C.site && isSet(C.site.title) ? C.site.title : "Wedding Invitation";
    const initials = namesSet ? `${groomShort[0]} <span aria-hidden="true">&amp;</span><span class="sr">and</span> ${brideShort[0]}` : "";
    $("#brand").innerHTML = use("lotus") + (initials ? `<span>${initials}</span>` : '<span class="sr">Home</span>');
    $("#menu-btn").innerHTML = ic("menu");
    $("#lb-close").innerHTML = ic("x");
    $("#lb-prev").innerHTML = ic("left");
    $("#lb-next").innerHTML = ic("right");
  }

  function renderIntro() {
    $("#intro-heading").textContent = T.openingHeading || "Together with Our Families";
    $("#intro-title").innerHTML = `<span class="nm">${show(groomShort, "Groom")}</span><span class="amp" aria-hidden="true">&amp;</span><span class="sr"> and </span><span class="nm">${show(brideShort, "Bride")}</span>`;
  const startPhoto = CP.startCardPhoto || CP.photo;

$("#intro-art").outerHTML = safeSrc(startPhoto)
  ? `<div class="intro-portrait">
       ${photo(startPhoto, "The couple", `<div class="ph">${use("mandap", "", 'viewBox="0 0 320 200" style="width:80%"')}</div>`)}
     </div>`
  : `<div class="intro-art">${use("mandap", "", 'viewBox="0 0 320 200"')}</div>`;

const introImg = document.querySelector(".intro-portrait .photo img");

if (introImg) {
  introImg.style.objectFit = "contain";
  introImg.style.objectPosition = "center";
}
    $("#intro-date").innerHTML = weddingDateText ? esc(weddingDateText) : '<span class="tbd">Wedding date to be announced</span>';
    $("#intro-place").innerHTML = isSet(W.city) ? esc(W.city.trim()) : isSet(W.venueName) ? esc(W.venueName.trim()) : '<span class="tbd">Village : Pidhay Bujurg  </span>';
    $("#open-btn").textContent = T.openButton || "Open Wedding Invitation";
    if (C.music && isSet(C.music.src)) $("#intro-hint").hidden = false;
  }

  function renderHero() {
    $("#hero-eyebrow").textContent = T.openingHeading || "Together with Our Families";
    const b = brideShort || "Bride", g = groomShort || "Groom";
    $("#hero-names").innerHTML =
      `<span class="nm${groomShort ? "" : " tbd"}">${letters(g, 250)}</span>` +
      `<span class="amp" aria-hidden="true">&amp;</span><span class="sr"> and </span>` +
      `<span class="nm${brideShort ? "" : " tbd"}">${letters(b, 900 + g.length * 55)}</span>`;
    renderHeroCouple();
    $("#hero-line").textContent = T.heroLine || "joyfully invite you to celebrate our wedding";
    $("#hero-date").innerHTML = weddingDateText
      ? esc(weddingDateText) + (fmtTime(W.time) ? ` &middot; ${fmtTime(W.time)}${esc(tz)}` : "")
      : '<span class="tbd">Wedding date to be announced</span>';
    $("#hero-place").innerHTML = weddingPlace ? esc(weddingPlace) : "";
  }

  /* Very faint groom (left) & bride (right) behind the hero text.
     Uses couple.heroGroomPhoto / heroBridePhoto, else groom.photo / bride.photo,
     else an elegant gold line-art illustration. */
  const GROOM_ART = `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M136 176Q132 96 200 88Q268 96 266 176Q232 154 200 156Q168 154 136 176Z" fill="currentColor" fill-opacity=".16"/>
      <path d="M142 150Q200 118 262 150M146 128Q200 100 256 126M160 106Q200 90 240 104"/>
      <path d="M232 100Q262 46 240 14Q276 50 250 108Z" fill="currentColor" fill-opacity=".25"/>
      <circle cx="236" cy="112" r="9" fill="currentColor" fill-opacity=".35"/>
      <ellipse cx="201" cy="212" rx="50" ry="60" fill="currentColor" fill-opacity=".06"/>
      <path d="M178 202q8-6 16 0M208 202q8-6 16 0M201 214v18q-6 6 0 8M184 250q17 10 34 0"/>
      <path d="M182 268v24M220 268v24"/>
      <path d="M78 800 92 410Q104 322 170 292L201 312 232 292Q298 322 310 410L324 800Z" fill="currentColor" fill-opacity=".12"/>
      <path d="M170 292 201 330 232 292"/>
      <path d="M201 330V800" stroke-dasharray="2 10"/>
      ${Array.from({ length: 11 }, (_, k) => `<circle cx="201" cy="${360 + k * 40}" r="4" fill="currentColor"/>`).join("")}
      <path d="M150 300Q196 430 252 800H292Q234 430 176 296Z" fill="currentColor" fill-opacity=".18"/>
      <path d="M166 300Q201 430 236 300" stroke-dasharray="1 9" stroke-width="5"/>
      <path d="M110 520Q100 640 120 800M292 520Q302 640 282 800" stroke-width="1.4"/>
    </g></svg>`;
  const BRIDE_ART = `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M78 800Q66 330 122 190Q200 64 278 190Q334 330 322 800Z" fill="currentColor" fill-opacity=".1"/>
      <path d="M96 800Q86 340 136 204Q200 96 264 204Q314 340 304 800" stroke-dasharray="3 9"/>
      <ellipse cx="200" cy="222" rx="45" ry="56" fill="currentColor" fill-opacity=".06"/>
      <path d="M200 148V180"/><circle cx="200" cy="186" r="7" fill="currentColor" fill-opacity=".5"/>
      <path d="M178 214q8-6 16 0M206 214q8-6 16 0M200 226v16M186 258q14 8 28 0"/>
      <circle cx="210" cy="240" r="9"/>
      <path d="M152 244v18M248 244v18"/>
      <path d="M144 262q8 22 16 0ZM240 262q8 22 16 0Z" fill="currentColor" fill-opacity=".45"/>
      <path d="M182 276v22M218 276v22"/>
      <path d="M118 800 128 430Q140 336 176 304H224Q260 336 272 430L282 800Z" fill="currentColor" fill-opacity=".14"/>
      <path d="M164 302Q200 360 236 302M156 304Q200 392 244 304" stroke-width="3"/>
      ${Array.from({ length: 7 }, (_, k) => `<path d="M${170 + k * 10} ${330 + Math.round(Math.sin((k / 6) * Math.PI) * 22)}v12" stroke-width="3"/>`).join("")}
      <path d="M128 560Q200 600 272 560M124 650Q200 690 276 650M120 740Q200 780 280 740" stroke-dasharray="2 8" stroke-width="3"/>
    </g></svg>`;
  function renderHeroCouple() {
    const box = $("#hero-couple");
    if (!box) return;
    const side = (cls, src, art, alt) => {
      const s = safeSrc(src);
      return `<div class="hc ${cls}${s ? " has-photo" : ""}">${s ? `<img src="${esc(s)}" alt="" loading="eager" decoding="async" data-alt="${esc(alt)}">` : ""}<div class="hc-art">${art}</div></div>`;
    };
    box.innerHTML =
      side("hc-groom", CP.heroGroomPhoto || G.photo, GROOM_ART, "Groom") +
      side("hc-bride", CP.heroBridePhoto || B.photo, BRIDE_ART, "Bride");
    $$("img", box).forEach((im) => im.addEventListener("error", () => { im.parentNode.classList.remove("has-photo"); im.remove(); }));
  }

  function personCard(p, role) {
    const name = isSet(p.fullName) ? p.fullName.trim() : null;
    const child = role === "Bride" ? "Daughter" : "Son";
    return `
      <div class="portrait">${photo(p.photo, `${name || role}, the ${role.toLowerCase()}`, placeholder(`${role}'s portrait`))}</div>
      <p class="eyebrow">The ${role}</p>
      <h3 class="person-name">${name ? letters(name, 200) : `<span class="tbd">${role}'s full name</span>`}</h3>
      ${isSet(p.nickname) ? `<p class="nick">Fondly called ${esc(p.nickname.trim())}</p>` : ""}
      <p class="person-parents">${child} of <strong>${show(p.father, "Father's name")}</strong> &amp; <strong>${show(p.mother, "Mother's name")}</strong></p>
      ${isSet(p.familyIntro) ? `<p class="person-family">${esc(p.familyIntro.trim())}</p>` : ""}
      ${isSet(p.description) ? `<p class="person-desc">${esc(p.description.trim())}</p>` : ""}`;
  }

  function renderStory() {
    $("#story-title").textContent = CP.heading || "Two Hearts, One Beautiful Journey";
    $("#bride-card").innerHTML = personCard(B, "Bride");
    $("#groom-card").innerHTML = personCard(G, "Groom");
    const flowers = [[6, 12, 70], [88, 8, 56], [4, 70, 48], [90, 62, 64], [48, 92, 40]];
    $(".float-flowers").innerHTML = flowers
      .map(([x, y, s], k) => `<svg style="left:${x}%;top:${y}%;width:${s}px;height:${s / 2}px;animation-delay:-${k * 1.7}s"><use href="#lotus"/></svg>`)
      .join("");
    $("#couple-feature").innerHTML = `
      <div class="couple-photo">${photo(CP.photo, "The couple together", placeholder(""))}</div>
      <div class="couple-text">
        ${use("lotus", "", 'style="width:60px;height:30px;color:var(--gold)"')}
        <p class="names">${coupleHTML()}</p>
        ${isSet(CP.story) ? `<p class="story-text">${esc(CP.story.trim())}</p>` : ""}
        <div class="save-date">
          <strong>${weddingDateText ? esc(weddingDateText) : '<span class="tbd">Date to be announced</span>'}</strong>
          <span>${weddingPlace ? esc(weddingPlace) : '<span class="tbd">Venue to be announced</span>'}</span>
        </div>
      </div>`;
  }

  function renderFamilyBlessing() {
    $("#family-blessing").innerHTML = `
      ${use("divider", "divider")}
      <p class="fb-msg">${esc(T.parentsInvitation || "")}</p>
      <p class="fb-couple">${coupleHTML()}</p>
      ${weddingDateText ? `<p class="fb-date">${esc(weddingDateText)}</p>` : ""}
      ${use("lotus", "fb-lotus")}`;
  }

  const GROUPS = [
    ["parents", "Parents"], ["grandparents", "Grandparents"], ["siblings", "Brothers & Sisters"],
    ["uncles-aunts", "Uncles & Aunts"], ["cousins", "Cousins"], ["others", "Other Family Members"]
  ];
  function initialsOf(name) {
    if (!isSet(name)) return "";
    const parts = name.replace(/^(mr|mrs|ms|dr|shri|smt|sri|late)\.?\s+/i, "").trim().split(/\s+/);
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  }
  function parentCard(m, i) {
    const rel = isSet(m.relation) ? m.relation.trim() : "Parent";
    return `<li class="fp tilt" style="--i:${i}">
      <div class="fp-frame frame-shine">
        ${use("lotus", "frame-lotus")}
        <div class="fp-photo">${photo(m.photo, isSet(m.name) ? m.name : rel, placeholder(`${rel}'s photo`))}</div>
      </div>
      <p class="fp-name">${show(m.name, m.fallback || "Name to be added")}</p>
      <p class="fp-rel">${esc(rel)}</p>
      ${isSet(m.message) ? `<p class="fm-msg">“${esc(m.message.trim())}”</p>` : ""}
    </li>`;
  }
  function memberCard(m, i) {
    const ini = initialsOf(m.name);
    const fallback = `<span class="initials">${ini ? esc(ini) : ic("user")}</span>`;
    return `<li class="fm tilt" style="--i:${i}">
      <div class="fm-photo">${safeSrc(m.photo) ? photo(m.photo, m.name, fallback) : fallback}</div>
      <p class="fm-name">${show(m.name, "Name to be added")}</p>
      ${isSet(m.relation) ? `<p class="fm-rel">${esc(m.relation.trim())}</p>` : ""}
      ${isSet(m.message) ? `<p class="fm-msg">“${esc(m.message.trim())}”</p>` : ""}
    </li>`;
  }
  function familySide(p, list, title) {
    const all = Array.isArray(list) ? list : [];
    const known = GROUPS.map((g) => g[0]);
    let parents = all.filter((m) => m && m.group === "parents" && isSet(m.name));
    if (!parents.length) {
      parents = [
        { name: p.father, relation: "Father", photo: p.fatherPhoto, fallback: "Father's name" },
        { name: p.mother, relation: "Mother", photo: p.motherPhoto, fallback: "Mother's name" }
      ];
    }
    const others = all.filter((m) => m && isSet(m.name) && m.group !== "parents");
    let i = 0;
    let html = `<div class="fam-group"><h4>Parents</h4><ul class="fp-list">${parents.map((m) => parentCard(m, i++)).join("")}</ul></div>`;
    GROUPS.slice(1).forEach(([id, label]) => {
      const items = others.filter((m) => (known.includes(m.group) ? m.group : "others") === id);
      if (items.length) html += `<div class="fam-group"><h4>${esc(label)}</h4><ul class="fam-list">${items.map((m) => memberCard(m, i++)).join("")}</ul></div>`;
    });
    return `<article class="fam-side reveal">
      ${use("corner", "corner c-tl")}${use("corner", "corner c-tr")}
      <h3>${use("lotus", "fam-lotus")}${esc(title)}</h3>${html}</article>`;
  }
  function renderFamily() {
    const F = C.family || {};
    $("#families").innerHTML = familySide(G, F.groom, "The Groom's Family") + familySide(B, F.bride, "The Bride's Family");
  }

  function renderEvents() {
    const grid = $("#event-grid");
    if (!EVENTS.length) {
      grid.innerHTML = '<p class="g-empty">Event details will be shared soon.</p>';
      $(".timeline-wrap").hidden = true;
      return;
    }
    grid.innerHTML = EVENTS.map((e, k) => {
      const theme = /^[a-z-]+$/.test(e.theme || "") ? e.theme : "wedding";
      const d = fmtDate(e.date), wd = weekday(e.date), t = fmtTime(e.time);
      const details = (Array.isArray(e.details) ? e.details : []).filter((x) => x && isSet(x.value) && isSet(x.label));
      const map = safeLink(e.mapUrl);
      return `<article class="event ev-${theme} reveal" style="--d:${(k % 3) * 120}ms" id="ev-${esc(e.id || k)}">
        <div class="ev-art">${safeSrc(e.photo) ? photo(e.photo, `${e.name || "Event"} photograph`, art(theme)) : art(theme)}
          <span class="ev-badge">${use(EVENT_ICON[theme] || "lotus")}</span></div>
        <div class="ev-body">
          <p class="ev-kicker">${wd ? esc(wd) : "Day to be announced"}</p>
          <h3 class="ev-title">${show(e.name, "Celebration")}</h3>
          ${theme === "wedding" ? `<p class="ev-couple">${coupleHTML()}</p>` : ""}
          <ul class="ev-meta">
            <li>${ic("calendar")}<span><span class="lbl">Date</span>${d ? esc(d) : '<span class="tbd">To be announced</span>'}</span></li>
            <li>${ic("clock")}<span><span class="lbl">Time</span>${t ? esc(t + tz) : '<span class="tbd">To be announced</span>'}</span></li>
            <li>${ic("pin")}<span><span class="lbl">${theme === "baraat" ? "Starting point" : "Venue"}</span><strong>${show(e.venueName, "Venue to be announced")}</strong>${isSet(e.address) ? "<br>" + esc(e.address.trim()) : ""}</span></li>
            ${isSet(e.dressCode) ? `<li>${ic("shirt")}<span><span class="lbl">Dress code</span>${esc(e.dressCode.trim())}</span></li>` : ""}
            ${details.map((x) => `<li>${ic("info")}<span><span class="lbl">${esc(x.label)}</span>${esc(x.value.trim())}</span></li>`).join("")}
          </ul>
          ${isSet(e.description) ? `<p class="ev-desc">${esc(e.description.trim())}</p>` : ""}
          ${map ? `<div class="ev-actions"><a class="btn btn-outline" href="${esc(map)}" target="_blank" rel="noopener">${ic("pin")} View Location</a></div>` : ""}
        </div>
      </article>`;
    }).join("");

    $("#timeline").innerHTML = EVENTS.map((e) => {
      const theme = /^[a-z-]+$/.test(e.theme || "") ? e.theme : "wedding";
      const when = [fmtShort(e.date), fmtTime(e.time)].filter(Boolean).join(" · ");
      return `<li class="tl-item ev-${theme} reveal">
        <span class="tl-dot" aria-hidden="true"></span>
        <p class="tl-when">${when ? esc(when) : "Date to be announced"}</p>
        <p class="tl-name">${show(e.name, "Celebration")}</p>
        ${isSet(e.venueName) ? `<p class="tl-where">${esc(e.venueName.trim())}</p>` : ""}
      </li>`;
    }).join("");
  }

  function renderVenue() {
    const t = fmtTime(W.time);
    const map = safeLink(W.mapUrl);
    const contacts = (Array.isArray(C.contacts) ? C.contacts : []).filter((c) => c && isSet(c.name));
    const others = EVENTS.filter((e) => isSet(e.venueName) && (!isSet(W.venueName) || e.venueName.trim() !== W.venueName.trim()));
    $("#venue-card").innerHTML = `
      <div class="venue-info">
        <p class="eyebrow">Wedding Ceremony</p>
        <h3 class="venue-name">${show(W.venueName, "Venue to be announced")}</h3>
        <ul class="venue-list">
          <li>${ic("pin")}<span><span class="lbl">Address</span>${show(W.address, "Address to be announced")}${isSet(W.city) ? "<br>" + esc(W.city.trim()) : ""}</span></li>
          <li>${ic("calendar")}<span><span class="lbl">Date &amp; time</span>${weddingDateText ? esc(weddingDateText) : '<span class="tbd">Date to be announced</span>'}${t ? ` · ${esc(t + tz)}` : ""}</span></li>
          ${isSet(W.parking) ? `<li>${ic("park")}<span><span class="lbl">Parking</span>${esc(W.parking.trim())}</span></li>` : ""}
          ${isSet(W.accommodation) ? `<li>${ic("bed")}<span><span class="lbl">Accommodation</span>${esc(W.accommodation.trim())}</span></li>` : ""}
          ${contacts.length ? `<li>${ic("phone")}<span><span class="lbl">Contact</span><ul class="contacts">${contacts.map(contactHTML).join("")}</ul></span></li>` : ""}
        </ul>
        ${map ? `<div class="venue-actions"><a class="btn btn-gold" href="${esc(map)}" target="_blank" rel="noopener">${ic("nav")} Get Directions</a></div>` : '<p class="venue-note">Map directions will be added soon.</p>'}
        ${others.length ? `<div class="other-venues"><h3>Other celebration venues</h3><ul>${others.map((e) => {
          const m = safeLink(e.mapUrl);
          return `<li><span><strong>${esc((e.name || "").trim())}</strong> — ${esc(e.venueName.trim())}</span>${m ? `<a href="${esc(m)}" target="_blank" rel="noopener">View location</a>` : ""}</li>`;
        }).join("")}</ul></div>` : ""}
      </div>
      <div class="venue-art" aria-hidden="true">
        <svg class="arch-frame" viewBox="0 0 200 260" preserveAspectRatio="none"><use href="#arch"/></svg>
        <svg class="mandap" viewBox="0 0 320 200"><use href="#mandap"/></svg>
      </div>`;
  }
  function contactHTML(c) {
    const tel = isSet(c.phone) ? c.phone.replace(/[^\d+]/g, "") : "";
    return `<li><strong>${esc(c.name.trim())}</strong>${isSet(c.role) ? ` <span class="opt">(${esc(c.role.trim())})</span>` : ""}
      ${tel ? `<br><a href="tel:${esc(tel)}">${esc(c.phone.trim())}</a>` : ""}
      ${isSet(c.email) ? `<br><a href="mailto:${esc(c.email.trim())}">${esc(c.email.trim())}</a>` : ""}</li>`;
  }

  function renderClosing() {
    if (isSet(T.blessing)) {
      $("#blessings").hidden = false;
      $("#blessing").innerHTML = `${use("mandala", "b-mandala")}
        <blockquote>${esc(T.blessing.trim())}</blockquote>
        ${isSet(T.blessingAttribution) ? `<figcaption>— ${esc(T.blessingAttribution.trim())}</figcaption>` : ""}`;
    }
    $("#thanks-inner").innerHTML = `
      ${use("lotus", "", 'style="width:70px;height:36px;color:var(--gold)"')}
      <h2 class="thanks-msg" id="thanks-title">${esc(T.thankYou || "Your presence, blessings, and love mean the world to us.")}</h2>
      <p class="thanks-names">${coupleHTML()}</p>
      <p class="thanks-date">${weddingDateLong ? esc(weddingDateLong) : ""}</p>
      <div class="diyas">${diyaHTML()}${diyaHTML()}${diyaHTML()}</div>`;

    const contacts = (Array.isArray(C.contacts) ? C.contacts : []).filter((c) => c && isSet(c.name) && (isSet(c.phone) || isSet(c.email)));
    const links = $$("#nav-links a").map((a) => `<li><a href="${a.getAttribute("href")}">${esc(a.textContent)}</a></li>`).join("");
    $("#footer").innerHTML = `
      <p class="f-names">${coupleHTML()}</p>
      <p class="f-date">2 December 2026</p>
      <h2 class="f-heading"> Blessing Ceremony & Wedding Reception </h2>
      <p class="f-thanks">Thank you for being part of our story.</p>
      <ul class="f-links">${links}</ul>
      <button class="icon-btn f-music music-toggle" type="button" hidden aria-pressed="false" aria-label="Play music"></button>
      ${contacts.length ? `<p class="f-contacts">${contacts.map((c) => {
        const tel = isSet(c.phone) ? c.phone.replace(/[^\d+]/g, "") : "";
        return `${esc(c.name.trim())}: ${tel ? `<a href="tel:${esc(tel)}">${esc(c.phone.trim())}</a>` : `<a href="mailto:${esc(c.email.trim())}">${esc(c.email.trim())}</a>`}`;
      }).join(" &nbsp;·&nbsp; ")}</p>` : ""}
      ${C.site && isSet(C.site.hashtag) ? `<p class="f-tag">${esc(C.site.hashtag.trim())}</p>` : ""}
      ${creditHTML()}`;
  }

  function creditHTML() {
    const cr = C.credits || {};
    if (!isSet(cr.builderName)) return "";
    const tel = isSet(cr.builderPhone) ? cr.builderPhone.replace(/[^\d+]/g, "") : "";
    return `<div class="f-credit">
      
      <p>${esc(isSet(cr.label) ? cr.label.trim() : "Website designed & developed by")}</p>
      <p class="f-credit-name">${esc(cr.builderName.trim())}</p>
      ${tel ? `<a class="f-credit-phone" href="tel:${esc(tel)}">${ic("phone")} ${esc(cr.builderPhone.trim())}</a>` : ""}
    </div>`;
  }

  /* ==================================================================
     EXTRA MOTION: scroll progress, hero parallax, card tilt, sparkle trail
     ================================================================== */
  function setupMotion() {
    const bar = document.createElement("div");
    bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
    $("#nav").appendChild(bar);
    const mandala = $(".hero-mandala");
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
        if (!REDUCED && mandala && scrollY < innerHeight * 1.2) mandala.style.translate = `-50% calc(-50% + ${scrollY * 0.25}px)`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (REDUCED || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // gentle 3D tilt on cards
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest && e.target.closest(".tilt, .event.in, .portrait");
      $$(".is-tilting").forEach((c) => { if (c !== card) { c.classList.remove("is-tilting"); c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); } });
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add("is-tilting");
      card.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
      card.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
    }, { passive: true });

    // soft golden sparkle trail behind the cursor
    let lastT = 0, live = 0;
    document.addEventListener("pointermove", (e) => {
      if (document.body.classList.contains("is-locked") && !$("#intro").hidden && $("#intro").classList.contains("opening")) return;
      const now = performance.now();
      if (now - lastT < 45 || live > 18) return;
      lastT = now; live++;
      const s = document.createElement("span");
      s.className = "trail";
      s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
      s.style.setProperty("--tx", `${(Math.random() - 0.5) * 30}px`);
      s.style.setProperty("--sz", `${4 + Math.random() * 6}px`);
      document.body.appendChild(s);
      s.addEventListener("animationend", () => { s.remove(); live--; });
    }, { passive: true });
  }

  /* ==================================================================
     COUNTDOWN
     ================================================================== */
  function weddingTarget() {
    if (!parseDay(W.date)) return null;
    const time = fmtTime(W.time) ? W.time.trim().padStart(5, "0") : "00:00";
    const off = /^[+-]\d{2}:\d{2}$/.test(W.utcOffset || "") ? W.utcOffset : "+05:30";
    const d = new Date(`${W.date.trim()}T${time}:00${off}`);
    return isNaN(d) ? null : d;
  }
  function startCountdown() {
    const boxes = ["#countdown", "#countdown-story"].map((q) => $(q)).filter(Boolean);
    const target = weddingTarget();
    const scDate = $("#sc-date");
    if (scDate) scDate.innerHTML = weddingDateText ? esc(weddingDateText) + (fmtTime(W.time) ? ` &middot; ${fmtTime(W.time)}${esc(tz)}` : "") : "";
    if (!target) {
      boxes.forEach((box) => (box.innerHTML = '<p class="cd-msg"><span class="tbd">Countdown begins once the date is announced</span></p>'));
      return;
    }
    const units = [["d", "Days"], ["h", "Hours"], ["m", "Minutes"], ["s", "Seconds"]];
    const sets = boxes.map((box) => {
      box.innerHTML = units.map(([k, l]) => `<div class="cd-unit"><span class="cd-num" data-k="${k}">--</span><span class="cd-lbl">${l}</span></div>`).join("");
      const nodes = {};
      $$(".cd-num", box).forEach((n) => (nodes[n.dataset.k] = n));
      return { box, nodes };
    });
    let timer = 0;
    const done = () => {
      sets.forEach(({ box }) => {
        box.innerHTML = `<p class="cd-msg done">${esc(W.countdownDoneMessage || "Our Forever Begins Today!")}</p>`;
        box.setAttribute("aria-label", "The wedding day has arrived");
      });
      if (window.__sky) window.__sky.burst(40);
    };
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { clearInterval(timer); done(); return; }
      const s = Math.floor(diff / 1000);
      const vals = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
      sets.forEach(({ nodes }) => Object.keys(vals).forEach((k) => {
        const v = k === "d" ? String(vals[k]) : String(vals[k]).padStart(2, "0");
        const n = nodes[k];
        if (n.textContent !== v) {
          n.textContent = v;
          if (!REDUCED) { n.classList.remove("tick"); void n.offsetWidth; n.classList.add("tick"); }
        }
      }));
    };
    tick();
    if (target.getTime() > Date.now()) timer = setInterval(tick, 1000);
  }

  /* ==================================================================
     PETALS & GOLD PARTICLES (canvas)
     ================================================================== */
  const Sky = (function () {
    const cv = $("#sky");
    if (!cv || !cv.getContext || REDUCED) return { burst() {}, start() {} };
    const ctx = cv.getContext("2d");
    let w = 0, h = 0, dpr = 1, items = [], raf = 0, last = 0;
    const PETAL = ["#E8A3B0", "#D9707F", "#F4DDE0", "#C94F63", "#F0B8C2"];
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const make = (kind, burst) => {
      const petal = kind === "petal";
      return {
        petal, burst: !!burst,
        x: burst ? w / 2 + (Math.random() - 0.5) * w * 0.35 : Math.random() * w,
        y: burst ? h * 0.5 + (Math.random() - 0.5) * 80 : petal ? -20 - Math.random() * h : Math.random() * h,
        vx: burst ? (Math.random() - 0.5) * 7 : (Math.random() - 0.5) * 0.3,
        vy: burst ? -2 - Math.random() * 5 : petal ? 0.35 + Math.random() * 0.55 : -(0.1 + Math.random() * 0.25),
        r: petal ? 5 + Math.random() * 6 : 0.8 + Math.random() * 1.6,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.04,
        sway: Math.random() * 6.28, ph: Math.random() * 6.28,
        c: PETAL[(Math.random() * PETAL.length) | 0]
      };
    };
    const seed = () => {
      const area = (w * h) / 1e5;
      const np = Math.round(clamp(area * 1.2, 8, 18)), ns = Math.round(clamp(area * 1.4, 10, 22));
      items = [];
      for (let i = 0; i < np; i++) items.push(make("petal"));
      for (let i = 0; i < ns; i++) items.push(make("spark"));
    };
    const draw = (p, t) => {
      if (p.petal) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.scale(1, 0.6 + 0.4 * Math.abs(Math.sin(p.sway)));
        ctx.globalAlpha = 0.82; ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.moveTo(0, -p.r);
        ctx.bezierCurveTo(p.r * 0.95, -p.r * 0.55, p.r * 0.6, p.r * 0.85, 0, p.r);
        ctx.bezierCurveTo(-p.r * 0.6, p.r * 0.85, -p.r * 0.95, -p.r * 0.55, 0, -p.r);
        ctx.fill(); ctx.restore();
      } else {
        const a = 0.35 + 0.35 * Math.sin(t * 0.002 + p.ph);
        ctx.globalAlpha = a * 0.35; ctx.fillStyle = "#F6E3A8";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, 6.283); ctx.fill();
        ctx.globalAlpha = a; ctx.fillStyle = "#FFF3C4";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    };
    const frame = (t) => {
      const dt = Math.min(3, (t - last) / 16.7 || 1); last = t;
      ctx.clearRect(0, 0, w, h);
      for (let i = items.length - 1; i >= 0; i--) {
        const p = items[i];
        p.sway += 0.012 * dt;
        if (p.burst) { p.vy += 0.07 * dt; p.vx *= 0.99; }
        p.x += (p.vx + Math.sin(p.sway) * (p.petal ? 0.35 : 0.15)) * dt;
        p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.burst && p.y > h + 30) { items.splice(i, 1); continue; }
        if (!p.burst) {
          if (p.petal && p.y > h + 20) { Object.assign(p, make("petal")); p.y = -20; }
          if (!p.petal && p.y < -10) { Object.assign(p, make("spark")); p.y = h + 10; }
          if (p.x < -30) p.x = w + 20; else if (p.x > w + 30) p.x = -20;
        }
        draw(p, t);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    resize(); seed();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); seed(); }, 200); });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    return {
      start,
      burst(n) {
        for (let i = 0; i < (n || 36); i++) items.push(make(Math.random() < 0.7 ? "petal" : "spark", true));
        start();
      }
    };
  })();
  window.__sky = Sky;

  /* ==================================================================
     MUSIC
     ================================================================== */
  const Music = (function () {
    const M = C.music || {};
    const src = safeSrc(M.src);
    const KEY = "wedding-music-pref";
    let audio = null, available = !!src, resume = false;
    const getPref = () => { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } };
    const setPref = (v) => { try { sessionStorage.setItem(KEY, v); } catch (e) { /* storage unavailable */ } };
    const player = $("#player");

    function ui() {
      const playing = !!(audio && available && !audio.paused);
      const label = !available ? "Music unavailable" : playing ? "Pause music" : "Play music";
      $$(".music-toggle").forEach((b) => {
        b.innerHTML = ic(playing ? "pause" : "music");
        b.setAttribute("aria-pressed", String(playing));
        b.setAttribute("aria-label", label);
        b.title = label;
        b.disabled = !available;
      });
      if (!player.hidden) {
        player.classList.toggle("playing", playing);
        player.classList.toggle("unavailable", !available);
        const pp = $(".p-play", player);
        pp.innerHTML = ic(playing ? "pause" : "play");
        pp.setAttribute("aria-label", label);
        pp.disabled = !available;
        const mb = $(".p-mute", player);
        mb.innerHTML = ic(audio && audio.muted ? "mute" : "vol");
        mb.setAttribute("aria-label", audio && audio.muted ? "Unmute" : "Mute");
        mb.setAttribute("aria-pressed", String(!!(audio && audio.muted)));
        mb.disabled = !available;
        $(".p-vol", player).disabled = !available;
        $(".p-title", player).textContent = !available ? "Music unavailable" : isSet(M.title) ? M.title.trim() : playing ? "Now playing" : "Wedding music";
      }
    }
    function play() {
      if (!audio || !available) return;
      const p = audio.play();
      if (p && p.then) p.then(() => setPref("on")).catch(() => ui());
    }
    function pause() { if (audio) { audio.pause(); setPref("off"); } }
    function toggle() { if (audio && !audio.paused) pause(); else play(); }

    function init() {
      if (!src) return;
      audio = new Audio();
      audio.loop = true;
      audio.preload = "none";
      audio.volume = clamp(typeof M.volume === "number" ? M.volume : 0.25, 0, 1);
      audio.addEventListener("error", () => { available = false; try { audio.pause(); } catch (e) { /* ignore */ } ui(); });
      audio.addEventListener("play", ui);
      audio.addEventListener("pause", ui);
      audio.src = src;
      player.innerHTML = `
        <button class="icon-btn p-play" type="button" aria-label="Play music"></button>
        <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="p-title"></span>
        <button class="icon-btn p-mute" type="button" aria-label="Mute" aria-pressed="false"></button>
        <input class="p-vol" type="range" min="0" max="1" step="0.05" value="${audio.volume}" aria-label="Music volume">`;
      $(".p-play", player).addEventListener("click", toggle);
      $(".p-mute", player).addEventListener("click", () => { audio.muted = !audio.muted; ui(); });
      $(".p-vol", player).addEventListener("input", (e) => { audio.volume = Number(e.target.value); if (audio.muted && audio.volume > 0) audio.muted = false; ui(); });
      $$(".music-toggle").forEach((b) => { b.hidden = false; b.addEventListener("click", toggle); });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden && audio && !audio.paused) { resume = true; audio.pause(); }
        else if (!document.hidden && resume) { resume = false; play(); }
      });
      // Pause background music if any other audio/video on the page starts
      document.addEventListener("play", (e) => { if (e.target !== audio && audio && !audio.paused) audio.pause(); }, true);
      ui();
    }
    return {
      init,
      reveal() { if (src) { player.hidden = false; ui(); } },
      onOpen() { if (src && getPref() !== "off") play(); },
      wantsSound() { return getPref() !== "off"; }
    };
  })();

  function chime() {
    const M = C.music || {};
    if (M.openingChime === false || !Music.wantsSound()) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const now = ctx.currentTime;
      [[880, 0], [1318.5, 0.14], [1760, 0.3], [1174.7, 0.5]].forEach(([f, t]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, now + t);
        g.gain.exponentialRampToValueAtTime(0.06, now + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + t + 1.8);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + t); o.stop(now + t + 1.9);
      });
      setTimeout(() => ctx.close && ctx.close(), 2800);
    } catch (e) { /* audio not available — silently skip */ }
  }

  /* ==================================================================
     OPENING
     ================================================================== */
  function setupIntro() {
    const intro = $("#intro");
    const lockables = [$("#nav"), $("#main"), $("#footer")];
    lockables.forEach((el) => el.setAttribute("inert", ""));
    let opened = false;
    $("#open-btn").addEventListener("click", () => {
      if (opened) return;
      opened = true;
      chime();
      Music.onOpen();
      Sky.burst(38);
      intro.classList.add("opening");
      lockables.forEach((el) => el.removeAttribute("inert"));
      document.body.classList.remove("is-locked");
      const hero = $("#home");
      setTimeout(() => hero.classList.add("play"), REDUCED ? 0 : 650);
      setTimeout(() => {
        intro.hidden = true;
        Music.reveal();
        $("#hero-names").focus({ preventScroll: true });
      }, REDUCED ? 0 : 1750);
    });
    setTimeout(() => $("#open-btn").focus({ preventScroll: true }), 300);
    Sky.start();
  }

  /* ==================================================================
     NAVIGATION
     ================================================================== */
  function setupNav() {
    const nav = $("#nav"), btn = $("#menu-btn");
    const setOpen = (o) => {
      nav.classList.toggle("open", o);
      btn.setAttribute("aria-expanded", String(o));
      btn.setAttribute("aria-label", o ? "Close menu" : "Open menu");
      btn.innerHTML = ic(o ? "x" : "menu");
    };
    btn.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    $$("#nav-links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); btn.focus(); } });
    document.addEventListener("click", (e) => { if (nav.classList.contains("open") && !e.composedPath().includes(nav)) setOpen(false); });
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if ("IntersectionObserver" in window) {
      const links = new Map($$("#nav-links a").map((a) => [a.getAttribute("href").slice(1), a]));
      const map = {};
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const id = map[en.target.id] || en.target.id;
          const a = links.get(id);
          if (!a) return;
          links.forEach((l) => { l.classList.remove("active"); l.removeAttribute("aria-current"); });
          a.classList.add("active");
          a.setAttribute("aria-current", "true");
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      $$("main > section").forEach((s) => io.observe(s));
    }
  }

  /* ==================================================================
     SCROLL REVEALS
     ================================================================== */
  function setupReveal() {
    const els = $$(".reveal, .g-item");
    if (!("IntersectionObserver" in window) || REDUCED) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach((e) => io.observe(e));
    window.__observeReveal = (list) => list.forEach((e) => io.observe(e));
  }

  /* ==================================================================
     GALLERY & LIGHTBOX
     ================================================================== */
  function setupGallery() {
    const Gc = C.gallery || {};
    const cats = Array.isArray(Gc.categories) ? Gc.categories : [];
    const imgs = (Array.isArray(Gc.images) ? Gc.images : []).filter((i) => i && safeSrc(i.src));
    const grid = $("#gallery-grid"), chips = $("#gallery-chips");

    if (!imgs.length) {
      const labels = (cats.length ? cats : [{ label: "Couple" }]).slice(0, 6);
      grid.innerHTML = labels.map((c) => `<div class="g-item g-ph" aria-hidden="true">${placeholder(c.label)}</div>`).join("") +
        '<p class="g-empty">Our photographs will be shared here soon.</p>';
      return;
    }

    let current = "all", visible = imgs;
    const present = cats.filter((c) => imgs.some((i) => i.category === c.id));
    if (present.length > 1) {
      chips.innerHTML = `<button class="chip" type="button" data-cat="all" aria-pressed="true">All</button>` +
        present.map((c) => `<button class="chip" type="button" data-cat="${esc(c.id)}" aria-pressed="false">${esc(c.label)}</button>`).join("");
      chips.addEventListener("click", (e) => {
        const b = e.target.closest(".chip");
        if (!b) return;
        current = b.dataset.cat;
        $$(".chip", chips).forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
        draw();
      });
    }
    function draw() {
      visible = current === "all" ? imgs : imgs.filter((i) => i.category === current);
      grid.innerHTML = visible.map((it, k) => {
        const alt = isSet(it.alt) ? it.alt : isSet(it.caption) ? it.caption : "Wedding photograph";
        return `<button class="g-item" type="button" data-i="${k}" aria-label="Open photo: ${esc(alt)}" style="transition-delay:${(k % 4) * 80}ms">
          <img src="${esc(safeSrc(it.src))}" alt="${esc(alt)}" loading="lazy" decoding="async">
          ${isSet(it.caption) ? `<span class="g-cap">${esc(it.caption.trim())}</span>` : ""}
        </button>`;
      }).join("");
      const items = $$(".g-item", grid);
      if (window.__observeReveal && !REDUCED) window.__observeReveal(items); else items.forEach((i) => i.classList.add("in"));
      $$("img", grid).forEach((im) => im.addEventListener("error", () => { const b = im.closest(".g-item"); if (b) b.remove(); }));
    }
    grid.addEventListener("click", (e) => {
      const b = e.target.closest(".g-item[data-i]");
      if (b) LB.open(visible, Number(b.dataset.i), b);
    });
    draw();
  }

  const LB = (function () {
    const box = $("#lightbox"), img = $("#lb-img"), cap = $("#lb-cap"), count = $("#lb-count");
    let list = [], i = 0, opener = null, sx = 0;
    const render = () => {
      const it = list[i];
      img.removeAttribute("src");
      img.alt = isSet(it.alt) ? it.alt : isSet(it.caption) ? it.caption : "Wedding photograph";
      img.src = safeSrc(it.src);
      cap.textContent = isSet(it.caption) ? it.caption.trim() : "";
      count.textContent = `${i + 1} / ${list.length}`;
      $("#lb-prev").hidden = $("#lb-next").hidden = list.length < 2;
    };
    const go = (d) => { if (list.length > 1) { i = (i + d + list.length) % list.length; render(); } };
    const close = () => { box.hidden = true; document.body.classList.remove("lb-open"); if (opener) opener.focus(); };
    img.addEventListener("error", () => { if (img.getAttribute("src")) cap.textContent = "This photograph could not be loaded."; });
    $("#lb-close").addEventListener("click", close);
    $("#lb-prev").addEventListener("click", () => go(-1));
    $("#lb-next").addEventListener("click", () => go(1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    box.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
    document.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "Tab") {
        const f = $$("button:not([hidden])", box);
        const idx = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    return {
      open(l, k, from) { list = l; i = k; opener = from; box.hidden = false; document.body.classList.add("lb-open"); render(); $("#lb-close").focus(); }
    };
  })();

  /* ==================================================================
     RSVP (WhatsApp / email — nothing is stored on a server)
     ================================================================== */
  function setupRSVP() {
    const Rv = C.rsvp || {};
    const wa = isSet(Rv.whatsappNumber) ? Rv.whatsappNumber.replace(/\D/g, "") : "";
    const mail = isSet(Rv.email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Rv.email.trim()) ? Rv.email.trim() : "";
    const max = clamp(parseInt(Rv.maxGuests, 10) || 10, 1, 50);
    const deadline = fmtDate(Rv.deadline);
    $("#rsvp-lead").innerHTML = (deadline ? `Kindly respond by <strong>${esc(deadline)}</strong>. ` : "") +
      "Your reply opens ready to send — nothing is stored on this website.";

    const evChecks = EVENTS.map((e, k) => `<label><input type="checkbox" name="events" value="${esc(isSet(e.name) ? e.name.trim() : "Event " + (k + 1))}" checked><span>${show(e.name, "Event " + (k + 1))}</span></label>`).join("");
    const buttons = [
      wa ? `<button class="btn btn-gold" type="submit" data-via="whatsapp">${ic("chat")} Send via WhatsApp</button>` : "",
      mail ? `<button class="btn ${wa ? "btn-outline" : "btn-gold"}" type="submit" data-via="email">${ic("mail")} Send via Email</button>` : "",
      !wa && !mail ? `<button class="btn btn-gold" type="submit" data-via="none">Send RSVP</button>` : ""
    ].join("");

    $("#rsvp-root").innerHTML = `
      <form class="rsvp-card reveal" id="rsvp-form" novalidate>
        <div class="field"><label for="r-name">Your name <span aria-hidden="true">*</span></label>
          <input type="text" id="r-name" name="name" autocomplete="name" required maxlength="80" aria-describedby="e-name"><p class="err" id="e-name"></p></div>
        <div class="field"><label for="r-contact">Phone or email <span class="opt">(optional)</span></label>
          <input type="text" id="r-contact" name="contact" autocomplete="tel" maxlength="80"></div>
        <fieldset class="field full"><legend>Will you join us? <span aria-hidden="true">*</span></legend>
          <div class="choice">
            <label><input type="radio" name="attend" value="yes" aria-describedby="e-attend"><span>${ic("heart")} Accepts with pleasure</span></label>
            <label><input type="radio" name="attend" value="no" aria-describedby="e-attend"><span>Regretfully declines</span></label>
          </div><p class="err" id="e-attend"></p></fieldset>
        <div class="field"><label for="r-guests">Number of guests <span aria-hidden="true">*</span></label>
          <input type="number" id="r-guests" name="guests" min="1" max="${max}" value="1" inputmode="numeric" aria-describedby="e-guests"><p class="err" id="e-guests"></p></div>
        ${EVENTS.length ? `<fieldset class="field full" id="r-events"><legend>Celebrations you'll attend</legend><div class="checks">${evChecks}</div><p class="err" id="e-events"></p></fieldset>` : ""}
        <div class="field full"><label for="r-msg">Message for the couple <span class="opt">(optional)</span></label>
          <textarea id="r-msg" name="message" rows="3" maxlength="500"></textarea></div>
        <div class="rsvp-actions">${buttons}</div>
        <p class="rsvp-status" id="rsvp-status" role="status" aria-live="polite"></p>
      </form>`;

    const form = $("#rsvp-form"), status = $("#rsvp-status");
    const setErr = (id, msg, input) => {
      $("#" + id).textContent = msg;
      if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    };
    form.addEventListener("change", (e) => {
      if (e.target.name === "attend") {
        const no = e.target.value === "no";
        $("#r-guests").disabled = no;
        $$('input[name="events"]', form).forEach((c) => (c.disabled = no));
        setErr("e-attend", "");
      }
    });
    let via = "";
    $$('button[type="submit"]', form).forEach((b) => b.addEventListener("click", () => (via = b.dataset.via)));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.className = "rsvp-status"; status.textContent = "";
      const name = $("#r-name").value.trim();
      const attend = (form.querySelector('input[name="attend"]:checked') || {}).value;
      const guestsEl = $("#r-guests");
      const guests = Number(guestsEl.value);
      const chosen = $$('input[name="events"]:checked', form).map((c) => c.value);
      let ok = true, first = null;
      const fail = (id, msg, el) => { setErr(id, msg, el); ok = false; first = first || el; };
      if (name.length < 2) fail("e-name", "Please enter your name.", $("#r-name")); else setErr("e-name", "", $("#r-name"));
      if (!attend) fail("e-attend", "Please let us know if you can attend.", form.querySelector('input[name="attend"]')); else setErr("e-attend", "");
      if (attend === "yes") {
        if (!Number.isInteger(guests) || guests < 1 || guests > max) fail("e-guests", `Please enter a number between 1 and ${max}.`, guestsEl);
        else setErr("e-guests", "", guestsEl);
        if (EVENTS.length && !chosen.length) fail("e-events", "Please choose at least one celebration.", $('input[name="events"]', form));
        else if (EVENTS.length) setErr("e-events", "");
      } else { setErr("e-guests", "", guestsEl); if (EVENTS.length) setErr("e-events", ""); }
      if (!ok) { if (first) first.focus(); return; }

      const channel = via || (wa ? "whatsapp" : mail ? "email" : "none");
      if (channel === "none") {
        status.className = "rsvp-status warn";
        status.textContent = "Online RSVP hasn't been set up yet — please reply to the family directly. Your response has not been sent.";
        return;
      }
      const couple = namesSet ? `${groomShort} & ${brideShort}` : "the couple";
      const lines = [
        `RSVP — Wedding of ${couple}`,
        `Name: ${name}`,
        `Response: ${attend === "yes" ? "Accepts with pleasure" : "Regretfully declines"}`
      ];
      if (attend === "yes") {
        lines.push(`Number of guests: ${guests}`);
        if (chosen.length) lines.push(`Attending: ${chosen.join(", ")}`);
      }
      const contact = $("#r-contact").value.trim();
      if (contact) lines.push(`Contact: ${contact}`);
      const msg = $("#r-msg").value.trim();
      if (msg) lines.push(`Message: ${msg}`);
      const text = lines.join("\n");

      const url = channel === "whatsapp"
        ? `https://wa.me/${wa}?text=${encodeURIComponent(text)}`
        : `mailto:${mail}?subject=${encodeURIComponent(`RSVP — ${name}`)}&body=${encodeURIComponent(text)}`;
      const a = document.createElement("a");
      a.href = url;
      if (channel === "whatsapp") { a.target = "_blank"; a.rel = "noopener"; }
      document.body.appendChild(a); a.click(); a.remove();

      status.className = "rsvp-status ok";
      status.textContent = channel === "whatsapp"
        ? `Thank you, ${name}! Your reply is ready in WhatsApp — please press Send there to deliver it to the family.`
        : `Thank you, ${name}! Your reply is ready in your email app — please press Send there to deliver it to the family.`;
    });
  }

  /* ==================================================================
     INIT
     ================================================================== */
  function init() {
    renderStatic();
    renderIntro();
    renderHero();
    renderStory();
    renderFamily();
    renderFamilyBlessing();
    renderEvents();
    renderVenue();
    renderClosing();
    setupNav();
    setupMotion();
    setupReveal();
    setupGallery();
    startCountdown();
    Music.init();
    setupIntro();
    if (REDUCED) $("#home").classList.add("play");
    const missing = [];
    if (!namesSet) missing.push("bride / groom names");
    if (!weddingTarget()) missing.push("wedding date & time");
    if (missing.length) console.info("[Wedding invitation] Still to fill in js/config.js:", missing.join(", "));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
