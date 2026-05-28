/**
 * Cashfree PG config. Server and client checkout mode must match.
 * Set CASHFREE_ENVIRONMENT=production with production app credentials on the server.
 */
function normalizeCashfreeMode(value) {
  const raw = String(value || 'sandbox')
    .trim()
    .toLowerCase();
  if (['production', 'prod', 'live'].includes(raw)) {
    return 'production';
  }
  return 'sandbox';
}

const mode = normalizeCashfreeMode(process.env.CASHFREE_ENVIRONMENT);

function pickCredential(modeKey, genericKey) {
  const modeSpecific = process.env[modeKey];
  if (modeSpecific && String(modeSpecific).trim()) {
    return String(modeSpecific).trim().replace(/^["']|["']$/g, '');
  }
  const generic = process.env[genericKey];
  if (generic && String(generic).trim()) {
    return String(generic).trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

function resolveCredentials(forMode) {
  const isProd = forMode === 'production';
  const clientId = isProd
    ? pickCredential('CASHFREE_PRODUCTION_CLIENT_ID', 'CASHFREE_CLIENT_ID')
    : pickCredential('CASHFREE_SANDBOX_CLIENT_ID', 'CASHFREE_CLIENT_ID');
  const clientSecret = isProd
    ? pickCredential('CASHFREE_PRODUCTION_CLIENT_SECRET', 'CASHFREE_CLIENT_SECRET')
    : pickCredential('CASHFREE_SANDBOX_CLIENT_SECRET', 'CASHFREE_CLIENT_SECRET');
  return {
    clientId: clientId || 'TEST_CLIENT_ID',
    clientSecret: clientSecret || 'TEST_CLIENT_SECRET',
  };
}

const { clientId, clientSecret } = resolveCredentials(mode);

const config = {
  mode,
  isProduction: mode === 'production',
  clientId,
  clientSecret,
  apiVersion: '2023-08-01',
  ordersUrl:
    mode === 'production'
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders',
};

function getCashfreeHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-client-id': config.clientId,
    'x-client-secret': config.clientSecret,
    'x-api-version': config.apiVersion,
  };
}

function logCashfreeConfigOnBoot() {
  const idHint = config.clientId.slice(0, 8);
  console.log(
    `[cashfree] mode=${config.mode} api=${config.ordersUrl} client_id=${idHint}…`,
  );
  if (config.isProduction && /^test/i.test(config.clientId)) {
    console.warn(
      '[cashfree] CASHFREE_ENVIRONMENT is production but client id looks like a test id. Use production credentials from Cashfree dashboard.',
    );
  }
  if (!config.isProduction) {
    console.warn('[cashfree] Running in SANDBOX mode — test cards will appear at checkout.');
  }
  if (
    config.isProduction &&
    process.env.NODE_ENV !== 'production' &&
    !clientSecret.startsWith('cfsk_ma_prod')
  ) {
    console.warn(
      '[cashfree] Local dev + production mode: ensure CASHFREE_PRODUCTION_* keys are set.',
    );
  }
  if (config.isProduction && process.env.NODE_ENV !== 'production') {
    console.warn(
      '[cashfree] If create-order fails with connect timeout to api.cashfree.com, set CASHFREE_ENVIRONMENT=sandbox and add sandbox keys from the Cashfree dashboard.',
    );
  }
}

module.exports = {
  config,
  normalizeCashfreeMode,
  getCashfreeHeaders,
  logCashfreeConfigOnBoot,
};
