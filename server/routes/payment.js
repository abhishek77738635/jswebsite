const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { db } = require('../config/firebase');
const { config, getCashfreeHeaders } = require('../lib/cashfree');

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

    const orderPayload = {
      order_id: orderId,
      order_amount: 199.0,
      order_currency: 'INR',
      customer_details: {
        customer_id: req.user.uid,
        customer_email: req.user.email || 'customer@example.com',
        customer_phone: '9999999999',
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

// POST /api/payment/verify
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { order_id } = req.body;

    const response = await fetch(`${config.ordersUrl}/${order_id}`, {
      method: 'GET',
      headers: getCashfreeHeaders(),
    });

    const data = await response.json();

    if (response.ok && data.order_status === 'PAID') {
      await db.collection('users').doc(req.user.uid).update({
        hasPaid: true,
        updatedAt: new Date().toISOString(),
      });

      return res.json({ success: true, message: 'Payment verified and access granted!' });
    }

    return res.status(400).json({
      success: false,
      message: 'Payment not successful',
      status: data.order_status,
    });
  } catch (error) {
    console.error('Verify Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying order' });
  }
});

module.exports = router;
