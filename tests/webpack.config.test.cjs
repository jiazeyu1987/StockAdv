const test = require('node:test');
const assert = require('node:assert/strict');
const createConfig = require('../webpack.config.js');

test('development config serves localhost chat through the proxy contract', () => {
  const config = createConfig({}, { mode: 'development' });
  const proxy = config.devServer?.proxy?.['/api/proxy'];

  assert.equal(config.devServer?.port, 3266);
  assert.equal(proxy?.target, 'http://34.45.206.120:8088');
  assert.deepEqual(proxy?.pathRewrite, { '^/api/proxy': '' });
  assert.equal(proxy?.changeOrigin, true);
});

test('development proxy target can be configured from the environment', () => {
  const previous = process.env.STOCKADV_BACKEND_PROXY_TARGET;
  process.env.STOCKADV_BACKEND_PROXY_TARGET = 'http://127.0.0.1:8088';

  try {
    const config = createConfig({}, { mode: 'development' });
    assert.equal(config.devServer?.proxy?.['/api/proxy']?.target, 'http://127.0.0.1:8088');
  } finally {
    if (previous === undefined) {
      delete process.env.STOCKADV_BACKEND_PROXY_TARGET;
    } else {
      process.env.STOCKADV_BACKEND_PROXY_TARGET = previous;
    }
  }
});
