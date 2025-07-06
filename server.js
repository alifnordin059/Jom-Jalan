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
