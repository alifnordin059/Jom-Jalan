const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));

app.post("/fare", async (req, res) => {
  const { distance } = req.body;
  const base = 1.00;
  const perKm = 1.50;
  const fare = base + distance * perKm;
  res.json({ fare: fare.toFixed(2) });
});

app.post("/pay", async (req, res) => {
  const { amount, booking_ref, name, phone, pickup, dropoff } = req.body;
  const payload = {
    order_id: booking_ref,
    amount,
    currency: "BND",
    return_url: process.env.RETURN_URL,
    cancel_url: process.env.RETURN_URL,
    customer_email: "test@example.com"
  };
  try {
    const resp = await axios.post("https://sandbox.pocket.com.bn/api/payment", payload, {
      headers: {
        "X-POCKET-API-KEY": process.env.POCKET_API_KEY,
        "X-POCKET-SALT": process.env.POCKET_SALT
      }
    });
    res.json({ redirect: resp.data.redirect_url });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
