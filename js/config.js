/* =====================================================================
   WEDDING CONFIGURATION
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit to personalise the invitation.

   • Any value left as REPLACE_WITH_ACTUAL_DETAILS (or "") counts as "not set":
       – optional details (dress code, parking, map links, messages, photos…)
         are hidden automatically;
       – essential details (names, dates, venues) show a soft italic
         placeholder so the layout still looks complete while you fill it in.
   • Dates : "YYYY-MM-DD"          e.g. "2026-12-12"
   • Times : "HH:MM" (24-hour)     e.g. "19:30"
   • Photos: path relative to index.html, e.g. "assets/images/bride.jpg"
   • Links : full https:// URL (Google Maps "Share → Copy link" works)
   ===================================================================== */
(function () {
  "use strict";
  const R = "REPLACE_WITH_ACTUAL_DETAILS";

  window.WEDDING_CONFIG = {
    /* ---------------------------------------------------------------
       Site basics
       --------------------------------------------------------------- */
    site: {
      title: "Wedding Invitation",     // browser tab title when names are not set
      hashtag: ""                       // optional, e.g. "#AnayaWedsRohan"
    },

    /* ---------------------------------------------------------------
       The bride
       --------------------------------------------------------------- */
    bride: {
      fullName: "Shivani Patwariya",                      // e.g. "Anaya Sharma"
      displayName: "Shivani",                   // short name for big headings, e.g. "Anaya"
      nickname: "",                     // optional
      father: "Mr. Totaram Patwariya",                        // e.g. "Mr. Rajesh Sharma"
      mother: "Mrs. Anita Patwariya",                        // e.g. "Mrs. Sunita Sharma"
      familyIntro: "",                  // optional, e.g. "Granddaughter of … , from Jaipur"
      description: "",                  // optional, a few warm sentences
      photo: "assets/images/gallery/bride.png",                        // e.g. "assets/images/bride.jpg"
      parentsPhoto: "",                 // both parents together, e.g. "assets/images/bride-parents.jpg"
      fatherPhoto: "assets/images/gallery/bride-father.png",                  // e.g. "assets/images/bride-father.jpg"  (Family section)
      motherPhoto: "assets/images/gallery/bride-mother.png",
      familyPhoto: "assets/images/gallery/bride-family.png"                  // e.g. "assets/images/bride-mother.jpg"  (Family section)
    },

    /* ---------------------------------------------------------------
       The groom
       --------------------------------------------------------------- */
    groom: {
      fullName: "Shubham Dogaya",
      displayName: "Shubham",
      nickname: "",
      father: " Mr. Premlal Dogaya",
      mother: " Mrs. Basu Dogaya",
      familyIntro: "",
      description: "",
      photo: "assets/images/gallery/groom.png",                        // e.g. "assets/images/groom.jpg"
      parentsPhoto: "",                 // e.g. "assets/images/groom-parents.jpg"
      fatherPhoto: "",                  // e.g. "assets/images/groom-father.jpg"
      motherPhoto: "",                  // e.g. "assets/images/groom-mother.jpg"
      familyPhoto: "assets/images/gallery/groom-family.png"
    },

    /* ---------------------------------------------------------------
       The couple
       --------------------------------------------------------------- */
    couple: {
      photo: "assets/images/gallery/couple.png",
      startCardPhoto: "assets/images/gallery/start-card1.png",                     // e.g. "assets/images/couple.jpg" (also used on the opening screen)
      // Faint background photos on the home screen — groom on the LEFT, bride on the RIGHT.
      // Put your photos in assets/images/ with these exact names (tall portrait photos work best).
      // Until the files exist, a gold line-art groom & bride is shown instead.
      heroGroomPhoto: "assets/images/gallery/hero-groom.png",
      heroBridePhoto: "assets/images/gallery/hero-bride1.png",
      heading: "Two Hearts, One Beautiful Journey",
      story: ""                         // your love story / introduction — leave "" to hide
    },

    /* ---------------------------------------------------------------
       Main wedding ceremony — drives the countdown & venue section
       --------------------------------------------------------------- */
    wedding: {
      date: "2026-12-01",               // "YYYY-MM-DD" — 1 December 2026
      time: R,                          // "HH:MM" 24-hour, e.g. "19:30"
      utcOffset: "+05:30",              // time zone of the venue (India = +05:30)
      timeZoneLabel: "IST",             // shown next to times
      city: R,                          // e.g. "Udaipur, Rajasthan"
      venueName: "Pidhay Bujurg",
      address: R,
      mapUrl: "",                       // Google Maps link for "Get Directions"
      parking: "",                      // optional
      accommodation: "",                // optional
      countdownDoneMessage: "Our Forever Begins Today!"
    },

    /* ---------------------------------------------------------------
       Invitation wording (all editable)
       --------------------------------------------------------------- */
    text: {
      openingHeading: "Together with Our Families",
      openButton: "Open Wedding Invitation",
      heroLine: "joyfully invite you to celebrate our wedding",
      parentsInvitation: "With the blessings of Maa Narmada and our parents, and the love of our families, we joyfully invite you to celebrate our wedding.",
      blessing: "",                     // a blessing or quotation chosen by the family — "" hides the section
      blessingAttribution: "",          // optional
      thankYou: "Your presence, blessings, and love mean the world to us."
    },

    /* ---------------------------------------------------------------
       EVENTS — shown in this order. Add, remove, reorder freely.
       visible: false hides an event everywhere (cards, timeline, RSVP).
       theme: mehndi | haldi | sangeet | baraat | wedding | reception
       details: extra lines shown only when value is filled in.
       --------------------------------------------------------------- */
    events: [
      {
        id: "mehndi", visible: true, theme: "mehndi",
        name: "Mehndi Ceremony",
        date: "2026-11-29", time: "18:00",
        venueName: "Morghadi", address: R, mapUrl: "",
        description: "Join us as henna, colour and laughter begin the celebrations.",
        dressCode: "Lavender",                  // e.g. "Shades of green & yellow"
        photo: "",                      // optional — an illustration is drawn when empty
        details: []
      },
      {
        id: "haldi", visible: true, theme: "haldi",
        name: "Haldi Ceremony",
        date: "2026-11-30", time: "18:00",
        venueName: "Morghadi", address: R, mapUrl: "",
        description: "A evening of turmeric, marigolds and blessings for the couple.",
        dressCode: "Pink",
        photo: "",
        details: []
      },
          {
        id: "baraat", visible: true, theme: "baraat",
        name: "Baraat",
        date: "2026-12-01", time: "08:00",
        venueName: "Pidhay Bujurg",                   // starting location
        address: R,
        mapUrl: "https://maps.app.goo.gl/9BPCc83j7o7LGg1c8",
        description: "Dance with us as the groom's procession arrives in royal style.",
        dressCode: "",
        photo: "",
        details: [
          { label: "Route / meeting point", value: "" },
          { label: "Arriving at", value: "" },
          { label: "Special instructions", value: "" }
        ]
      },
       {
        id: "wedding", visible: true, theme: "wedding",
        name: "Wedding Ceremony",
        date: "2026-12-01", time: "11:00",               // usually the same as wedding.date / wedding.time
        venueName: "Pidhay Bujurg", address: R, mapUrl: "https://maps.app.goo.gl/9BPCc83j7o7LGg1c8",
        description: "We would be honoured by your presence as we take our pheras and begin our life together.",
        dressCode: "",
        photo: "",                      // e.g. "assets/images/mandap.jpg"
        details: [
          { label: "Ceremony details", value: "" }
        ]
      },
      {
        id: "sangeet", visible: true, theme: "sangeet",
        name: "Sangeet Ceremony",
        date: "2026-12-01", time: "18:00",
        venueName: "Morghadi", address: R, mapUrl: "",
        description: "An evening of music, dance and joyful performances by us.",
        dressCode: "",
        photo: "",
        details: []
      },
  
     
      {
        id: "reception", visible: true, theme: "reception",
        name: "Reception",
        date: "2026-12-02", time: "09:00",
        venueName: "Morghadi", address: R, mapUrl: "https://maps.app.goo.gl/Py7NuVpFkoV1XJMk6",
        description: "Celebrate the newlyweds with us over a morning of lunch and togetherness.",
        dressCode: "",
        photo: "",
        details: [
          { label: "Dinner & programme", value: "" }
        ]
      }
    ],

    /* ---------------------------------------------------------------
       FAMILY MEMBERS
       Parents are taken from bride/groom above automatically.
       group: grandparents | siblings | uncles-aunts | cousins | others
       Only entries with a real name are shown. Example:
         { group: "grandparents", name: "Smt. Kamala Devi", relation: "Grandmother", photo: "", message: "" }
       --------------------------------------------------------------- */
    family: {
      bride: [],
      groom: []
    },

    /* ---------------------------------------------------------------
       GALLERY — put images in assets/images/gallery/ and list them here.
       category must match one of the category ids below.
       Example:
         { src: "assets/images/gallery/couple-01.jpg", category: "couple", caption: "At the engagement" }
       --------------------------------------------------------------- */
    gallery: {
      categories: [
        { id: "groom", label: "Groom" },
        { id: "bride", label: "Bride" },
        { id: "couple", label: "Couple" },
        { id: "engagement", label: "Engagement" },
        { id: "family", label: "Family" },
        { id: "prewedding", label: "Pre-wedding" },
        { id: "celebration", label: "Wedding Celebrations" }
      ],
      images: []
    },

    /* ---------------------------------------------------------------
       MUSIC — only use music you have permission to use.
       Leave src "" to hide the player completely.
       --------------------------------------------------------------- */
    music: {
      src: "",                          // e.g. "assets/audio/wedding-music.mp3"
      title: "",                        // optional track title
      volume: 0.25,                     // 0 – 1 (kept low by default)
      openingChime: true                // soft bell chime when the invitation opens
    },

    /* ---------------------------------------------------------------
       RSVP — nothing is stored on a server. The guest's reply opens
       pre-filled in WhatsApp and/or their email app for them to send.
       --------------------------------------------------------------- */
    rsvp: {
      whatsappNumber: "",               // with country code, digits only, e.g. "919876543210"
      email: "",                        // e.g. "family@example.com"
      deadline: "",                     // optional "YYYY-MM-DD"
      maxGuests: 10
    },

    /* ---------------------------------------------------------------
       CONTACTS — shown in the venue section and footer (optional)
       Example: { name: "Rahul Sharma", role: "Bride's brother", phone: "+91 98765 43210", email: "" }
       --------------------------------------------------------------- */
    contacts: [],

    /* ---------------------------------------------------------------
       WEBSITE CREDIT — shown at the very bottom of the page.
       Set builderName to "" to hide it.
       --------------------------------------------------------------- */
    credits: {
      label: "Website designed & developed by",
      builderName: "Amrit Punasya",
      builderPhone: "7999649615"
    }
  };
})();
