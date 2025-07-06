const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());

// ✅ Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Route to serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ✅ Payment callback handler (optional for status tracking)
app.post('/payment-callback', (req, res) => {
  console.log('📩 Payment Callback Received:', req.body);
  res.sendStatus(200); // Reply to Pocket that callback was received
});

// ✅ Pocket Pay payment endpoint
app.post('/create-pocket-payment', async (req, res) => {
  try {
    const orderId = Math.floor(10000 + Math.random() * 90000);

    const payload = {
      api_key: "XnUgH1PyIZ8p1iF2IbKUiOBzdrLPNnWq",
      salt: "FOLzaoJSdbgaNiVVA73vGiIR7yovZury4OdOalPFoWTdKmDVxfoJCJYTs4nhUFS2",
      amount: req.body.amount || 100,
      subamount_1: req.body.amount || 100,
      subamount_1_label: "Order Total",
      subamount_2: 0,
      subamount_3: 0,
      subamount_4: 0,
      subamount_5: 0,
      order_id: orderId,
      order_info: `Order Info ${orderId}`,
      order_desc: "Taxi / Tour Booking",
      return_url: "https://jom-jalan-taxi-brunei-services.onrender.com/thank-you",
      callback_url: "https://jom-jalan-taxi-brunei-services.onrender.com/payment-callback",
      discount: 0
    };

    const response = await axios.post("http://pay.threeg.asia/payments/getNewOrderId", payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    const redirectUrl = response.data?.data?.redirect_url;

    if (!redirectUrl) {
      return res.status(400).json({
        error: "No redirect URL returned from Pocket Pay",
        details: response.data
      });
    }

    res.json({ payment_url: redirectUrl });

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Pocket Pay request failed",
      details: error.response?.data || error.message
    });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
});
