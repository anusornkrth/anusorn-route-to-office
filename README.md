# Route to Office

แสดงเส้นทาง ระยะทาง และระยะเวลาเดินทางจากตำแหน่งปัจจุบันของผู้ใช้งานไปยังบริษัท บน Google Maps (Nuxt 4 full-stack)

## Setup

1. ติดตั้ง dependencies:

   ```bash
   npm install
   ```

2. สร้าง Google Cloud Project แล้วเปิดใช้งาน **Maps JavaScript API** และ **Directions API**

3. สร้าง API Key สองตัว แล้วคัดลอก `.env.example` เป็น `.env`:

   ```bash
   cp .env.example .env
   ```

   - `GOOGLE_MAPS_API_KEY` — key ฝั่ง server เท่านั้น ใช้เรียก Directions API จำกัดสิทธิ์ให้ใช้ได้เฉพาะ Directions API และจำกัด IP ของ server
   - `NUXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` — key ฝั่ง browser ใช้แสดงผล Maps JavaScript API เท่านั้น (จำเป็นต้องเป็น public key เพราะแผนที่ต้อง render ที่ฝั่ง client) จำกัดสิทธิ์ด้วย HTTP referrer ให้ใช้ได้เฉพาะโดเมนของเว็บนี้

4. แก้ไขพิกัดบริษัทที่ [`shared/utils/company.ts`](shared/utils/company.ts) ให้เป็นพิกัดจริง

## Development

```bash
npm run dev
```

เปิด `http://localhost:3000` แล้วอนุญาตให้เว็บเข้าถึงตำแหน่งปัจจุบัน

## Project structure

- [`app/pages/index.vue`](app/pages/index.vue) — ขอตำแหน่งผู้ใช้งานผ่าน Geolocation API, เรียก `/api/directions`, แสดงระยะทาง/เวลา และวาดเส้นทางบน Google Map
- [`server/api/directions.post.ts`](server/api/directions.post.ts) — รับพิกัดต้นทาง เรียก Google Directions API ด้วย `departure_time=now` แล้วส่งผลลัพธ์กลับเป็น JSON
- [`shared/utils/company.ts`](shared/utils/company.ts) — พิกัดปลายทาง (บริษัท) ใช้ร่วมกันทั้ง client และ server
- [`app/composables/useGoogleMapsLoader.ts`](app/composables/useGoogleMapsLoader.ts) — โหลด Google Maps JavaScript API แบบครั้งเดียว
- [`app/utils/polyline.ts`](app/utils/polyline.ts) — decode encoded polyline ที่ได้จาก Directions API เพื่อวาดเส้นทางบนแผนที่

## Production

```bash
npm run build
npm run preview
```
