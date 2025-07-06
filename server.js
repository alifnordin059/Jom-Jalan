const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());

// ✅ Serve static files from /public folder
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Route to serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ✅ Callback route (Pocket Pay will notify you here)
app.post('/payment-callback', (req, res) => {
  console.log('📩 Pocket Pay callback received:', req.body);
  res.sendStatus(200); // Tell Pocket Pay we received the callback
});

// ✅ Pocket Pay API integration route
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

    console.log("📦 Pocket response:", response.data);

    const newId = response.data?.data?.new_id;

    if (!newId) {
      return res.status(400).json({
        error: "No order ID returned from Pocket Pay",
        details: response.data
      });
    }

    const redirectUrl = `http://pay.threeg.asia/payments/payNow/${newId}`;

    res.json({ payment_url: redirectUrl });

  } catch (error) {
    console.error("❌ Pocket Pay error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Pocket Pay request failed",
      details: error.response?.data || error.message
    });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚕 Server is running on port ${PORT}`);
});
