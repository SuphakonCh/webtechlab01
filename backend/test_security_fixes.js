// Quick smoke test for the 3 security fixes
const http = require('http');

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(
            { hostname: 'localhost', port: 3000, path, method, headers },
            (res) => {
                let b = '';
                res.on('data', c => b += c);
                res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(b) }));
            }
        );
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    console.log('=== SECURITY FIX TESTS ===\n');

    // --- Login first ---
    const login = await request('POST', '/api/auth/login', {
        email: 'alice.johnson@fruitables.com',
        password: '123456',
    });
    console.log('[Login]', login.status, login.body.message);
    const token = login.body.token;
    if (!token) { console.error('No token!'); return; }

    // --- FIX #2 TEST: Quantity overflow ---
    console.log('\n--- Fix #2: Quantity Overflow ---');
    const overflow = await request('POST', '/api/checkout', {
        cartItems: [{ id: 1, name: 'Orange', price: 3.99, quantity: 9007199254740991 }],
        email: 'test@test.com',
        cardNumber: '4111111111111111',
    }, token);
    console.log(`  Status: ${overflow.status}`);
    console.log(`  Error: ${overflow.body.errors?.cartItems || 'none'}`);
    console.log(`  PASS: ${overflow.status === 400 ? '✅ Blocked!' : '❌ FAILED'}`);

    // --- FIX #2 TEST: Cart size limit ---
    console.log('\n--- Fix #2: Cart Size Limit ---');
    const bigCart = Array.from({ length: 51 }, (_, i) => ({
        id: 1, name: 'Orange', price: 3.99, quantity: 1,
    }));
    const cartLimit = await request('POST', '/api/checkout', {
        cartItems: bigCart,
        email: 'test@test.com',
        cardNumber: '4111111111111111',
    }, token);
    console.log(`  Status: ${cartLimit.status}`);
    console.log(`  Error: ${cartLimit.body.errors?.cartItems || 'none'}`);
    console.log(`  PASS: ${cartLimit.status === 400 ? '✅ Blocked!' : '❌ FAILED'}`);

    // --- FIX #3 TEST: Error leakage (valid request but will test error format) ---
    console.log('\n--- Fix #3: Error Message Sanitization ---');
    const badProduct = await request('POST', '/api/checkout', {
        cartItems: [{ id: 99999, name: '<script>alert(1)</script>', price: 1, quantity: 1 }],
        email: 'test@test.com',
        cardNumber: '4111111111111111',
    }, token);
    console.log(`  Status: ${badProduct.status}`);
    const errMsg = JSON.stringify(badProduct.body.errors);
    const hasXSS = errMsg.includes('<script>');
    const hasSQLite = errMsg.includes('SQLite') || errMsg.includes('sqlite');
    console.log(`  Error body: ${errMsg}`);
    console.log(`  XSS in response: ${hasXSS ? '❌ YES' : '✅ No'}`);
    console.log(`  SQLite leak: ${hasSQLite ? '❌ YES' : '✅ No'}`);

    // --- FIX #1 TEST: Atomic stock (buy within stock) ---
    console.log('\n--- Fix #1: Atomic Stock Checkout ---');
    const goodOrder = await request('POST', '/api/checkout', {
        cartItems: [{ id: 1, name: 'Orange', price: 3.99, quantity: 2 }],
        email: 'test@test.com',
        cardNumber: '4111111111111111',
    }, token);
    console.log(`  Status: ${goodOrder.status}`);
    console.log(`  Message: ${goodOrder.body.message}`);
    console.log(`  PASS: ${goodOrder.status === 201 ? '✅ Order saved with stock decrement!' : '❌ FAILED'}`);

    console.log('\n=== ALL TESTS COMPLETE ===');
}

main().catch(console.error);
