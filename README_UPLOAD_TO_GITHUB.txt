ASTRAVA V4 — BRIGHT MULTILINGUAL BETA

1. BACK UP your current GitHub files before replacing them.
2. Upload/replace these files in https://github.com/AstroPrathik/ASTRAVA :
   - server.mjs (repository main folder)
   - vedic.mjs (repository main folder)
   - package.json (repository main folder)
   - public/index.html (inside public folder)
3. Commit the changes to your main branch.
4. Wait for Render to deploy successfully (Live).
5. Open your existing ASTRAVA website and hard refresh the page.
6. Enter your birth profile, save it, and test the chart and chat language selector.

Keep existing APP_PASSWORD and OPENAI_API_KEY in Render; NEVER upload them to GitHub.

WHAT'S NEW
- Light ivory, mint and warm gold visual theme, responsive to mobile.
- Chart overview: birth numerology, Lo Shu number grid, approximate Nakshatra,
  Moon Rashi, available planetary signs and exploratory Dasha periods.
- Live AI chat in English, Bengali, Kannada, Telugu, Tamil, Marathi, Hindi,
  Malayalam, with beginner-friendly instructions and date/time supplied by server.
- New /api/chart endpoint to show available chart data without asking the AI.

LIMITATIONS
- The current astronomy calculations use approximate Lahiri ayanamsa, NOT a
  validated production Vedic Kundli/Panchang engine.
- Lagna, 12 houses, Navamsa D9, Rahu/Ketu placements and certified Dasha
  periods are NOT computed. No false full Kundli chart is displayed.
- Birth city geocoding may select the wrong place if the name is ambiguous.
- Chat is message-based, not voice/audio chat. Language selection affects AI
  replies; the static website interface labels remain in English.
- Live deployment and OpenAI API responses have not been verified here.
