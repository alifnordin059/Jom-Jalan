require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper: Get new order ID from Pocket Pay
async function getOrderId() {
  try {
    const response = await axios.post('http://pay.threeg.asia/payments/getNewOrderId', {
      api_key: process.env.POCKET_API_KEY,
      salt: process.env.POCKET_SALT
    });

    return response.data.order_id;
  } catch (error) {
    console.error('❌ Failed to get order ID:', error.response?.data || error.message);
    throw new Error('Order ID generation failed');
  }
}

// Payment endpoint
app.post('/pay', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid or missing amount' });
    }

    const orderId = await getOrderId();

    const payload = {
      amount,
      order_id: orderId,
      currency: 'BND',
      callback_url: `${req.protocol}://${req.get('host')}/payment-callback`,
      return_url: process.env.RETURN_URL,
    };

    const response = await axios.post(
      process.env.POCKET_API_URL || 'http://pay.threeg.asia/api/payment',
      payload,
      {
        headers: {
          'X-API-KEY': process.env.POCKET_API_KEY,
          'X-API-SALT': process.env.POCKET_SALT,
          'Content-Type': 'application/json',
        },
      }
    );

    const redirectUrl = response.data.payment_url || response.data.redirect_url;

    if (!redirectUrl) {
      return res.status(500).json({ error: 'No redirect URL returned from Pocket Pay' });
    }

    res.json({ paymentUrl: redirectUrl });
  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// Pocket Pay callback
app.post('/payment-callback', (req, res) => {
  console.log('📩 Pocket Pay callback received:', req.body);

  const { status, order_id } = req.body;

  if (status === 'SUCCESS') {
    console.log(`✅ Order ${order_id} paid successfully.`);
    // Save or update in DB here
  } else {
    console.log(`❌ Order ${order_id} failed or cancelled.`);
    // Update status
  }

  res.sendStatus(200);
});

// After payment redirect
app.get('/payment-success', (req, res) => {
  res.send(`<h1>✅ Payment Successful</h1><p>Thank you for your booking.</p>`);
});

// Simple file creation (optional)
fs.writeFileSync('mynewfile.txt', 'This is my new file!');

// Start server
app.listen(PORT, () => {
  console.log(`🚕 Jom Jalan server running on http://localhost:${PORT}`);
});