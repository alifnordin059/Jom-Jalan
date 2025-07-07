const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const POCKET_API_URL = 'http://pay.threeg.asia/api';
const API_KEY = process.env.POCKET_API_KEY;
const SALT = process.env.POCKET_SALT;

app.post('/create-pocket-payment', async (req, res) => {
  try {
    const amount = 100; // Example fixed amount
    const return_url = "https://www.threegmedia.com/";
    const callback_url = "http://pocket-api.threeg.asia/callbase";

    // STEP 1: Get New Order ID
    const orderRes = await axios.post(`${POCKET_API_URL}/payments/getNewOrderId`, {
      api_key: API_KEY,
      salt: SALT
    });
    const order_id = orderRes.data.order_id;

    // STEP 2: Generate Hash
    const hashPayload = {
      api_key: API_KEY,
      salt: SALT,
      subamount_1: amount,
      subamount_1_label: "Order Total",
      subamount_2: 0,
      subamount_3: 0,
      subamount_4: 0,
      subamount_5: 0,
      order_id,
      order_info: `This is the order info ${order_id}.`,
      order_desc: "City Tour Booking",
      return_url,
      callback_url,
      discount: 0
    };

    const hashRes = await axios.post(`${POCKET_API_URL}/payments/hash`, hashPayload);
    const hashed_data = hashRes.data.hash;

    // STEP 3: Create Payment Link & QR
    const createPayload = {
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
      order_info: `This is the order info ${order_id}.`,
      order_desc: "City Tour Booking",
      return_url,
      callback_url,
      discount: 0,
      promo: "",
      promo_code: ""
    };

    const createRes = await axios.post(`${POCKET_API_URL}/payments/create`, createPayload);

    // ✅ Response to frontend
    res.json({
      order_id,
      payment_url: createRes.data.payment_url,
      qr_code: createRes.data.qr_code
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Payment link generation failed' });
  }
});

app.listen(3000, () => console.log('✅ PocketPay Node server running on port 3000'));
