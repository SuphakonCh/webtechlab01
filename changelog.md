# Changelog — Fruitables Website

สรุปการแก้ไขทั้งหมดที่ทำในแต่ละครั้ง เรียงตามลำดับเวลา

---

## ครั้งที่ 1 — สร้าง Activity Diagram ระบบค้นหา (Search)

**ไฟล์ที่สร้าง:** `search_activity_diagram.md`

- สร้าง Activity Diagram แบบ Mermaid สำหรับฟีเจอร์ค้นหาสินค้า
- เวอร์ชันแรกเป็น flowchart ธรรมดา
- แก้ไขเป็นแบบ **Swimlane** แบ่ง 2 เลน (User / System)
- แก้ไขอีกครั้งเป็นแบบ **Sequence Diagram** แสดง interaction ระหว่าง User กับ System
- แก้ไขครั้งสุดท้ายให้ตรงกับ **แบบร่างที่ผู้ใช้วาดมา** โดยมี flow ดังนี้:
  - User: input name → click search
  - Service: search all data → match data → Y/N
  - User: update data → show results

---

## ครั้งที่ 2 — ตรวจสอบ Activity Diagram กับเว็บจริง

**ไฟล์ที่ตรวจสอบ:** `shop.html`, `index.html`, `js/fetchProducts.js`, `products.json`

- วิเคราะห์โค้ดทั้งหมดในโปรเจกต์เพื่อเทียบกับ Activity Diagram
- สรุปว่า Diagram ถูกต้องในเชิง Logic แต่ตัวโค้ดจริงยังไม่ได้ implement ฟังก์ชันค้นหา
- ระบุว่า Search Modal มีอยู่แล้วแต่ยังไม่มี JavaScript ต่อสายเข้ากับข้อมูล

---

## ครั้งที่ 3 — สร้าง Activity Diagram ระบบเลือกหมวดหมู่ (Category)

**ไฟล์ที่สร้าง:** `category_activity_diagram.md`

- สร้าง Activity Diagram แบบ Swimlane สำหรับฟีเจอร์ Selecting a Product Category
- ออกแบบให้สอดคล้องกับโค้ดจริงบน `index.html` ที่ใช้ Bootstrap Tab Pills
- แบ่ง 2 เลน:
  - **User**: view tabs → click category tab → view filtered products
  - **Service (Bootstrap)**: detect click → hide active pane → match tab → show pane → update active state
- แสดง mapping ของแต่ละแท็บ: All Products→tab-1, Vegetables→tab-2, Fruits→tab-3, Bread→tab-4, Meat→tab-5

---

## ครั้งที่ 4 — สร้างรูปภาพ Activity Diagram

**ไฟล์ที่สร้าง:** `search_activity_diagram.png`, `category_activity_diagram.png`

- ใช้ AI Image Generation สร้างรูปภาพ Activity Diagram ของทั้ง 2 ระบบ
- สไตล์: UML Swimlane, พื้นขาว, กล่องสีฟ้า/เขียว, diamond สีเหลือง
- คัดลอกไฟล์ PNG เข้าโฟลเดอร์โปรเจกต์ Fruitables

---

## ครั้งที่ 5 — เขียนฟังก์ชัน `filterProducts()`

**ไฟล์ที่แก้ไข:** `js/fetchProducts.js`

### สิ่งที่เพิ่ม:
1. **`let allProducts = []`**
   - ตัวแปร global เก็บสินค้าทั้งหมดที่ดึงมาจาก JSON
   - ทำหน้าที่เป็น "master list" ให้ฟังก์ชัน filter ใช้งาน

2. **`filterProducts(searchTerm, category)`**
   - ใช้ `Array.filter()` กรองสินค้าตาม 2 เงื่อนไข:
     - **ค้นหาชื่อ (case-insensitive)**: ใช้ `.toLowerCase()` + `.includes()`
     - **กรองหมวดหมู่**: ถ้า category เป็น `"All"` จะผ่านหมด, ถ้าไม่ก็เทียบตรงๆ
   - return เฉพาะสินค้าที่ผ่านทั้ง 2 เงื่อนไข

3. **`allProducts = data`** (เพิ่มในฟังก์ชัน `requestProducts()`)
   - เก็บข้อมูลสินค้าลง global variable หลัง fetch สำเร็จ

---

## ครั้งที่ 6 — สรุปสถานะระบบทั้งหมด

- วิเคราะห์ว่าระบบไหนทำงานได้แล้ว / ยังไม่ได้ทำ:

| สถานะ | ระบบ |
|-------|------|
| ✅ ทำงานได้ | แสดงสินค้าแบบ Dynamic (tab-1) |
| ✅ ทำงานได้ | เลือกหมวดหมู่ Tab (แต่ tab 2-5 ยัง hardcode) |
| ✅ เขียนเสร็จ | ฟังก์ชัน filterProducts() |
| ❌ ยังไม่ทำ | ค้นหาสินค้า (Search) — ยังไม่ต่อ UI กับ JS |
| ❌ ยังไม่ทำ | กรองสินค้าตาม Category (shop.html) |
| ❌ ยังไม่ทำ | Tab 2-5 แบบ Dynamic |

---

## ครั้งที่ 7 — ต่อสายระบบค้นหาและกรองหมวดหมู่ให้ทำงานจริง

**ไฟล์ที่แก้ไข:** `index.html`, `js/fetchProducts.js`

### การแก้ไข `index.html`:

1. **เพิ่ม `id="searchInput"`** ให้ช่อง search ใน Modal (บรรทัด 97)
   - เดิม: `<input type="search" class="form-control p-3" ...>`
   - ใหม่: `<input type="search" id="searchInput" class="form-control p-3" ...>`

2. **เปลี่ยน Tab Links** (บรรทัด 210-237)
   - ลบ `data-bs-toggle="pill"` ออก (ไม่ใช้ Bootstrap จัดการ tab อีกต่อไป)
   - เพิ่ม class `category-tab` สำหรับให้ JS เลือกได้
   - เพิ่ม `data-category="..."` กำกับชื่อหมวดหมู่ที่ตรงกับ JSON:
     - All Products → `data-category="All"`
     - Vegetables → `data-category="Vegetable"`
     - Fruits → `data-category="Fruits"`
     - Bread → `data-category="Bread"`
     - Meat → `data-category="Meat"`

3. **ลบ Hardcoded Tab Panes 2-5** (เดิมบรรทัด 250-425)
   - ลบ `<div id="tab-2">` ถึง `<div id="tab-5">` ทั้งหมดออก (~175 บรรทัด)
   - เหลือแค่ `<div id="product-container">` ตัวเดียวที่ render แบบ dynamic

### การแก้ไข `js/fetchProducts.js`:

1. **เพิ่มตัวแปร state:**
   - `currentCategory = 'All'` — เก็บหมวดหมู่ที่เลือกอยู่
   - `currentSearchTerm = ''` — เก็บคำค้นหาปัจจุบัน

2. **เพิ่มฟังก์ชัน `applyFilters()`**
   - เรียก `filterProducts(currentSearchTerm, currentCategory)` เพื่อกรอง
   - เรียก `renderUI(results)` เพื่อแสดงผล
   - ถ้าไม่พบสินค้า → แสดงข้อความ "No products found"

3. **ต่อสาย Category Tab Click Handlers**
   - เลือก `.category-tab` ทั้งหมดด้วย `querySelectorAll`
   - คลิกแท็บ → ลบ `active` จากแท็บอื่น → เพิ่ม `active` ให้แท็บที่คลิก
   - อ่านค่า `data-category` → อัปเดต `currentCategory` → เรียก `applyFilters()`

4. **ต่อสาย Search Input Handler**
   - ฟัง event `input` บน `#searchInput` (ค้นหาแบบ real-time ขณะพิมพ์)
   - อัปเดต `currentSearchTerm` → เรียก `applyFilters()`

5. **ต่อสาย Search Icon Click**
   - คลิก icon 🔍 ใน modal → ปิด modal อัตโนมัติ → ผู้ใช้เห็นผลลัพธ์ด้านล่าง

### ผลทดสอบ:
| ทดสอบ | ผลลัพธ์ |
|-------|---------|
| โหลดสินค้าตอนเปิดหน้า | ✅ แสดงสินค้าทั้ง 20 รายการ |
| คลิกแท็บ Fruits | ✅ แสดงเฉพาะสินค้าหมวด Fruits (7 รายการ) |
| คลิกแท็บ Vegetables | ✅ แสดงเฉพาะสินค้าหมวด Vegetable (8 รายการ) |
| คลิกแท็บ All Products | ✅ กลับมาแสดงทั้งหมด |
| ค้นหา "Banana" | ✅ แสดงเฉพาะ Banana |
| ค้นหาคำที่ไม่มี | ✅ แสดง "No products found" |
| ค้นหา + กรอง Category พร้อมกัน | ✅ ทำงานร่วมกันได้ |

---

## [2026-05-01] Dynamic Shopping Cart & Backend Restructuring

### 1. ระบบตะกร้าสินค้าแบบ Dynamic (Cart Module)
- **แยก `cart.js`**: สร้าง module กลางสำหรับจัดการตะกร้าสินค้า
- **localStorage Persistence**: เปลี่ยนจากการเก็บข้อมูลใน Memory เป็น localStorage ทำให้ผู้ใช้ไม่เสียข้อมูลเมื่อเปลี่ยนหน้าจาก Shop ไปยัง Cart
- **Event Delegation**: ใช้ Delegation ในการจับ Event การเพิ่มสินค้า (`.add-to-cart`) ในหน้า `index.html` และ Event การจัดการตะกร้า (`.cart-plus`, `.cart-minus`, `.cart-remove`) ในหน้า `cart.html`
- **Dynamic Rendering**: 
  - ลบ Mock Data ใน `cart.html` ทิ้ง
  - นำข้อมูลจาก localStorage มาสร้างแถว (row) สินค้าอัตโนมัติ
  - เพิ่มข้อความ "Your cart is empty" หากไม่มีสินค้า
  - คำนวณ Subtotal และ Total อัตโนมัติทุกครั้งที่มีการเปลี่ยนจำนวนสินค้า
- **UI Feedback**: เพิ่ม Animation บนปุ่ม Add to Cart ให้เปลี่ยนเป็นคำว่า "✓ Added!" ชั่วคราวเมื่อกด

### 2. ติดตั้ง Backend ด้วย Node.js & Express
- **เริ่มต้นโปรเจกต์**: `npm init -y` และติดตั้ง `express`
- **Controller-Route-Service Pattern**: จัดการโครงสร้างโค้ดฝั่ง Backend ให้ได้มาตรฐานและดูแลรักษาง่าย
  - **Route (`routes/products.js`)**: รับผิดชอบกำหนดเส้นทาง (Endpoints)
  - **Controller (`controllers/productController.js`)**: เป็นตัวกลางรับ HTTP Request ส่งให้ Service ประมวลผล และตอบกลับเป็น JSON พร้อม Status Code
  - **Service (`services/productService.js`)**: จัดการ Business Logic และ Data Access (อ่านไฟล์ `products.json`)
- **API Endpoints**:
  - `GET /api/products` — คืนค่าสินค้าทั้งหมด
  - `GET /api/products/:id` — คืนค่าสินค้า 1 รายการตาม ID (คืน 404 หากไม่พบ)

### 3. ปรับโครงสร้างโฟลเดอร์ (Project Restructuring)
- **ทำความสะอาด**: ลบไฟล์ที่ไม่ได้ใช้งานของ Template ต้นฉบับ (`Fruitables.jpg`, `READ-ME.txt`, `LICENSE.txt`)
- **แยก Frontend / Backend**:
  - สร้างโฟลเดอร์ `frontend/` และย้ายไฟล์ HTML, CSS, JS, Images ทั้งหมดเข้าไป
  - สร้างโฟลเดอร์ `backend/` และย้าย API, `server.js`, `products.json`, `node_modules`, และไฟล์ config ต่างๆ เข้าไป
- **อัปเดตการทำงาน**:
  - แก้ไข `backend/server.js` ให้ Serve Static Files ชี้ไปยัง `../frontend`
  - อัปเดต `frontend/js/fetchProducts.js` จากเดิมที่อ่าน `products.json` ในโฟลเดอร์เดียวกัน ให้ไปยิง API ขอข้อมูลจาก `fetch('/api/products')` ผ่าน Backend แทน
