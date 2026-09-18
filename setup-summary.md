# Setup Summary: ค่า Config จริงของโปรเจกต์ route-to-office

เอกสารนี้สรุปค่าจริงทั้งหมดที่ตั้งค่าไว้แล้วบน Google Cloud และ Render จากขั้นตอนที่ทำผ่านมา ใช้เป็น reference ตอนเขียนโค้ด (env vars, endpoint, restriction) ให้ตรงกับของจริง

---

## 1. Google Cloud Project

| รายการ | ค่า |
|--------|-----|
| Project Name | route-to-office |
| Project ID | `route-to-office-509014` |
| Project Number | `908775217880` |

### APIs ที่เปิดใช้งานแล้ว
- Maps JavaScript API
- Directions API
- Geocoding API

---

## 2. API Keys

### Key 1 — Frontend (Maps JS)
| รายการ | ค่า |
|--------|-----|
| ชื่อ Key | `maps-js-client-key` |
| Application restriction | HTTP referrers (Websites) |
| Referrers ที่อนุญาต | `http://localhost:3000/*`, `https://anusorn-route-to-office.vercel.app/*` |
| API restriction | เฉพาะ **Maps JavaScript API** |
| ใช้เป็น env var | `NUXT_PUBLIC_GOOGLE_MAPS_JS_KEY` (ฝั่ง Frontend) |

### Key 2 — Backend (Directions/Geocoding)
| รายการ | ค่า |
|--------|-----|
| ชื่อ Key | `directions-server-key` |
| Application restriction | IP addresses |
| API restriction | เฉพาะ **Directions API** และ **Geocoding API** |
| ใช้เป็น env var | `GOOGLE_MAPS_API_KEY` (ฝั่ง Backend เท่านั้น — ห้าม expose ไป client) |

> **หมายเหตุ:** IP ranges ของ Render เป็น shared range ใช้ร่วมกับลูกค้ารายอื่น หากต้องการ IP เฉพาะของตัวเองจริงๆ ต้องใช้ฟีเจอร์ Dedicated IP ของ Render (มีค่าใช้จ่ายเพิ่มเติม)

---

## 3. Deployment

### Frontend — Vercel
| รายการ | ค่า |
|--------|-----|
| URL | https://anusorn-route-to-office.vercel.app |
| Framework | Nuxt 4 |
| Build Command | `nuxt build` |
| Output Directory | `.output/public` |

### Backend — Render
| รายการ | ค่า |
|--------|-----|
| Service Name | anusorn-route-to-office |
| Service Type | Web Service |
| URL | https://anusorn-route-to-office.onrender.com |
| Service ID | `srv-damlnetbedkc73c883kg` |
| Language/Runtime | **Node** (ต้องแก้จากค่า default ที่เดาผิดเป็น Elixir) |
| Branch | main |
| Instance Type | Free (0.1 CPU, 512 MB RAM) |
| Build Command | `npm install && npm run build` |
| Start Command | `node .output/server/index.mjs` (หรือ `npm run start` ถ้ามี script นี้ใน package.json) |

### GitHub Repository
- https://github.com/anusornkrth/anusorn-route-to-office.git
- Branch หลัก: `main`

---

## 4. Environment Variables ที่ต้องตั้งจริง

### Frontend (Vercel → Project Settings → Environment Variables)
```
NUXT_PUBLIC_GOOGLE_MAPS_JS_KEY=<ค่าจาก Key 1 ด้านบน>
NUXT_PUBLIC_API_BASE_URL=https://anusorn-route-to-office.onrender.com
```

### Backend (Render → Environment tab)
```
GOOGLE_MAPS_API_KEY=<ค่าจาก Key 2 ด้านบน>
COMPANY_LAT=13.805384
COMPANY_LNG=100.537707
CORS_ORIGIN=https://anusorn-route-to-office.vercel.app
```

---

## 5. โครงสร้างโค้ดที่ต้องสร้าง (สรุปจาก requirement.md + guidelines.md)

```
project-root/
  app/
    components/
      MapView.vue          # แสดงแผนที่ + วาดเส้นทางจาก polyline
      RouteSummary.vue      # แสดงระยะทาง + ระยะเวลา
    composables/
      useGeolocation.ts     # ดึงตำแหน่งผู้ใช้งานจาก browser
      useDirections.ts      # เรียก Backend API /api/directions
    pages/
      index.vue             # รวม MapView + RouteSummary
  server/
    api/
      directions.post.ts    # รับ origin จาก client, เรียก Google Directions API, ส่ง distance/duration/polyline กลับ
    utils/
      googleMaps.ts         # ฟังก์ชันเรียก Google Maps API (ใช้ GOOGLE_MAPS_API_KEY)
  shared/
    types/
      directions.ts         # type ร่วมระหว่าง frontend-backend
  .env
  .env.example
  nuxt.config.ts
```

### Contract ของ `POST /api/directions`

**Request**
```json
{
  "origin": { "lat": 13.7563, "lng": 100.5018 }
}
```
> `destination` ไม่ต้องส่งจาก client เพราะ backend fix พิกัดบริษัทไว้จาก `COMPANY_LAT` / `COMPANY_LNG` แล้ว

**Response (สำเร็จ)**
```json
{
  "distance": { "text": "12.4 km", "value": 12400 },
  "duration": { "text": "25 mins", "value": 1500 },
  "polyline": "encoded_polyline_string...",
  "steps": [ ... ]
}
```

**Response (error)**
```json
{
  "error": true,
  "message": "ไม่สามารถคำนวณเส้นทางได้"
}
```

- เรียก Google Directions API พร้อม `departure_time=now` เสมอ เพื่อให้เวลาที่คำนวณสอดคล้องกับสภาพจราจรปัจจุบัน

---

## 6. Checklist สิ่งที่ยังไม่เสร็จ

- [ ] ใส่ Environment Variables ทั้งฝั่ง Vercel และ Render ให้ครบตามข้อ 4
- [ ] ยืนยันว่า Render deploy สำเร็จ (สถานะ "Live") หลัง push โค้ด
- [ ] ทดสอบเรียก `https://anusorn-route-to-office.onrender.com/api/directions` ว่าทำงานถูกต้อง
- [ ] ตั้งค่า CORS ฝั่ง Backend ให้อนุญาตเฉพาะโดเมน Frontend จริง
- [ ] ทดสอบ flow เต็มบน production URL จริง
