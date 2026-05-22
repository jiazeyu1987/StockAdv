const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const createConfig = require('../webpack.config.js');

test('development config serves localhost chat through the proxy contract', () => {
  const config = createConfig({}, { mode: 'development' });
  const proxy = config.devServer?.proxy?.['/api/proxy'];
  const accountManagerProxy = config.devServer?.proxy?.['/api/account-manager'];

  assert.equal(config.devServer?.port, 3266);
  assert.equal(proxy?.target, 'http://34.45.206.120:8088');
  assert.deepEqual(proxy?.pathRewrite, { '^/api/proxy': '' });
  assert.equal(proxy?.changeOrigin, true);
  assert.equal(accountManagerProxy?.target, 'http://127.0.0.1:8090');
  assert.deepEqual(accountManagerProxy?.pathRewrite, { '^/api/account-manager': '' });
  assert.equal(accountManagerProxy?.changeOrigin, true);
});

test('development proxy target can be configured from the environment', () => {
  const previous = process.env.STOCKADV_BACKEND_PROXY_TARGET;
  const previousAccountManager = process.env.STOCKADV_ACCOUNT_MANAGER_PROXY_TARGET;
  process.env.STOCKADV_BACKEND_PROXY_TARGET = 'http://127.0.0.1:8088';
  process.env.STOCKADV_ACCOUNT_MANAGER_PROXY_TARGET = 'http://127.0.0.1:8091';

  try {
    const config = createConfig({}, { mode: 'development' });
    assert.equal(config.devServer?.proxy?.['/api/proxy']?.target, 'http://127.0.0.1:8088');
    assert.equal(config.devServer?.proxy?.['/api/account-manager']?.target, 'http://127.0.0.1:8091');
  } finally {
    if (previous === undefined) {
      delete process.env.STOCKADV_BACKEND_PROXY_TARGET;
    } else {
      process.env.STOCKADV_BACKEND_PROXY_TARGET = previous;
    }
    if (previousAccountManager === undefined) {
      delete process.env.STOCKADV_ACCOUNT_MANAGER_PROXY_TARGET;
    } else {
      process.env.STOCKADV_ACCOUNT_MANAGER_PROXY_TARGET = previousAccountManager;
    }
  }
});

test('webpack define plugin exposes backend globals and backend config guards missing globals safely', () => {
  const config = createConfig({}, { mode: 'development' });
  const definePlugin = config.plugins?.find((plugin) => plugin?.definitions);
  const backendSource = fs.readFileSync(path.join(__dirname, '../src/config/backend.ts'), 'utf8');

  assert.ok(definePlugin, 'missing DefinePlugin with backend globals');
  assert.equal(definePlugin.definitions.__STOCKADV_BACKEND_API_BASE_URL__, JSON.stringify('/api/proxy/v1'));
  assert.equal(definePlugin.definitions.__STOCKADV_PROXY_ACCESS_TOKEN__, JSON.stringify('replace-with-proxy-access-token'));
  assert.equal(definePlugin.definitions.__STOCKADV_SESSION_ID__, JSON.stringify('web-chat-session'));
  assert.equal(
    definePlugin.definitions.__STOCKADV_ACCOUNT_MANAGER_API_BASE_URL__,
    JSON.stringify('/api/account-manager/v1')
  );

  assert.match(backendSource, /typeof __STOCKADV_BACKEND_API_BASE_URL__ !== 'undefined'/);
  assert.match(backendSource, /typeof __STOCKADV_PROXY_ACCESS_TOKEN__ !== 'undefined'/);
  assert.match(backendSource, /typeof __STOCKADV_SESSION_ID__ !== 'undefined'/);
  assert.match(backendSource, /typeof __STOCKADV_ACCOUNT_MANAGER_API_BASE_URL__ !== 'undefined'/);
});
