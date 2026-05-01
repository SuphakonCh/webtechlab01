// ========================================
// CART MODULE — Shared cart logic using localStorage
// ========================================
// This file manages the cart object and persists it in localStorage
// so that data is preserved across page navigations (e.g. index → cart page).
//
// localStorage stores data as strings, so we use JSON.stringify() to save
// and JSON.parse() to load the cart object.
//
// Cart structure (stored as JSON string in localStorage under key "cart"):
//   { "3": { name: "Raspberries", price: 6.99, image: "img/...", quantity: 2 },
//     "7": { name: "Parsley",     price: 1.99, image: "img/...", quantity: 1 } }
// ========================================

/**
 * getCart — Retrieves the cart object from localStorage.
 *
 * @returns {Object} The cart object, or an empty object if nothing is stored.
 */
function getCart() {
    // Try to read the "cart" key from localStorage
    const cartJSON = localStorage.getItem('cart');

    // If there's nothing stored yet, return an empty object
    if (!cartJSON) return {};

    // Parse the JSON string back into a JavaScript object
    try {
        return JSON.parse(cartJSON);
    } catch (e) {
        // If the JSON is corrupted, reset to empty
        console.error('Failed to parse cart from localStorage:', e);
        return {};
    }
}

/**
 * saveCart — Saves the cart object to localStorage.
 *
 * @param {Object} cart - The cart object to persist.
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * addToCart — Adds a product to the cart (or increments its quantity).
 *
 * @param {Object} product - A product object with id, name, price, image, etc.
 */
function addToCart(product) {
    const cart = getCart();
    const productId = String(product.id);

    if (cart[productId]) {
        // Product already in cart → increase quantity by 1
        cart[productId].quantity += 1;
    } else {
        // New product → add with quantity 1
        cart[productId] = {
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        };
    }

    saveCart(cart);
    updateCartBadge();

    // Log to console for verification
    console.log('Cart updated:', cart);
}

/**
 * removeFromCart — Completely removes a product from the cart.
 *
 * @param {string|number} productId - The ID of the product to remove.
 */
function removeFromCart(productId) {
    const cart = getCart();
    delete cart[String(productId)];
    saveCart(cart);
    updateCartBadge();
}

/**
 * updateQuantity — Sets the quantity of a product in the cart.
 *                  If quantity drops to 0 or below, the product is removed.
 *
 * @param {string|number} productId - The product ID.
 * @param {number} newQuantity - The new quantity to set.
 */
function updateQuantity(productId, newQuantity) {
    const cart = getCart();
    const id = String(productId);

    if (newQuantity <= 0) {
        // Quantity is zero or negative → remove the item entirely
        delete cart[id];
    } else if (cart[id]) {
        cart[id].quantity = newQuantity;
    }

    saveCart(cart);
    updateCartBadge();
}

/**
 * getCartTotal — Calculates the total number of items in the cart.
 *
 * @returns {number} Sum of all item quantities.
 */
function getCartTotalItems() {
    const cart = getCart();
    return Object.values(cart).reduce(function (sum, item) {
        return sum + item.quantity;
    }, 0);
}

/**
 * getCartSubtotal — Calculates the subtotal price of the cart.
 *
 * @returns {number} Sum of (price × quantity) for all items.
 */
function getCartSubtotal() {
    const cart = getCart();
    return Object.values(cart).reduce(function (sum, item) {
        return sum + (item.price * item.quantity);
    }, 0);
}

/**
 * updateCartBadge — Updates the cart item count badge in the navbar.
 *
 * This function looks for the shopping bag icon in the navbar and
 * updates the badge number next to it. It works on ALL pages because
 * the navbar structure is the same across the site.
 */
function updateCartBadge() {
    const totalItems = getCartTotalItems();

    // Find the badge element (the <span> inside the shopping-bag link)
    const badge = document.querySelector('.fa-shopping-bag')
        ?.closest('a')
        ?.querySelector('span');

    if (badge) {
        badge.textContent = totalItems;
    }
}

// ========================================
// CART PAGE RENDERING — Only runs on cart.html
// ========================================

/**
 * renderCartPage — Renders the cart table, totals, and wires up
 *                  all interactive buttons (plus, minus, remove).
 *
 * This function is called on cart.html to replace the static mock data
 * with real cart data from localStorage.
 */
function renderCartPage() {
    const cartTableBody = document.getElementById('cart-table-body');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const emptyCartMsg = document.getElementById('empty-cart-message');
    const cartContent = document.getElementById('cart-content');

    // If these elements don't exist, we're not on the cart page — skip.
    if (!cartTableBody) return;

    const cart = getCart();
    const cartItems = Object.entries(cart); // [ ["3", {name, price, ...}], ... ]

    // --- Handle empty cart ---
    if (cartItems.length === 0) {
        if (emptyCartMsg) emptyCartMsg.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    } else {
        if (emptyCartMsg) emptyCartMsg.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';
    }

    // --- Clear old rows ---
    cartTableBody.innerHTML = '';

    // --- Build a table row for each item ---
    cartItems.forEach(function ([productId, item]) {
        const itemTotal = (item.price * item.quantity).toFixed(2);

        const row = document.createElement('tr');
        row.setAttribute('data-id', productId);

        row.innerHTML = `
            <th scope="row">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" class="img-fluid me-5 rounded-circle" style="width: 80px; height: 80px;" alt="${item.name}">
                </div>
            </th>
            <td>
                <p class="mb-0 mt-4">${item.name}</p>
            </td>
            <td>
                <p class="mb-0 mt-4">$${item.price.toFixed(2)}</p>
            </td>
            <td>
                <div class="input-group quantity mt-4" style="width: 100px;">
                    <div class="input-group-btn">
                        <button class="btn btn-sm btn-minus rounded-circle bg-light border cart-minus" data-id="${productId}">
                            <i class="fa fa-minus"></i>
                        </button>
                    </div>
                    <input type="text" class="form-control form-control-sm text-center border-0 cart-qty-input" value="${item.quantity}" data-id="${productId}" readonly>
                    <div class="input-group-btn">
                        <button class="btn btn-sm btn-plus rounded-circle bg-light border cart-plus" data-id="${productId}">
                            <i class="fa fa-plus"></i>
                        </button>
                    </div>
                </div>
            </td>
            <td>
                <p class="mb-0 mt-4 item-total">$${itemTotal}</p>
            </td>
            <td>
                <button class="btn btn-md rounded-circle bg-light border mt-4 cart-remove" data-id="${productId}">
                    <i class="fa fa-times text-danger"></i>
                </button>
            </td>
        `;

        cartTableBody.appendChild(row);
    });

    // --- Update subtotal and total ---
    updateCartTotals();
}

/**
 * updateCartTotals — Recalculates and displays the subtotal and total on cart page.
 */
function updateCartTotals() {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    const SHIPPING_COST = 3.00;
    const subtotal = getCartSubtotal();
    const total = subtotal + SHIPPING_COST;

    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

// ========================================
// CART PAGE EVENT DELEGATION
// ========================================
// We use Event Delegation on the cart table body to handle all
// plus, minus, and remove button clicks with a single listener.

document.addEventListener('DOMContentLoaded', function () {
    // Update badge on every page load (works on all pages)
    updateCartBadge();

    // --- Cart page specific logic ---
    const cartTableBody = document.getElementById('cart-table-body');

    if (cartTableBody) {
        // Render the cart contents from localStorage
        renderCartPage();

        // Single click listener using Event Delegation on the table body
        cartTableBody.addEventListener('click', function (event) {
            // Check which type of button was clicked using .closest()

            // --- PLUS button ---
            const plusBtn = event.target.closest('.cart-plus');
            if (plusBtn) {
                const id = plusBtn.getAttribute('data-id');
                const cart = getCart();
                if (cart[id]) {
                    updateQuantity(id, cart[id].quantity + 1);
                    renderCartPage(); // Re-render the cart table
                }
                return;
            }

            // --- MINUS button ---
            const minusBtn = event.target.closest('.cart-minus');
            if (minusBtn) {
                const id = minusBtn.getAttribute('data-id');
                const cart = getCart();
                if (cart[id]) {
                    updateQuantity(id, cart[id].quantity - 1);
                    renderCartPage(); // Re-render (item may be removed if qty=0)
                }
                return;
            }

            // --- REMOVE button ---
            const removeBtn = event.target.closest('.cart-remove');
            if (removeBtn) {
                const id = removeBtn.getAttribute('data-id');
                removeFromCart(id);
                renderCartPage(); // Re-render without the removed item
                return;
            }
        });
    }
});
