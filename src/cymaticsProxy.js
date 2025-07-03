const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express(); // ← This is the missing line!
const PORT = process.env.PORT || 3000;

app.get("/status-url", async (req, res) => {
  const orderId = req.query.order_id;
  console.log("Received order ID:", orderId);

  if (!orderId) {
    return res.status(400).json({ error: "Missing order_id parameter" });
  }

  try {
    const apiUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.API_VERSION}/orders/${orderId}/metafields.json`;
    console.log("Calling Shopify API:", apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const metafields = response.data.metafields;
    console.log("All metafields returned:", metafields);

    const statusUrl = metafields.find(
      (m) => m.namespace === "custom" && m.key === "status_url"
    )?.value;

    if (!statusUrl) {
      return res.status(404).json({ error: "Status URL not found" });
    }

    return res.json({ status_url: statusUrl });
  } catch (error) {
    console.error("Error fetching metafields:", error.response?.status, error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
