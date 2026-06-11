# CPS Google Sheet Demo CRM

React Vite frontend + Google Apps Script + Google Sheet storage.

## Features

- Mobile-first React UI
- Demo OTP login: `1234`
- Accounts list with cards/table
- Add account form
- One mandatory meeting photograph
- Google Drive photo upload through Apps Script
- Multiple devices per account
- Apple / Intel / AMD dynamic device configuration
- Business Opportunity We Have: Leasing, Renting, Hybrid, This contact don't know
- Time for First Order field
- Potential Yes/No conditional fields
- Company details with eye/calculation UI
- Approval, quotation, PO, Won/Lost freeze flow
- Separate legend page

## Frontend setup

```bash
npm install
cp .env.example .env
npm run dev
```

Update `.env`:

```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## Google Apps Script setup

1. Create a Google Sheet.
2. Create a Google Drive folder for meeting photos.
3. Open Google Sheet -> Extensions -> Apps Script.
4. Paste `apps-script/Code.gs`.
5. Apps Script -> Project Settings -> Script properties:
   - `SPREADSHEET_ID` = Google Sheet ID
   - `DRIVE_FOLDER_ID` = Drive folder ID
6. Deploy -> New deployment -> Web app:
   - Execute as: Me
   - Who has access: Anyone
7. Copy Web App URL into `.env`.

## Free deployment

Deploy frontend on Vercel or Netlify. Add the same env variable in hosting settings.
