# ASTRAVA — Private AI Website (v1)

A genuine OpenAI-powered conversational prototype, with no Python and no npm dependencies. Runs on a hosted Node.js server. Users need only a browser.

## What works
- Full name, DOB, birthplace, optional birth time
- Deterministic Indian Mulank/Bhagyank with 1 Sun, 2 Moon, 3 Jupiter, 4 Rahu, 5 Mercury, 6 Venus, 7 Ketu, 8 Saturn, 9 Mars
- Free-form AI conversations with profile context and optional recent life experiences
- Follow-up questions, chat saved in the same browser, private password gate
- API key stays server-side; no hard-coded credentials in HTML

## What is NOT implemented
- No verified Vedic chart/ephemeris: exact Nakshatra, Lagna, houses, Dashas and Panchang are NOT calculated. The AI must not guess them.
- No live web search, citations, account system, payment, shared persistent database, or audited production security.
- No scientifically validated life prediction; spiritual interpretations are cultural, not factual causes.
- Browser localStorage is not encrypted. Avoid entering highly sensitive personal information.

## Deploy using GitHub + Render (no Python)
1. Make a free GitHub account at https://github.com if you do not have one.
2. Create a new **private** repository named `astrava-private-beta`.
3. Upload the CONTENTS of this folder (not the ZIP itself) using GitHub's **Add file → Upload files**, then commit. Make sure `server.mjs`, `package.json`, `render.yaml` and the `public` folder appear at the repository root.
4. Sign up at https://render.com with GitHub.
5. In Render select **New → Web Service** (or Blueprint if preferred) and connect your private repository. Set runtime **Node**, build command `npm install`, start command `npm start`. Free plans may sleep when idle and availability can vary.
6. Under **Environment**, add `OPENAI_API_KEY` = your API secret, `APP_PASSWORD` = a long unique password, and optionally `OPENAI_MODEL` = `gpt-4.1-mini`. Never paste your API key into ChatGPT or GitHub. Do not set the key in the HTML file.
7. Deploy and wait for Render's **Live** status. Open the `https://...onrender.com` link from any laptop or phone. The browser prompts for credentials: username can be anything; password is the `APP_PASSWORD` value.
8. Enter your profile, click **Save & calculate**, then type a question. You can ask anything, not just the suggested prompts.
9. If AI says not configured, check the Render Environment variables and redeploy. If AI requests fail, check OpenAI API credits, key, model access and Render logs. Set a usage budget on your OpenAI account.

**Important:** Basic HTTP authentication over HTTPS is sufficient only as a simple private testing gate, not a production login system. Anyone with the password can access the app and spend your API credits. Do not share the URL/password publicly. For launch, add real user authentication, rate limiting across instances, data privacy controls and cost monitoring.

## Optional local run (Node 20+, no Python)
Set environment variables `OPENAI_API_KEY` and `APP_PASSWORD`, then run `npm start` and visit http://localhost:3000. Never open index.html directly; AI calls require the hosted backend.

## Privacy
The birth profile and chat are stored in the browser's localStorage. Each AI request sends the current profile, recent conversation, and optionally user-supplied life context to the server and OpenAI. The server does not persist chat transcripts. API requests set `store:false`. Browser HTTP Basic Auth credentials may be retained by the browser for the session. Consult provider terms and implement a privacy policy before real customer use.
