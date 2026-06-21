# GCC Zone XI Staff Portal

Greater Chennai Corporation Zone XI — Staff Web Portal with QR Code Generator and PPA Details lookup.

## Features

- 🔐 Login page (hardcoded credentials)
- 📱 Left sidebar navigation
- 🔲 Property Tax QR Code Generator
- 📋 PPA Building Plan Details (Excel upload → Bulk API fetch → Export)

## Login Credentials

| Username | Password |
|----------|----------|
| zone11   | gcc@2024 |
| admin    | admin@123 |

*(Change these in `src/pages/LoginPage.js` → VALID_USERS array)*

---

## 🚀 Deployment Steps

### Part 1: Deploy Vercel Proxy (Backend)

CORS bypass பண்ண Vercel serverless function வேணும்.

1. **Vercel account create பண்ணு** → https://vercel.com (free)

2. **New project** → Import this GitHub repo

3. **Root directory** மாத்தாதே (project root)

4. **Environment variable add பண்ணு** (optional):
   - `GCC_JSESSIONID` → Your default JSESSIONID cookie value

5. Deploy click பண்ணு → URL கிடைக்கும் (e.g., `https://gcc-proxy.vercel.app`)

### Part 2: Deploy React App (GitHub Pages)

1. **GitHub repo create பண்ணு**

2. `package.json` la homepage update பண்ணு:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/gcc-portal"
   ```

3. `.env` file create பண்ணு (project root):
   ```
   REACT_APP_PROXY_URL=https://YOUR_VERCEL_URL.vercel.app/api/proxy
   ```

4. Install & deploy:
   ```bash
   npm install
   npm run deploy
   ```

5. GitHub repo → Settings → Pages → Source: `gh-pages` branch

6. URL: `https://YOUR_USERNAME.github.io/gcc-portal`

---

## 🔑 JSESSIONID Cookie - How to get it

1. Chrome-la `erp.chennaicorporation.gov.in` open பண்ணு
2. Login பண்ணு (or just navigate any page)
3. F12 → Application tab → Cookies → `erp.chennaicorporation.gov.in`
4. `JSESSIONID` value copy பண்ணு
5. App-ல Step 1 box-ல paste பண்ணு

⚠️ Session expires every few hours. Renew பண்ண வேண்டியிருக்கும்.

---

## 📊 Excel Format

Excel file-ல PPA numbers இருந்தா போதும். Any column, any row.

Format: `PPA/WDCN15/02117/2024`

App automatically detect பண்ணும்.

---

## 🛠 Local Development

```bash
npm install
npm start
```

---

## Project Structure

```
gcc-portal/
├── src/
│   ├── App.js              # Main app with routing
│   ├── pages/
│   │   ├── LoginPage.js    # Login page
│   │   ├── QrCode.js       # QR Code generator
│   │   └── PpaDetails.js   # PPA bulk lookup
│   └── components/
│       └── Layout.js       # Sidebar layout
├── api/
│   └── proxy.js            # Vercel serverless proxy
└── vercel.json             # Vercel config
```

---

Designed by [Zone-XI](https://maps.app.goo.gl/S12NiZi7Vw4K6GRK9)
