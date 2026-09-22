# MyTube (YouTube-jaisi App)

React + Node.js (Express) + MongoDB se bana ek "YouTube-jaisa" video app. Admin ek password-protected panel se YouTube links add karta hai (ek ya bahut saare ek saath), aur wo turant sabke mobile par dikhne lagte hain. Video playback YouTube ke apne player se hota hai, isliye kamzor network par bhi khud-ba-khud quality adjust ho jaati hai — kahin bhi self-hosted video files ya bhari downloads nahi chahiye. **Koi login/signup nahi.**

## Ye kaam kaise karta hai

- **Admin panel** (`/admin`): Aap yahan se YouTube link(s) paste karte ho. Server YouTube ke oEmbed se title/channel/thumbnail nikal leta hai aur MongoDB me save kar deta hai — turant, koi download/wait nahi.
- **Home page** (`/`): Sabhi add kiye gaye videos ek grid me dikhte hain, YouTube jaisi dark theme, mobile-first.
- **Watch page**: Video YouTube ke apne embedded player se chalta hai — isliye kamzor connection par bhi wahi smart buffering/quality-adjustment milta hai jo normal YouTube app deta hai.
- **QR code**: Admin panel me ek QR code dikhta hai jo seedha home page kholta hai — kisi ko bhi phone se scan karake bina URL type kiye app khol sakte hain.

## Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- MongoDB — local testing ke liye local MongoDB, live/production ke liye [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) ka free (M0) cluster.

## Local testing

```powershell
cd server
npm install
copy .env.example .env
# .env me ADMIN_KEY apni pasand ki secret key se badal dein
npm run dev
```

Doosri terminal me:

```powershell
cd client
npm install
npm run dev
```

Browser me kholein: `http://localhost:5173`. Admin panel: `http://localhost:5173/admin`.

## Live/Production par deploy karna (taaki kahin se bhi mobile se khul sake)

Isse app internet par live ho jaata hai — jahan bhi thoda sa network/mobile data mile, wahi se khul jaayega, koi alag PC/router ki zaroorat nahi.

### 1. MongoDB Atlas (free database)

1. [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) par free account banayein.
2. Ek **free M0 cluster** banayein.
3. "Database Access" me ek user banayein (username/password yaad rakhein).
4. "Network Access" me **0.0.0.0/0** allow karein (taaki hosting service connect kar sake).
5. "Connect" → "Drivers" se connection string copy karein, jaisa:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/youtube_app`

### 2. Code ko GitHub par push karein

```powershell
git remote add origin https://github.com/<aapka-username>/<repo-naam>.git
git push -u origin main
```

(GitHub par pehle ek naya empty repository bana lein, phir upar wala command chalayein.)

### 3. Render.com par deploy (free)

1. [render.com](https://render.com) par GitHub se sign up karein.
2. "New +" → "Web Service" → apna GitHub repo select karein (`render.yaml` already hai isliye settings auto-detect ho jaayengi).
3. Environment variables set karein:
   - `MONGODB_URI` → Atlas wala connection string
   - `ADMIN_KEY` → apni secret key
4. Deploy hone do (2-5 min lagte hain). Render ek live URL dega, jaise `https://mytube-xxxx.onrender.com`.

> Free tier thodi der inactivity ke baad "sleep" ho jaati hai — pehli request par 30-50 second ka delay ho sakta hai, uske baad normal speed. Agar ye acceptable nahi hai to Render ka paid "Starter" plan ya Railway jaisi doosri service try kar sakte hain.

### 4. Use karna

1. Apne live URL ke `/admin` par jaake apni `ADMIN_KEY` se login karein aur YouTube links add karein.
2. Usi admin panel me QR code dikhega — usse scan karke koi bhi seedha home page (video list) par pahunch jaayega.
3. Ghar walon ko wahi link/QR bhej dein — unke phone me jaisa bhi network ho, video list aur YouTube player khud-ba-khud usi hisaab se chalega.

## Project structure

```
package.json        Root build/start scripts (Render isi ko use karta hai)
render.yaml          Render ke liye deployment config
server/              Express API + MongoDB + YouTube oEmbed metadata lookup
  src/
    routes/           Public video routes + admin routes
    services/         metadata.js — YouTube oEmbed se title/channel/thumbnail
    models/           Mongoose Video model
client/              React (Vite) frontend — YouTube-jaisi UI, mobile-first
  src/
    pages/            Home, Watch (YouTube embed player), Admin (+ QR code)
```
