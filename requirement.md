# สเปกระบบ: แสดงเส้นทางนำทางไปยังบริษัท (Google Maps)

## 1. ภาพรวมระบบ

ระบบเว็บสำหรับแสดงเส้นทางเดินทางจาก **ตำแหน่งปัจจุบันของผู้ใช้งาน** ไปยัง **ตำแหน่งบริษัท** โดยแบ่งการทำงานออกเป็น 2 ส่วนหลัก คือ **Frontend** และ **Backend** ซึ่งสื่อสารกันผ่าน API

```
[ผู้ใช้งาน] → [Frontend: Nuxt 4] → [Backend API] → [Google Maps API]
```

---

## 2. ความต้องการฝั่ง Frontend (Nuxt 4)

| # | ฟีเจอร์ | รายละเอียด |
|---|---------|-------------|
| 1 | แสดงเส้นทาง | แสดงเส้นทางจากตำแหน่งปัจจุบันของผู้ใช้งาน (ดึงจาก Geolocation API ของ browser) ไปยังตำแหน่งบริษัท (พิกัดที่กำหนดไว้ล่วงหน้า/fix ในระบบ) |
| 2 | แสดงระยะทาง | แสดงระยะทางรวมของเส้นทาง (หน่วย กม./ไมล์) |
| 3 | แสดงระยะเวลาเดินทาง | คำนวณระยะเวลาโดยอ้างอิงจาก **วันเวลาปัจจุบัน** ณ ขณะที่เรียกใช้งาน (เพื่อให้ได้ค่าประเมินเวลาที่สอดคล้องกับสภาพการจราจรจริง) |
| 4 | แสดงแผนที่ Google Map | แสดงแผนที่พร้อมเส้นทาง (Route) บน Google Map ให้ผู้ใช้งานเห็นภาพรวมการเดินทาง |

### แนวทางการพัฒนา (Frontend)
- ใช้ **Nuxt 4** เป็น Framework หลัก
- ขอสิทธิ์ตำแหน่งผู้ใช้งานผ่าน `navigator.geolocation.getCurrentPosition()`
- ส่งพิกัดผู้ใช้งาน (lat, lng) ไปยัง Backend เพื่อขอข้อมูลเส้นทาง
- นำผลลัพธ์ที่ได้ (ระยะทาง, เวลา, เส้นทาง/polyline) มาแสดงผลบน UI และวาดลงบน Google Map component
- แนะนำใช้ไลบรารีช่วยแสดงแผนที่ เช่น `@vue-google-maps/community` หรือฝัง Google Maps JavaScript API โดยตรงผ่าน component wrapper

---

## 3. ความต้องการฝั่ง Backend

| # | หน้าที่ | รายละเอียด |
|---|---------|-------------|
| 1 | ดึงข้อมูลจาก Google Maps API | รับพิกัดต้นทาง (ผู้ใช้งาน) และปลายทาง (บริษัท) แล้วเรียกใช้ Google Maps API เพื่อคำนวณเส้นทาง ระยะทาง และระยะเวลา |
| 2 | ส่งผลลัพธ์กลับ Frontend | จัดรูปแบบข้อมูล (JSON) ส่งกลับให้ Frontend นำไปแสดงผล |

### แนวทางการพัฒนา (Backend)
- สร้าง API Endpoint เช่น `POST /api/directions`
  - **Input:** `origin` (lat, lng ของผู้ใช้งาน), `destination` (lat, lng บริษัท — fix ค่าไว้)
  - **Process:** เรียก Google Maps **Directions API** (หรือ Routes API เวอร์ชันใหม่) โดยส่ง `departure_time=now` เพื่อให้คำนวณเวลาตามสภาพจราจรปัจจุบัน
  - **Output (ตัวอย่าง):**
    ```json
    {
      "distance": { "text": "12.4 km", "value": 12400 },
      "duration": { "text": "25 mins", "value": 1500 },
      "polyline": "encoded_polyline_string...",
      "steps": [ ... ]
    }
    ```
- เก็บ **Google Maps API Key** ไว้ฝั่ง Backend เท่านั้น (ไม่ให้หลุดไปฝั่ง Client) เพื่อความปลอดภัยและป้องกันการเรียกใช้ API เกินโควตาโดยไม่ได้ตั้งใจ
- Backend สามารถพัฒนาด้วย Nuxt Server API (`server/api/`) ภายในโปรเจกต์ Nuxt 4 เดียวกันได้ (Full-stack) หรือแยกเป็น Backend service ต่างหาก (เช่น Node.js/Express) ก็ได้ ขึ้นอยู่กับสถาปัตยกรรมที่ต้องการ

---

## 4. Google Maps API ที่เกี่ยวข้อง

| API | ใช้สำหรับ |
|-----|-----------|
| Maps JavaScript API | แสดงผลแผนที่ฝั่ง Frontend |
| Directions API / Routes API | คำนวณเส้นทาง ระยะทาง ระยะเวลา |
| Geocoding API (ถ้าจำเป็น) | แปลงที่อยู่บริษัทเป็นพิกัด lat/lng (ถ้ายังไม่มีพิกัดตายตัว) |

---

## 5. สรุป Flow การทำงาน

1. ผู้ใช้งานเปิดเว็บ → Browser ขอสิทธิ์ตำแหน่งปัจจุบัน (Geolocation)
2. Frontend (Nuxt 4) ส่งพิกัดผู้ใช้งาน + พิกัดบริษัท ไปยัง Backend API
3. Backend เรียก Google Maps Directions API พร้อมเวลาปัจจุบัน (`departure_time=now`)
4. Backend ส่งผลลัพธ์ (ระยะทาง, เวลา, เส้นทาง) กลับมาเป็น JSON
5. Frontend แสดงผล:
   - แผนที่ Google Map พร้อมเส้นทาง
   - ระยะทางรวม
   - ระยะเวลาเดินทางโดยประมาณ

---

## 6. สิ่งที่ต้องเตรียม/พิจารณาเพิ่มเติม

- [ ] สมัคร Google Cloud Project และเปิดใช้งาน Maps JavaScript API, Directions API (หรือ Routes API)
- [ ] กำหนดพิกัดตำแหน่งบริษัท (lat, lng) ให้แน่นอน
- [ ] ตั้งค่า Environment Variable สำหรับ API Key (เช่น `GOOGLE_MAPS_API_KEY`) ฝั่ง Server
- [ ] จัดการกรณีผู้ใช้งานไม่อนุญาต Location Permission (fallback UI)
- [ ] พิจารณาจำกัด/ควบคุมการเรียก API เพื่อประหยัดค่าใช้จ่าย (Quota/Rate limit)
