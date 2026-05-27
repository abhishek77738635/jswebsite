const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { db } = require('../config/firebase');

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID || 'TEST_CLIENT_ID';
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET || 'TEST_CLIENT_SECRET';
const CASHFREE_ENVIRONMENT = process.env.CASHFREE_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'production'
const CASHFREE_URL = CASHFREE_ENVIRONMENT === 'sandbox' 
  ? 'https://sandbox.cashfree.com/pg/orders' 
  : 'https://api.cashfree.com/pg/orders';

// POST /api/payment/create-order
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const orderId = `order_${req.user.uid}_${Date.now()}`;
    
    // Construct order payload
    const orderPayload = {
      order_id: orderId,
      order_amount: 199.00, // Price for premium access
      order_currency: "INR",
      customer_details: {
        customer_id: req.user.uid,
        customer_email: req.user.email || 'customer@example.com',
        customer_phone: '9999999999' // placeholder if not available
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?order_id=${orderId}&payment_success=true`
      }
    };

    // Workaround for Node.js 22 built-in fetch when overriding TLS
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const response = await fetch(CASHFREE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': CASHFREE_CLIENT_ID,
        'x-client-secret': CASHFREE_CLIENT_SECRET,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(orderPayload)
    });

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

    // Parse the response based on content-type to handle errors more robustly
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
      console.error("Non-JSON response from Cashfree:", data);
    }

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create Cashfree order',
        error: data
      });
    }

    res.json({
      success: true,
      data: {
        payment_session_id: data.payment_session_id,
        order_id: data.order_id
      }
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating order' });
  }
});

// POST /api/payment/verify
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { order_id } = req.body;
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const response = await fetch(`${CASHFREE_URL}/${order_id}`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_CLIENT_ID,
        'x-client-secret': CASHFREE_CLIENT_SECRET,
        'x-api-version': '2023-08-01'
      }
    });
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

    const data = await response.json();

    if (response.ok && data.order_status === 'PAID') {
      // Payment successful, update user in Firestore
      await db.collection('users').doc(req.user.uid).update({
        hasPaid: true,
        updatedAt: new Date().toISOString()
      });

      return res.json({ success: true, message: 'Payment verified and access granted!' });
    } else {
      return res.status(400).json({ success: false, message: 'Payment not successful', status: data.order_status });
    }
  } catch (error) {
    console.error('Verify Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying order' });
  }
});

module.exports = router;
