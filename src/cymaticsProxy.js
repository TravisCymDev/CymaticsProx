const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/status-url", async (req, res) => {
  const orderId = req.query.order_id;

  if (!orderId) {
    return res.status(400).json({ error: "Missing order_id parameter" });
  }

  console.log("✅ Received order ID:", orderId);

  const shop = process.env.SHOPIFY_SHOP_DOMAIN;
  const version = process.env.API_VERSION;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shop || !version || !token) {
    console.error("❌ Missing environment variables");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const url = `https://${shop}/admin/api/${version}/orders/${orderId}/metafields.json`;

  try {
    console.log("🔗 Calling Shopify API:", url);
    const response = await axios.get(url, {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
    });

    const metafields = response.data.metafields;
    const statusUrl = metafields.find(
      (m) => m.namespace === "custom" && m.key === "status_url"
    )?.value;

    if (!statusUrl) {
      return res.status(404).json({ error: "Status URL not found in metafields" });
    }

    return res.json({ status_url: statusUrl });
  } catch (error) {
    console.error("❌ Error fetching metafields:", error.response?.data || error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
