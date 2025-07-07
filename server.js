const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// ✅ Serve HTML from /public
app.use(express.static(path.join(__dirname, 'public')));

const POCKET_API_URL = 'http://pay.threeg.asia/api';
const API_KEY = process.env.POCKET_API_KEY;
const SALT = process.env.POCKET_SALT;

app.post('/create-pocket-payment', async (req, res) => {
  try {
    const amount = 100;
    const return_url = "https://your-app-name.onrender.com/thank-you.html";
    const callback_url = "http://pocket-api.threeg.asia/callbase";

    const orderRes = await axios.post(`${POCKET_API_URL}/payments/getNewOrderId`, {
      api_key: API_KEY,
      salt: SALT
    });
    const order_id = orderRes.data.order_id;

    const hashRes = await axios.post(`${POCKET_API_URL}/payments/hash`, {
      api_key: API_KEY,
      salt: SALT,
      subamount_1: amount,
      subamount_1_label: "Order Total",
      subamount_2: 0,
      subamount_3: 0,
      subamount_4: 0,
      subamount_5: 0,
      order_id,
      order_info: `Order info ${order_id}`,
      order_desc: "Payment for Jom Jalan service",
      return_url,
      callback_url,
      discount: 0
    });

    const hashed_data = hashRes.data.hash;

    const createRes = await axios.post(`${POCKET_API_URL}/payments/create`, {
      api_key: API_KEY,
      salt: SALT,
      hashed_data,
      subamount_1: amount,
      subamount_2: 0,
      subamount_3: 0,
      subamount_4: 0,
      subamount_5: 0,
      subamount_1_label: "Order Total",
      subamount_2_label: "",
      subamount_3_label: "",
      subamount_4_label: "",
      subamount_5_label: "",
      order_id,
      order_info: `Order info ${order_id}`,
      order_desc: "Payment for Jom Jalan service",
      return_url,
      callback_url,
      discount: 0,
      promo: "",
      promo_code: ""
    });

    res.json({
      order_id,
      payment_url: createRes.data.payment_url,
      qr_code: createRes.data.qr_code
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// ✅ Use Render's PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
