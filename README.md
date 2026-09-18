# Route to Office

แสดงเส้นทาง ระยะทาง และระยะเวลาเดินทางจากตำแหน่งปัจจุบันของผู้ใช้งานไปยังบริษัท บน Google Maps (Nuxt 4)

รองรับการ deploy ได้ 2 แบบ:
- **Full-stack เดียวกัน** — frontend + backend รันเป็น process เดียว (เช่น local dev, หรือ deploy ไปที่เดียว)
- **แยก deploy** — frontend (เช่น Vercel) เรียก backend (เช่น Render) คนละโดเมน ผ่าน `NUXT_PUBLIC_API_BASE_URL` และ backend เปิด CORS ให้เฉพาะโดเมน frontend ผ่าน `CORS_ORIGIN`

## Setup

1. ติดตั้ง dependencies:

   ```bash
   npm install
   ```

2. สร้าง Google Cloud Project แล้วเปิดใช้งาน **Maps JavaScript API**, **Directions API** (และ **Geocoding API** ถ้าต้องแปลงที่อยู่เป็นพิกัด)

3. สร้าง API Key สองตัวแยกกัน แล้วคัดลอก `.env.example` เป็น `.env`:

   ```bash
   cp .env.example .env
   ```

   - `GOOGLE_MAPS_API_KEY` — key ฝั่ง server เท่านั้น จำกัดสิทธิ์ด้วย IP restriction ให้ใช้ได้เฉพาะ Directions API (และ Geocoding API ถ้าใช้)
   - `NUXT_PUBLIC_GOOGLE_MAPS_JS_KEY` — key ฝั่ง browser ใช้แสดงผล Maps JavaScript API เท่านั้น จำกัดสิทธิ์ด้วย HTTP referrer ให้ใช้ได้เฉพาะโดเมนของเว็บนี้

4. กำหนดพิกัดบริษัทผ่าน `COMPANY_LAT` / `COMPANY_LNG` ใน `.env` (ค่า default ใน `.env.example` เป็นพิกัดจริงของออฟฟิศแล้ว)

## Development

```bash
npm run dev
```

เปิด `http://localhost:3000` แล้วอนุญาตให้เว็บเข้าถึงตำแหน่งปัจจุบัน ในโหมด dev ปกติ frontend/backend อยู่ process เดียวกัน ไม่ต้องตั้ง `NUXT_PUBLIC_API_BASE_URL` หรือ `CORS_ORIGIN`

## Environment Variables

| ตัวแปร | ฝั่ง | ใช้ทำอะไร |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | Backend | เรียก Google Directions API |
| `COMPANY_LAT`, `COMPANY_LNG` | Backend | พิกัดปลายทาง (บริษัท) แบบ fix |
| `CORS_ORIGIN` | Backend | โดเมน frontend ที่อนุญาตเรียก API ข้ามโดเมน (ปล่อยว่างถ้า deploy รวมกัน) |
| `NUXT_PUBLIC_GOOGLE_MAPS_JS_KEY` | Frontend | แสดงผล Google Map ในเบราว์เซอร์ |
| `NUXT_PUBLIC_API_BASE_URL` | Frontend | URL ของ backend เมื่อแยก deploy คนละโดเมน (ปล่อยว่างถ้า deploy รวมกัน) |

## Project structure

- [`app/pages/index.vue`](app/pages/index.vue) — orchestrate การขอตำแหน่งและเรียกเส้นทาง แล้วส่งต่อผลลัพธ์ให้ components
- [`app/composables/useGeolocation.ts`](app/composables/useGeolocation.ts) — ขอตำแหน่งผู้ใช้งานผ่าน Geolocation API พร้อม state สำหรับกรณีไม่อนุญาต/ไม่รองรับ
- [`app/composables/useDirections.ts`](app/composables/useDirections.ts) — เรียก `/api/directions` (relative หรือ absolute ผ่าน `NUXT_PUBLIC_API_BASE_URL`)
- [`app/composables/useGoogleMapsLoader.ts`](app/composables/useGoogleMapsLoader.ts) — โหลด Google Maps JavaScript API แบบครั้งเดียว
- [`app/components/RouteSummary.vue`](app/components/RouteSummary.vue) — แสดงระยะทาง/เวลา
- [`app/components/MapView.vue`](app/components/MapView.vue) — แสดงแผนที่ วาดเส้นทางจาก polyline พร้อม marker ต้นทาง/ปลายทาง
- [`app/utils/polyline.ts`](app/utils/polyline.ts) — decode encoded polyline ที่ได้จาก Directions API
- [`server/api/directions.post.ts`](server/api/directions.post.ts) — รับพิกัดต้นทาง เรียก Google Directions API ด้วย `departure_time=now` แล้วส่งผลลัพธ์กลับเป็น JSON
- [`server/api/directions.options.ts`](server/api/directions.options.ts) — ตอบ CORS preflight เมื่อ frontend/backend อยู่คนละโดเมน
- [`server/utils/googleMaps.ts`](server/utils/googleMaps.ts) — เรียก Google Directions API
- [`server/utils/cors.ts`](server/utils/cors.ts) — ใส่ CORS header ตาม `CORS_ORIGIN`
- [`shared/types/directions.ts`](shared/types/directions.ts) — type ร่วมระหว่าง frontend/backend

## Production

รันรวมกันในเครื่องเดียว:

```bash
npm run build
npm run start
```

หรือแยก deploy — build เดียวกันนี้ deploy เป็น backend (เช่น Render, start command `npm run start`) ส่วน frontend deploy จากซอร์สเดียวกันไปยัง static host (เช่น Vercel) โดยตั้ง `NUXT_PUBLIC_API_BASE_URL` ให้ชี้ไปที่ backend URL
