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
