/* Family section — new design (banner + arch photo + florals).
   Loads AFTER main.js and replaces the old family cards. */
(function () {
  "use strict";
  const C = window.WEDDING_CONFIG || {};
  const B = C.bride || {}, G = C.groom || {};
  const ok = (v) => typeof v === "string" && v.trim() !== "" && v.indexOf("REPLACE_WITH") === -1;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rep = (n, inner, off) =>
    Array.from({ length: n }, (_, k) => `<g transform="rotate(${((k * 360) / n + (off || 0)).toFixed(2)})">${inner}</g>`).join("");

  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="fv-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E3A8"/><stop offset=".5" stop-color="#D4AF65"/><stop offset="1" stop-color="#A57F35"/></linearGradient>
    <symbol id="fv-peony" viewBox="-20 -20 40 40">
      <g fill="#E58CA5">${rep(8, '<ellipse cy="-11" rx="6.5" ry="9"/>')}</g>
      <g fill="#F2A9BC">${rep(7, '<ellipse cy="-7" rx="5" ry="7"/>', 20)}</g>
      <g fill="#F8C9D4">${rep(6, '<ellipse cy="-4" rx="3.4" ry="5"/>', 10)}</g>
      <circle r="2" fill="#E7B04A"/>
    </symbol>
    <symbol id="fv-peony-w" viewBox="-20 -20 40 40">
      <g fill="#FFFFFF" stroke="#E9DCCB" stroke-width=".4">${rep(8, '<ellipse cy="-11" rx="6.5" ry="9"/>')}</g>
      <g fill="#FBF4EA" stroke="#E9DCCB" stroke-width=".3">${rep(7, '<ellipse cy="-7" rx="5" ry="7"/>', 20)}</g>
      <g fill="#F1E4D2">${rep(6, '<ellipse cy="-4" rx="3.4" ry="5"/>', 10)}</g>
      <circle r="2" fill="#E7B04A"/>
    </symbol>
    <symbol id="fv-leaf" viewBox="-6 -16 12 32"><path d="M0 15C-8 6-7-6 0-15C7-6 8 6 0 15Z" fill="#7FA36B"/><path d="M0 14V-10" stroke="#5E8452" stroke-width=".6"/></symbol>
    <symbol id="fv-lantern" viewBox="0 0 40 80">
      <path d="M20 0V16" stroke="#D4AF65" stroke-width="1.2"/>
      <path d="M12 22Q20 10 28 22Z" fill="url(#fv-gold)"/>
      <rect x="11" y="22" width="18" height="30" rx="3" fill="#F6E3A8" fill-opacity=".55" stroke="url(#fv-gold)" stroke-width="2"/>
      <path d="M20 22V52M11 37H29" stroke="url(#fv-gold)" stroke-width="1"/>
      <path d="M13 52H27L24 60H16Z" fill="url(#fv-gold)"/><circle cx="20" cy="66" r="2.4" fill="url(#fv-gold)"/>
    </symbol>
    <symbol id="fv-star" viewBox="-10 -10 20 20"><path d="M0-10Q1.6-1.6 10 0Q1.6 1.6 0 10Q-1.6 1.6-10 0Q-1.6-1.6 0-10Z" fill="currentColor"/></symbol>
    <clipPath id="fv-clip" clipPathUnits="objectBoundingBox"><path d="M0 1V.36Q0 .27 .08 .25Q.19 .22 .26 .12Q.35 .02 .5 0Q.65 .02 .74 .12Q.81 .22 .92 .25Q1 .27 1 .36V1Z"/></clipPath>
  </defs></svg>`;

  const leaves = (pts) => pts.map(([x, y, a]) => `<use href="#fv-leaf" x="-8" y="-20" width="16" height="40" transform="translate(${x} ${y}) rotate(${a})"/>`).join("");
  const bloomTop = `<svg viewBox="0 0 200 150" aria-hidden="true" focusable="false">
    ${leaves([[120, 40, 60], [150, 70, 80], [60, 120, 20], [100, 100, 45], [30, 130, 5]])}
    <use href="#fv-peony" x="-6" y="-8" width="92" height="92"/><use href="#fv-peony-w" x="70" y="-14" width="70" height="70"/>
    <use href="#fv-peony-w" x="-10" y="70" width="64" height="64"/><use href="#fv-peony" x="60" y="62" width="46" height="46"/></svg>`;
  const bloomBottom = `<svg viewBox="0 0 220 200" aria-hidden="true" focusable="false">
    ${leaves([[30, 150, -35], [55, 120, -10], [85, 95, 20], [125, 80, 45], [20, 90, -60], [75, 150, 30], [150, 120, 70]])}
    <use href="#fv-peony-w" x="-2" y="100" width="92" height="92"/><use href="#fv-peony" x="70" y="116" width="72" height="72"/>
    <use href="#fv-peony-w" x="12" y="40" width="58" height="58"/><use href="#fv-peony" x="104" y="60" width="46" height="46"/>
    <use href="#fv-peony-w" x="130" y="130" width="46" height="46"/></svg>`;

  function decor(side) {
    const o = side === "groom" ? "l" : "r";
    return `
      <svg class="fv-drape d-${o}" viewBox="0 0 90 320" aria-hidden="true" focusable="false">
        <defs><linearGradient id="fv-dr-${side}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2B9C4"/><stop offset=".5" stop-color="#FBDDE2"/><stop offset="1" stop-color="#F0A9B7"/></linearGradient></defs>
        <path d="M0 0H70Q58 60 64 120Q70 170 50 220Q44 260 56 320H0Z" fill="url(#fv-dr-${side})"/>
        <path d="M20 0Q10 80 22 160T16 320M42 0Q34 90 46 170T40 320" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
        <path d="M0 130Q40 150 62 128" fill="none" stroke="#D4AF65" stroke-width="3"/>
      </svg>
      <svg class="fv-lantern ln1 d-${o}" viewBox="0 0 40 80" aria-hidden="true" focusable="false"><use href="#fv-lantern"/></svg>
      <svg class="fv-lantern ln2 d-${o}" viewBox="0 0 40 80" aria-hidden="true" focusable="false"><use href="#fv-lantern"/></svg>
      <div class="fv-pos fv-top-w d-${o}">${bloomTop}</div>
      <div class="fv-pos fv-bl">${bloomBottom}</div>
      <div class="fv-pos fv-br">${bloomBottom}</div>`;
  }

  function card(title, src, side) {
    const img = ok(src) ? `<img src="${esc(src.trim())}" alt="${esc(title)}" loading="lazy" decoding="async">` : "";
    return `<article class="fam-v3" aria-label="${esc(title)}">
      <div class="fv-frame">
        ${decor(side)}
        <h3 class="fv-banner"><span class="fv-star t"><svg aria-hidden="true"><use href="#fv-star"/></svg></span>${esc(title)}<span class="fv-star b"><svg aria-hidden="true"><use href="#fv-star"/></svg></span></h3>
        <div class="fv-arch">
          <div class="fv-photo"><div class="fv-ph"><span>${esc(title)} photo</span></div>${img}</div>
          <svg class="fv-outline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M1 100V36Q1 27 9 25Q20 22 27 12Q36 2 50 1Q64 2 73 12Q80 22 91 25Q99 27 99 36V100" fill="none" stroke="#D4AF65" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
        </div>
      </div>
    </article>`;
  }

  function render() {
    const box = document.getElementById("families");
    if (!box) return;
    document.body.insertAdjacentHTML("beforeend", DEFS);
    box.innerHTML = card("The Groom's Family", G.familyPhoto, "groom") + card("The Bride's Family", B.familyPhoto, "bride");
    box.querySelectorAll(".fv-photo img").forEach((im) => im.addEventListener("error", () => im.remove()));
    const items = Array.from(box.querySelectorAll(".fam-v3"));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
      items.forEach((i) => io.observe(i));
    } else items.forEach((i) => i.classList.add("in"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();