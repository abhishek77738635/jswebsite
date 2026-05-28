import { load } from '@cashfreepayments/cashfree-js';

/**
 * Open Cashfree hosted checkout.
 * Uses full-page redirect (_top) by default — modal iframes load api.cashfree.com
 * inside the page and fail when that host is blocked on the user's network.
 */
export async function openCashfreeCheckout({ paymentSessionId, mode }) {
  if (!paymentSessionId) {
    throw new Error('Missing payment session id');
  }

  const cashfreeMode = mode === 'production' ? 'production' : 'sandbox';

  let cashfree;
  try {
    cashfree = await load({ mode: cashfreeMode });
  } catch (err) {
    throw new Error(
      err?.message ||
        'Could not load Cashfree. Check your connection or disable ad blockers.',
    );
  }

  if (!cashfree || typeof cashfree.checkout !== 'function') {
    throw new Error(
      'Cashfree SDK did not initialize. Disable ad blockers and reload the page.',
    );
  }

  const base = { paymentSessionId };

  const run = (redirectTarget) =>
    cashfree.checkout({ ...base, redirectTarget });

  // Full-page checkout (recommended). Avoids modal iframe to api.cashfree.com.
  let result;
  try {
    result = await run('_top');
  } catch (topErr) {
    console.warn('[cashfree] _top checkout threw:', topErr);
    result = { error: { message: topErr.message || 'Checkout failed to open' } };
  }

  if (result?.error) {
    const msg = result.error.message || 'Payment could not open';
    if (/whitelist|not enabled|not approved/i.test(msg)) {
      throw new Error(
        `${msg} Add https://jswebsite-client.vercel.app in Cashfree Dashboard → Developers → Whitelisting.`,
      );
    }
    if (
      cashfreeMode === 'production' &&
      /closed the connection|failed to fetch|network|timeout/i.test(msg)
    ) {
      throw new Error(
        'Your network cannot reach api.cashfree.com (production checkout). Try mobile hotspot, turn off VPN, or use a different Wi‑Fi. Sandbox works on many networks for testing.',
      );
    }
    throw new Error(msg);
  }

  if (result?.redirect) {
    return { ...result, usedRedirect: true };
  }

  // _top usually navigates away; if we are still here, modal-style result
  return result;
}
