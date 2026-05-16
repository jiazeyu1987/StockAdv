const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const repoRoot = path.resolve(__dirname, '..');
const accountsSource = fs.readFileSync(path.join(repoRoot, 'src/config/accounts.ts'), 'utf8');

const accountPattern =
  /\{\s*username:\s*'(?<username>user\d)',\s*password:\s*'(?<password>\d+)',\s*dailyQueryLimit:\s*(?<limit>null|\d+)\s*\}/g;

const accounts = Array.from(accountsSource.matchAll(accountPattern), (match) => ({
  username: match.groups.username,
  password: match.groups.password,
  dailyQueryLimit: match.groups.limit === 'null' ? null : Number(match.groups.limit),
}));

test('local account registry contains exactly user0 through user9', () => {
  assert.deepEqual(
    accounts.map((account) => account.username),
    Array.from({ length: 10 }, (_, index) => `user${index}`)
  );
});

test('local accounts use 8 digit passwords', () => {
  for (const account of accounts) {
    assert.match(account.password, /^\d{8}$/);
  }
});

test('user0 is unlimited and user1 through user9 have 10 daily queries', () => {
  assert.equal(accounts[0].dailyQueryLimit, null);

  for (const account of accounts.slice(1)) {
    assert.equal(account.dailyQueryLimit, 10);
  }
});
