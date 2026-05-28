#!/usr/bin/env node
/**
 * Verify Cashfree env and API reachability. Run from repo root:
 *   npm run check:cashfree
 */
require('../loadEnv');
const { config } = require('../server/lib/cashfree');

async function main() {
const ENDPOINTS = {
  sandbox: 'https://sandbox.cashfree.com/pg/orders',
  production: 'https://api.cashfree.com/pg/orders',
};

async function probeReachability(label, url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const start = Date.now();
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    clearTimeout(timer);
    return {
      label,
      ok: true,
      status: res.status,
      ms: Date.now() - start,
    };
  } catch (err) {
    clearTimeout(timer);
    const code = err.cause?.code || err.code || err.name;
    return { label, ok: false, code, message: err.message };
  }
}

const id = config.clientId;
const secret = config.clientSecret;

console.log('\n--- Cashfree (from .env) ---');
console.log('mode:          ', config.mode);
console.log('orders API:    ', config.ordersUrl);
console.log('client id:     ', `${id.slice(0, 12)}… (${id.length} chars)`);
console.log(
  'secret prefix: ',
  secret.startsWith('cfsk_ma_prod')
    ? 'cfsk_ma_prod (production)'
    : secret.startsWith('cfsk_ma_test')
      ? 'cfsk_ma_test (SANDBOX)'
      : 'unknown',
);

if (config.isProduction && secret.includes('_test_')) {
  console.error('\n⚠️  CASHFREE_ENVIRONMENT=production but secret looks like TEST credentials.');
  process.exit(1);
}

console.log('\n--- Network reachability ---');
const [sandboxProbe, prodProbe] = await Promise.all([
  probeReachability('sandbox', ENDPOINTS.sandbox),
  probeReachability('production', ENDPOINTS.production),
]);

for (const p of [sandboxProbe, prodProbe]) {
  if (p.ok) {
    console.log(`✓ ${p.label}: reachable (HTTP ${p.status}, ${p.ms}ms)`);
  } else {
    console.log(`✗ ${p.label}: unreachable (${p.code || p.message})`);
  }
}

if (config.isProduction && !prodProbe.ok) {
  console.error(`
⚠️  Production Cashfree API is not reachable from this machine.
   create-order will fail with "fetch failed" / connect timeout.

   Local options:
   • Set CASHFREE_ENVIRONMENT=sandbox and use sandbox app id/secret in .env
   • Or test production checkout on Render/Vercel (server may reach api.cashfree.com)

   If production should work here: try another network, disable VPN, or check firewall.
`);
  process.exit(1);
}

if (!config.isProduction) {
  console.warn('\n⚠️  Sandbox mode — checkout will show test cards.');
  console.warn('   Set CASHFREE_ENVIRONMENT=production on deploy for live checkout.\n');
} else if (prodProbe.ok) {
  console.log('\n✓ Production API reachable; server config looks good.\n');
}
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
