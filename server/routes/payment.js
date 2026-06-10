const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { db } = require('../config/firebase');
const { config, getCashfreeHeaders } = require('../lib/cashfree');

const PREMIUM_PRICE_INR = Number(process.env.PREMIUM_PRICE_INR || 10);
const { isValidIndianPhone, normalizeIndianPhone } = require('../lib/phone');

/** HTTPS base URL for Cashfree return_url (production requires https). */
function resolveFrontendBaseUrl(req) {
  const fromEnv = String(process.env.FRONTEND_URL || '')
    .trim()
    .replace(/\/$/, '');
  if (
    fromEnv &&
    fromEnv.startsWith('https://') &&
    !/localhost|127\.0\.0\.1/i.test(fromEnv)
  ) {
    return fromEnv;
  }

  const origin = String(req.get('origin') || '')
    .trim()
    .replace(/\/$/, '');
  if (origin.startsWith('https://')) {
    return origin;
  }

  const referer = req.get('referer');
  if (referer) {
    try {
      const u = new URL(referer);
      if (u.protocol === 'https:') {
        return `${u.protocol}//${u.host}`;
      }
    } catch {
      /* ignore bad referer */
    }
  }

  if (fromEnv && !config.isProduction) {
    return fromEnv;
  }

  return fromEnv || 'http://localhost:5001';
}

// POST /api/payment/create-order
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const orderId = `order_${req.user.uid}_${Date.now()}`;
    const frontendBase = resolveFrontendBaseUrl(req);
    const returnUrl = `${frontendBase}/?order_id=${orderId}&payment_success=true`;

    if (config.isProduction && !returnUrl.startsWith('https://')) {
      return res.status(500).json({
        success: false,
        message:
          'Cashfree production requires an HTTPS return URL. Set FRONTEND_URL=https://jswebsite-client.vercel.app on the API host (Vercel env vars).',
        cashfreeMode: config.mode,
      });
    }

    const customerPhone = normalizeIndianPhone(req.user.phone);
    if (!isValidIndianPhone(customerPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Add a valid phone number in your profile before paying.',
        code: 'PHONE_REQUIRED',
      });
    }

    const orderPayload = {
      order_id: orderId,
      order_amount: PREMIUM_PRICE_INR,
      order_currency: 'INR',
      customer_details: {
        customer_id: req.user.uid,
        customer_email: req.user.email || 'customer@example.com',
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: returnUrl,
      },
    };

    const response = await fetch(config.ordersUrl, {
      method: 'POST',
      headers: getCashfreeHeaders(),
      body: JSON.stringify(orderPayload),
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.indexOf('application/json') !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
      console.error('Non-JSON response from Cashfree:', data);
    }

    if (!response.ok) {
      console.error('[payment] Cashfree create-order failed:', response.status, data);
      const cfMessage =
        typeof data === 'object' && data !== null
          ? data.message || data.error_description || JSON.stringify(data)
          : String(data);
      return res.status(400).json({
        success: false,
        message: cfMessage || 'Failed to create Cashfree order',
        error: data,
        cashfreeMode: config.mode,
      });
    }

    if (!data.payment_session_id) {
      console.error('[payment] Cashfree response missing payment_session_id:', data);
      return res.status(502).json({
        success: false,
        message: 'Cashfree did not return a payment session',
        error: data,
        cashfreeMode: config.mode,
      });
    }

    res.json({
      success: true,
      data: {
        payment_session_id: data.payment_session_id,
        order_id: data.order_id || orderId,
        mode: config.mode,
      },
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    const cause = error.cause || error;
    const isConnectTimeout =
      cause.code === 'UND_ERR_CONNECT_TIMEOUT' ||
      cause.code === 'ETIMEDOUT' ||
      cause.code === 'ECONNREFUSED' ||
      /connect timeout|fetch failed/i.test(String(error.message));

    if (isConnectTimeout && config.isProduction) {
      return res.status(503).json({
        success: false,
        message:
          'Cannot reach Cashfree production API (api.cashfree.com) from this network. Use sandbox locally (CASHFREE_ENVIRONMENT=sandbox) or test payments on your deployed server.',
        cashfreeMode: config.mode,
        hint: 'Run: npm run check:cashfree',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating order',
      cashfreeMode: config.mode,
    });
  }
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchCashfreeOrder(orderId) {
  const response = await fetch(`${config.ordersUrl}/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: getCashfreeHeaders(),
  });
  const contentType = response.headers.get('content-type') || '';
  const data =
    contentType.includes('application/json') ? await response.json() : await response.text();
  return { response, data };
}

function isOrderPaid(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.order_status === 'PAID') return true;
  const payments = data.payments || data.payment || [];
  const list = Array.isArray(payments) ? payments : [payments];
  return list.some((p) => p && (p.payment_status === 'SUCCESS' || p.payment_status === 'PAID'));
}

// POST /api/payment/verify
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { order_id: orderId } = req.body;
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ success: false, message: 'order_id is required' });
    }

    if (!orderId.includes(req.user.uid)) {
      return res.status(403).json({ success: false, message: 'Order does not belong to this user' });
    }

    const maxAttempts = 6;
    let lastData = null;
    let lastOk = false;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const { response, data } = await fetchCashfreeOrder(orderId);
      lastData = data;
      lastOk = response.ok;

      if (response.ok && isOrderPaid(data)) {
        await db.collection('users').doc(req.user.uid).set(
          {
            email: req.user.email,
            displayName: req.user.name || req.user.email?.split('@')[0] || 'User',
            hasPaid: true,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );

        return res.json({
          success: true,
          message: 'Payment verified and access granted!',
          data: { hasPaid: true },
        });
      }

      if (attempt < maxAttempts - 1) {
        await sleep(1500);
      }
    }

    const status =
      typeof lastData === 'object' && lastData !== null
        ? lastData.order_status
        : undefined;

    return res.status(400).json({
      success: false,
      message:
        status === 'ACTIVE'
          ? 'Payment is still processing. Wait a moment and refresh the page.'
          : 'Payment not successful',
      status,
      cashfreeMode: config.mode,
    });
  } catch (error) {
    console.error('Verify Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying order' });
  }
});

module.exports = router;
