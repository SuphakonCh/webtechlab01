// ========================================
// CHECKOUT MODULE — checkout.js
// ========================================
// จัดการ logic ของหน้า Checkout:
//   1. แสดงสินค้าจาก cart (localStorage) ในตาราง
//   2. ส่ง POST /api/checkout พร้อม JWT Token
//   3. แสดงผลลัพธ์ (สำเร็จ / error)
//
// 🔒 ต้อง Login ก่อน:
//   - ถ้าไม่มี token ใน localStorage → redirect ไป login.html
//   - ถ้า token หมดอายุ → server ตอบ 401 → redirect ไป login.html
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    // -------------------------------------------------------
    // ❶ เช็คว่า login แล้วหรือยัง
    // -------------------------------------------------------
    const token = localStorage.getItem('token');
    if (!token) {
        alert('กรุณา Login ก่อนทำรายการ Checkout');
        window.location.href = 'login.html';
        return;
    }

    // -------------------------------------------------------
    // ❷ แสดงสินค้าจาก cart ในตาราง
    // -------------------------------------------------------
    renderCheckoutTable();

    // -------------------------------------------------------
    // ❸ Wire up ปุ่ม Place Order
    // -------------------------------------------------------
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }
});

/**
 * renderCheckoutTable — แสดงสินค้าจาก localStorage ในตาราง checkout
 */
function renderCheckoutTable() {
    const tableBody = document.getElementById('checkout-table-body');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');

    if (!tableBody) return;

    const cart = getCart(); // จาก cart.js (shared)
    const cartItems = Object.entries(cart);

    // ถ้าตะกร้าว่าง
    if (cartItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <p class="text-muted">ตะกร้าว่าง — กรุณาเลือกสินค้าก่อน</p>
                    <a href="shop.html" class="btn btn-primary rounded-pill px-4">ไปหน้า Shop</a>
                </td>
            </tr>
        `;
        return;
    }

    // สร้างแถวสินค้า
    let subtotal = 0;
    tableBody.innerHTML = '';

    cartItems.forEach(function ([productId, item]) {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const row = document.createElement('tr');

        // Image cell — built with DOM APIs to prevent XSS
        const imgCell = document.createElement('th');
        imgCell.scope = 'row';
        const imgDiv = document.createElement('div');
        imgDiv.className = 'd-flex align-items-center mt-2';
        const img = document.createElement('img');
        img.src = item.image;
        img.className = 'img-fluid rounded-circle';
        img.style.width = '90px';
        img.style.height = '90px';
        img.alt = item.name;
        imgDiv.appendChild(img);
        imgCell.appendChild(imgDiv);
        row.appendChild(imgCell);

        // Name cell — textContent auto-escapes HTML
        const nameCell = document.createElement('td');
        nameCell.className = 'py-5';
        nameCell.textContent = item.name;
        row.appendChild(nameCell);

        // Price cell
        const priceCell = document.createElement('td');
        priceCell.className = 'py-5';
        priceCell.textContent = '$' + item.price.toFixed(2);
        row.appendChild(priceCell);

        // Quantity cell
        const qtyCell = document.createElement('td');
        qtyCell.className = 'py-5';
        qtyCell.textContent = item.quantity;
        row.appendChild(qtyCell);

        // Total cell
        const totalCell = document.createElement('td');
        totalCell.className = 'py-5';
        totalCell.textContent = '$' + itemTotal.toFixed(2);
        row.appendChild(totalCell);

        tableBody.appendChild(row);
    });

    // แสดง subtotal + total
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (totalEl)    totalEl.textContent    = '$' + subtotal.toFixed(2);
}

/**
 * handlePlaceOrder — ส่ง checkout request ไปที่ server
 * พร้อม JWT Token ใน Authorization header
 */
async function handlePlaceOrder() {
    const placeOrderBtn = document.getElementById('place-order-btn');
    const resultDiv = document.getElementById('checkout-result');

    // ป้องกันกดซ้ำ
    if (placeOrderBtn) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Processing...';
    }

    // ดึงข้อมูลจาก form
    const emailInput = document.getElementById('email-input');
    const cardInput  = document.getElementById('card-number-input');
    const email      = emailInput ? emailInput.value.trim() : '';
    const cardNumber = cardInput  ? cardInput.value.trim()  : '';

    // สร้าง cartItems array จาก localStorage
    const cart = getCart();
    const cartItems = Object.entries(cart).map(function ([productId, item]) {
        return {
            id:       Number(productId),
            name:     item.name,
            price:    item.price,
            quantity: item.quantity,
        };
    });

    // ถ้าตะกร้าว่าง
    if (cartItems.length === 0) {
        showResult(resultDiv, 'danger', 'ตะกร้าว่าง กรุณาเลือกสินค้าก่อน');
        resetButton(placeOrderBtn);
        return;
    }

    try {
        // -------------------------------------------------------
        // ส่ง POST /api/checkout พร้อม JWT Token
        // -------------------------------------------------------
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,  // ← JWT Token
            },
            body: JSON.stringify({
                cartItems,
                email,
                cardNumber,
            }),
        });

        const data = await response.json();

        if (response.status === 201) {
            // ✅ สำเร็จ — ล้างตะกร้า
            showResult(resultDiv, 'success',
                `🎉 ${data.message} (Order #${data.orderId}, Total: $${data.total.toFixed(2)})`
            );
            localStorage.removeItem('cart');
            updateCartBadge();
            renderCheckoutTable(); // แสดงตะกร้าว่าง

        } else if (response.status === 401) {
            // 🔒 Token หมดอายุ → redirect ไป login
            alert('Session หมดอายุ กรุณา Login ใหม่');
            localStorage.removeItem('token');
            window.location.href = 'login.html';

        } else {
            // ❌ Validation error หรือ save error
            let errorMsg = data.message || 'เกิดข้อผิดพลาด';

            if (data.errors) {
                const errorDetails = Object.entries(data.errors)
                    .map(([field, msg]) => {
                        if (Array.isArray(msg)) return msg.join(', ');
                        return `${field}: ${msg}`;
                    })
                    .join('\n');
                errorMsg += '\n\n' + errorDetails;
            }

            showResult(resultDiv, 'danger', errorMsg);
        }

    } catch (err) {
        console.error('Checkout fetch error:', err);
        showResult(resultDiv, 'danger', 'ไม่สามารถเชื่อมต่อกับ server ได้');
    }

    resetButton(placeOrderBtn);
}

/**
 * showResult — แสดงข้อความผลลัพธ์ในหน้า checkout
 */
function showResult(container, type, message) {
    if (!container) return;
    // Use DOM APIs instead of innerHTML to prevent XSS
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-' + type + ' mt-3';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.style.whiteSpace = 'pre-line';
    alertDiv.textContent = message;  // textContent auto-escapes HTML
    container.innerHTML = '';
    container.appendChild(alertDiv);
    container.scrollIntoView({ behavior: 'smooth' });
}

/**
 * resetButton — คืนสถานะปุ่ม Place Order
 */
function resetButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.textContent = 'Place Order';
}
