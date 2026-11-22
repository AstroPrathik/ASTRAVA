ASTRAVA V3 — Live AI Astrologer upgrade (2026-11-22)

WHAT TO UPLOAD TO YOUR EXISTING GITHUB REPOSITORY ROOT:
  server.mjs      REPLACE
  vedic.mjs       REPLACE
  package.json    REPLACE
  public/index.html  REPLACE inside the existing public folder

KEEP your existing render.yaml, APP_PASSWORD, OPENAI_API_KEY and other files.
GitHub: upload the three .mjs/.json files at the repository top level, then open public/ and upload index.html there. Commit changes. Render should auto-deploy. Check Render Logs if deployment fails.

WHAT WORKS:
- Multi-turn conversational AI through your existing OpenAI API connection.
- Mulank and Bhagyank from DOB.
- Approximate Nakshatra, Pada, Moon Rashi, and planetary signs when birth time is supplied.
- Approximate Vimshottari Mahadasha and Antardasha from Moon Nakshatra.
- When birth time is missing, scans the date for possible Nakshatras; does not fabricate Dashas.
- General Navagraha and Vaastu explanations grounded in what is known.
- No new API key or extra Render environment variables.

IMPORTANT LIMITATIONS:
- This is an exploratory spiritual guidance beta, NOT a verified professional Vedic chart engine.
- Approximate Lahiri ayanamsa, planetary ephemeris, civil-year Dasha lengths, and geocoding may cause discrepancies.
- The city resolver takes the first match; ask users for City, State, Country and confirm ambiguous results.
- Lagna, houses, Rahu/Ketu, verified Panchang and muhurta are NOT computed.
- Dasha boundaries may differ from validated astrology software.
- AI text is not a substitute for health, financial, or legal advice.
- 'Live chat' means interactive request/response chat, not audio/video or token-by-token streaming.

TEST:
Save birth profile with birth time, ask 'What is my Nakshatra and current Mahadasha?'
Then ask 'How does my Bhagyank relate to Guru?'
Then ask 'Help with Vaastu for my kitchen; what information do you need?'
Try leaving birth time blank: app should not invent precise Dasha dates.
