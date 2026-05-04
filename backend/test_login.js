/**
 * test_login.js — Quick integration test for POST /api/auth/login
 * Run: node test_login.js
 */

const http = require('http');

function post(body, label) {
    return new Promise((resolve) => {
        const payload = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                console.log(`\n─── ${label} ───`);
                console.log(`Status : ${res.statusCode}`);
                try {
                    const json = JSON.parse(data);
                    if (json.token) {
                        // Truncate for readability
                        console.log('token  :', json.token.substring(0, 60) + '…');
                        console.log('user   :', json.user);
                    } else {
                        console.log('body   :', json);
                    }
                } catch {
                    console.log('body   :', data);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.error(`\n─── ${label} — NETWORK ERROR ───`);
            console.error(err.message);
            resolve();
        });

        req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('=== Fruitables Auth Integration Tests ===');

    // Test 1: Valid credentials
    await post(
        { email: 'alice.johnson@fruitables.com', password: '123456' },
        'TEST 1 — Valid credentials (expect 200 + token)'
    );

    // Test 2: Wrong password
    await post(
        { email: 'alice.johnson@fruitables.com', password: 'wrongpassword' },
        'TEST 2 — Wrong password (expect 401)'
    );

    // Test 3: Unknown user
    await post(
        { email: 'ghost@fruitables.com', password: '123456' },
        'TEST 3 — Unknown email (expect 401)'
    );

    // Test 4: Missing fields
    await post(
        { email: 'alice.johnson@fruitables.com' },
        'TEST 4 — Missing password field (expect 400)'
    );

    console.log('\n=== Tests complete ===\n');
}

runTests();
