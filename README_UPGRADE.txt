ASTRAVA V2 — Nakshatra exploratory beta upgrade

BACK UP YOUR CURRENT REPOSITORY BEFORE EDITING.

Upload or replace these files in the existing GitHub repository (main branch):
1. server.mjs — replace root file
2. package.json — replace root file
3. vedic.mjs — NEW file at repository root

DO NOT delete or replace your existing public/index.html, render.yaml, APP_PASSWORD, or OPENAI_API_KEY.

GitHub browser editing: open each file > pencil icon > paste replacement text > Commit changes. For the new file use Add file > Create new file > vedic.mjs. You may use the ZIP as a source for these three files; do not upload the ZIP itself as a repository file.

Render should redeploy automatically if connected to GitHub. Check deploy logs for npm install and successful startup.

Try: 'What is my birth Nakshatra and Pada?' with birth date, city, and preferably birth time. With no time, it reports stable Nakshatra or possibilities. For city ambiguity use City, State, Country.

LIMITATIONS: Exploratory calculations use Astronomy Engine and approximate Lahiri ayanamsa, not a validated Swiss Ephemeris Panchang. Nakshatra and Rashi are supported provisionally. Lagna, houses, Rahu/Ketu, Mahadasha and Antardasha are NOT implemented; the AI must not fabricate them. Geocoding relies on public Open-Meteo API and may be unavailable or select an ambiguous city. Test against trusted Panchang charts before commercial launch.

Security: never paste your OpenAI secret key into GitHub files. Keep Render environment variables unchanged.
