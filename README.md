# Indian Wedding Invitation Website

A premium, animated, fully static wedding invitation. It has no backend, database or build step, and every wedding detail lives in **`js/config.js`**.

```
wedding-invitation/
├── index.html          ← page structure (no wedding details inside)
├── css/style.css       ← all styling & animations
├── js/config.js        ← ★ EDIT THIS: names, dates, events, family, photos, music
├── js/main.js          ← behaviour (no need to edit)
└── assets/
    ├── images/         ← bride.jpg, groom.jpg, couple.jpg, bride-parents.jpg, groom-parents.jpg, mandap.jpg …
    │   └── gallery/    ← gallery photos
    ├── audio/          ← wedding-music.mp3
    └── decorations/    ← optional extra artwork
```

## 1. Open the website

- **Simplest:** double-click `index.html`.
- **Recommended while editing:** open the folder in VS Code and use the **Live Server** extension ("Go Live"). The page reloads each time you save.

## 2. How config.js works

- Every value set to `REPLACE_WITH_ACTUAL_DETAILS` or `""` counts as **not set**:
  - Optional details are **hidden**: dress codes, parking, map links, messages, photos, the blessing.
  - Essential details show a soft *italic placeholder* such as "Date to be announced", so the page never shows invented information.
- Formats:
  - Dates: `"YYYY-MM-DD"`
  - Times: `"HH:MM"` in 24-hour time, e.g. `"19:30"`
  - Links: full `https://` URLs
- Open the browser console (F12). It lists the essentials you still need to fill in.

## 3. Bride and groom names

In `bride` and `groom`:

```js
fullName:    "Anaya Sharma",   // shown in Our Story
displayName: "Anaya",          // shown large on the opening screen & hero
nickname:    "Annu",           // optional
father:      "Mr. Rajesh Sharma",
mother:      "Mrs. Sunita Sharma",
familyIntro: "",               // optional
description: "",               // optional
```

## 4. Wedding date, time and countdown

```js
wedding: {
  date: "2026-12-12",
  time: "19:30",
  utcOffset: "+05:30",         // time zone of the venue (India = +05:30)
  timeZoneLabel: "IST",
  city: "Udaipur", venueName: "…", address: "…",
  mapUrl: "https://maps.app.goo.gl/…"
}
```

The countdown runs to this exact moment in the venue's time zone, whatever time zone the guest is in. At zero it shows `countdownDoneMessage`. Without a date, it shows a placeholder.

## 5. Events (Mehndi, Haldi, Sangeet, Baraat, Wedding, Reception)

Each event in the `events` list has these fields:

```js
{ id: "sangeet", visible: true, theme: "sangeet",
  name: "Sangeet Ceremony", date: "2026-12-10", time: "19:00",
  venueName: "…", address: "…", mapUrl: "https://…",
  description: "…", dressCode: "Indo-western, shades of purple",
  photo: "",                                   // optional — an illustration is drawn otherwise
  details: [{ label: "Dinner & programme", value: "Dinner from 8 PM" }] }
```

- **Reorder** events by moving them in the list.
- **Hide** an event with `visible: false`.
- **Add** an event by copying a block. The `theme` sets the colours and illustration: `mehndi`, `haldi`, `sangeet`, `baraat`, `wedding` or `reception`.
- The day of the week is calculated automatically.
- The timeline and the RSVP event checkboxes update automatically.

## 6. Parents and family members

Parents come from `bride.father`, `bride.mother`, `groom.father` and `groom.mother`. They appear in Our Story, the Parents' Invitation and the Family section.

Add other relatives under `family.bride` and `family.groom`:

```js
family: {
  bride: [
    { group: "grandparents", name: "Smt. Kamala Devi", relation: "Grandmother", photo: "", message: "" },
    { group: "siblings",     name: "Aarav Sharma",     relation: "Brother" }
  ],
  groom: [ … ]
}
```

- `group` can be `grandparents`, `siblings`, `uncles-aunts`, `cousins` or `others`.
- People without a photo get elegant initials.

## 7. Photographs

1. Put your images in `assets/images/`. JPG/WebP about 1200–1600 px on the long side keeps the site fast.
2. Point the config to them, for example:
   - `bride.photo: "assets/images/bride.jpg"`
   - `groom.photo`
   - `couple.photo` (also used on the opening screen)
   - **Home screen background:** save the groom's photo as `assets/images/hero-groom.jpg` (left side) and the bride's as `assets/images/hero-bride.jpg` (right side). The paths are already set in `couple.heroGroomPhoto` / `couple.heroBridePhoto`. They appear soft and maroon-tinted, fading toward the centre. Tall portrait photos with the face in the upper third work best. Until the files exist, a gold line-art groom and bride is shown.
   - `bride.parentsPhoto`, `groom.parentsPhoto` — both parents together, shown large in the Parents' Invitation
   - `bride.fatherPhoto`, `bride.motherPhoto`, `groom.fatherPhoto`, `groom.motherPhoto` — shown in the arched frames of the Family section
   - an event's `photo`, e.g. `"assets/images/mandap.jpg"`
3. **Gallery:** put photos in `assets/images/gallery/` and list them:

```js
gallery: { images: [
  { src: "assets/images/gallery/couple-01.jpg", category: "couple", caption: "Our engagement" },
  { src: "assets/images/gallery/bride-01.jpg",  category: "bride" }
]}
```

Categories are `bride`, `groom`, `couple`, `engagement`, `family`, `prewedding` and `celebration`. Filter buttons appear only for categories that have photos.

Until a photo is set, a clearly labelled "Photo to be added" frame is shown. If a path is wrong, the page falls back to that frame instead of showing a broken image. File names are case-sensitive on most hosts, so `Bride.JPG` is not the same as `bride.jpg`.

## 8. Background music

1. Copy a track you have permission to use to `assets/audio/wedding-music.mp3`.
2. In the config, set `music.src: "assets/audio/wedding-music.mp3"` and optionally `music.title`.

How it behaves:

- Music never autoplays. It starts only when the guest taps **Open Wedding Invitation**, and loops at a low volume (`music.volume`).
- Guests can play, pause, mute and change the volume. On phones the music button is in the top bar.
- The choice is remembered for the browser session.
- It pauses when the tab is hidden and resumes when the guest returns.
- A soft bell chime plays on opening. Turn it off with `openingChime: false`.
- If `src` is empty the player is hidden. If the file is missing, the player shows "Music unavailable".

## 10. Venue and Google Maps

1. Open the venue in Google Maps.
2. Tap **Share → Copy link**.
3. Paste the link into `wedding.mapUrl`, or into an event's `mapUrl`.

"Get Directions" and "View Location" buttons appear only when a link is set. Parking, accommodation and `contacts` show only when filled in.

## 11. Wording

Everything under `text` is editable:

- `openingHeading`
- `openButton`
- `heroLine`
- `parentsInvitation` (shown under the Family section, followed by the couple's names)
- `blessing` and `blessingAttribution` (the blessing section appears only when `blessing` is set)
- `thankYou`

## 12. Website credit

The footer shows the builder credit from `credits` in `config.js`:

```js
credits: { label: "Website designed & developed by", builderName: "Amrit Punasya", builderPhone: "4384384384" }
```

The phone number is a tap-to-call link. Set `builderName: ""` to hide the credit.

## 13. Deploy (free)

**Netlify:** go to app.netlify.com → *Add new site → Deploy manually* → drag the `wedding-invitation` folder onto the page. Done.

**GitHub Pages:**

1. Create a repository and upload the *contents* of this folder, so `index.html` is at the top level.
2. Go to *Settings → Pages → Build and deployment*, choose *Deploy from a branch*, then `main` and `/ (root)`.
3. The site appears at `https://<username>.github.io/<repository>/` within a minute or two.

**Vercel:** import the repository with framework preset **Other** and no build command.

## Notes

- **Fonts** (Cormorant Garamond, Livvic, Great Vibes) load from Google Fonts. If they are unavailable, the page falls back to Georgia and system fonts.
- **Reduced motion:** with "reduce motion" turned on in the device settings, petals, particles and entrance animations are switched off.
- **Browser support:** the site works in current Chrome, Edge, Safari and Firefox on mobile and desktop.
