\# Regenplastics Coding Rules



Project Structure:

\- webapp = Firebase Hosting (React + Vite)

\- appsscript-leads = Google Apps Script backend



Deployment Rules:

\- Never change Firebase project ID

\- Always keep Apps Script compatible with clasp

\- After backend changes run:

&nbsp; clasp push

&nbsp; clasp deploy



Frontend Rules:

\- Avoid CORS preflight

\- POST using text/plain JSON body

\- Environment variables via .env



Backend Rules:

\- Must return JSON always

\- Maintain doGet health endpoint

\- Use rate limiting + validation



Goal:

Industrial-grade reliability. No breaking production lead capture.



