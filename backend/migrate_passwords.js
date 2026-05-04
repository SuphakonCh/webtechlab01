/**
 * migrate_passwords.js
 * =====================
 * ONE-TIME MIGRATION SCRIPT
 *
 * Problem: users.json stores passwords as plain MD5 hashes.
 * bcrypt cannot compare against MD5 — it needs its own salted format.
 *
 * Solution: Map each user's known plaintext password → bcrypt hash,
 * then overwrite users.json with the new hashes.
 *
 * Run ONCE with: node migrate_passwords.js
 * Delete this file after migration is confirmed.
 */

const bcrypt = require('bcrypt');
const fs     = require('fs');
const path   = require('path');

// The SALT_ROUNDS constant controls how expensive bcrypt's hashing is.
// 10 is the industry-standard default: secure but fast enough for a login endpoint.
const SALT_ROUNDS = 10;

// Plaintext passwords mapped to their email (same order as users.json)
// These come from the credentials table generated in the previous step.
const PLAINTEXT_MAP = {
    'alice.johnson@fruitables.com':  '123456',
    'bob.smith@fruitables.com':      '123456789',
    'carol.white@fruitables.com':    'password',
    'david.lee@fruitables.com':      '12345678',
    'emma.davis@fruitables.com':     'secret',
    'frank.miller@fruitables.com':   '111111',
    'grace.wilson@fruitables.com':   'qwerty',
    'henry.moore@fruitables.com':    'p',
    'iris.taylor@fruitables.com':    '1',
    'james.anderson@fruitables.com': '2',
};

const USERS_PATH = path.join(__dirname, 'users.json');

async function migrate() {
    console.log('Starting password migration: MD5 → bcrypt...\n');

    const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));

    const migrated = await Promise.all(
        users.map(async (user) => {
            const plaintext = PLAINTEXT_MAP[user.username];
            if (!plaintext) {
                throw new Error(`No plaintext mapping found for: ${user.username}`);
            }
            const hash = await bcrypt.hash(plaintext, SALT_ROUNDS);
            console.log(`  ✔ Hashed password for ${user.username}`);
            return { ...user, password: hash };
        })
    );

    fs.writeFileSync(USERS_PATH, JSON.stringify(migrated, null, 2), 'utf-8');
    console.log('\n✅ Migration complete. users.json updated with bcrypt hashes.');
    console.log('   You may now delete migrate_passwords.js.\n');
}

migrate().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
