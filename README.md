# MyTube (Offline YouTube-jaisi App)

React + Node.js (Express) + MongoDB se bana ek "YouTube-jaisa" video app, jo **bina internet ke** (sirf local WiFi par) chalta hai. Koi login/signup nahi — sirf ek admin panel hai jahan se aap YouTube links add karte ho, aur wo videos actual video files ke roop me download ho kar users ke liye ready ho jaate hain.

## Ye kaam kaise karta hai

Do jagah, ek hi code chalega:

1. **Admin machine** (jahan internet hai, jaise Bhopal) — Aap yahan admin panel se YouTube links (ek ya bahut saare) paste karte ho. Server yt-dlp se actual video file download karke apne paas store kar leta hai.
2. **Export** — Ek command chalane se naye download hue videos ek folder me copy ho jaate hain (USB me le jaane ke liye).
3. **Offline machine** (jahan network nahi hai, jaise Satna) — Us USB folder ko "import" karte ho. Videos wahan ke storage + MongoDB me aa jaate hain.
4. **Users** — Offline machine ek local WiFi router se juda hota hai. Users apne mobile ko usi WiFi se connect karke server ka address browser me kholte hain — bilkul YouTube jaisi grid dikhti hai, video pe tap karo, chalu ho jata hai. **Koi internet nahi chahiye**, sirf local WiFi.

```
[Admin machine, internet]  --(links paste)-->  download videos  --(export)-->  [USB Drive]
                                                                                     |
                                                                                     v
[Offline machine, no internet] <--(import)-- [USB Drive]  --(local WiFi router)--> [Users' mobiles]
```

> **Zaroori:** Video download hamesha **admin ki apni machine** (normal ghar/office internet) par hona chahiye — kisi cloud hosting (Render/Railway/AWS) se nahi, kyunki YouTube cloud servers ki IP ko bot samajh kar block kar deta hai. Admin panel bhi isi local machine par chalana hai.

## Zaroori software (dono machines par)

- [Node.js](https://nodejs.org) (v18+)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) — **dono** machines par local install karna hai.

## Setup — Admin machine (jahan internet hai)

```powershell
cd server
npm install
copy .env.example .env
# .env kholke ADMIN_KEY ko apni khud ki secret key se badal dein
npm start
```

Doosri terminal me:

```powershell
cd client
npm install
npm run dev
```

Browser me kholein: `http://localhost:5173` — video list dikhegi. Admin panel ke liye `http://localhost:5173/admin` par jaayein aur apni `ADMIN_KEY` daalein.

**Videos add karna:** Admin panel me textarea me ek ya multiple YouTube links paste karein (har link apni line par), "Videos Add Karein" dabayein. Status table me "Queue me" → "Download ho raha hai" → "Ready" dikhega.

> `npm install` ke time `yt-dlp-wrap-plus`/`ffmpeg-static` install hote hain; pehli baar video download karte waqt yt-dlp binary khud-ba-khud GitHub se aa jaati hai (internet chahiye hoga).

## Naye videos ko USB me export karna (admin machine par)

```powershell
cd server
npm run export -- --out "D:\USB\export1"
```

Ye sirf un videos ko export karega jo pehle export nahi hue the. Ab poora `export1` folder USB drive me copy karke offline machine tak le jaayein.

## Offline machine par setup (jahan network nahi hai)

```powershell
cd server
npm install
copy .env.example .env
```

USB se videos import karein:

```powershell
npm run import -- --in "D:\USB\export1"
```

Client build karein (production build, taaki server hi sab kuch serve kar de — sirf ek port chahiye hota hai):

```powershell
cd ..\client
npm install
npm run build
```

Ab server chalayein:

```powershell
cd ..\server
npm start
```

Console me dikhega: `Server chal raha hai: http://0.0.0.0:5000`

## Users tak pahunchana (local WiFi, bina internet)

1. Is offline machine ko ek WiFi router se connect karein (router ko internet se connect karne ki zaroorat nahi hai, sirf local network chahiye).
2. Machine ka local IP pata karein: PowerShell me `ipconfig` chalayein, "IPv4 Address" dekhein (jaise `192.168.1.10`).
3. Users apne mobile ko usi WiFi se connect karke browser me kholein: `http://192.168.1.10:5000`
4. Bas — YouTube jaisi grid dikhegi, video pe tap karke offline dekh sakte hain. Admin panel me ek QR code bhi hai jo isi link ko encode karta hai — scan karke seedha khol sakte hain.

## Jab bhi naye videos add karne hon

1. Admin machine par internet ke saath naye links add karo (admin panel se).
2. `npm run export -- --out "D:\USB\exportN"` chalao (naya folder naam har baar).
3. USB le jaake offline machine par `npm run import -- --in "D:\USB\exportN"` chalao.
4. Server already chal raha ho to naye videos turant list me dikhenge (server restart karne ki zaroorat nahi).

## Video quality/size control

`.env` me `MAX_VIDEO_HEIGHT` se control hota hai (default `480`). Kam height = chhoti file size = kam storage — low-storage deployment ke liye better.

## Project structure

```
server/            Express API + MongoDB + yt-dlp downloader (admin machine par chalta hai)
  src/
    routes/         Public video routes (streaming) + admin routes
    services/        Download queue (yt-dlp wrapper)
    scripts/         export.js / import.js (USB sync)
    models/          Mongoose Video model
  storage/
    videos/          Downloaded video files
    thumbnails/       Downloaded thumbnails
client/             React (Vite) frontend — YouTube-jaisi UI, mobile-first, home-screen install
```
