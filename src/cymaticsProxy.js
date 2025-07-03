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

  try {
    const response = await axios.get(
      `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/${process.env.API_VERSION}/orders/${orderId}/metafields.json`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const metafields = response.data.metafields;
    const statusUrl = metafields.find(
      (m) => m.namespace === "custom" && m.key === "status_url"
    )?.value;

    if (!statusUrl) {
      return res.status(404).json({ error: "Status URL not found" });
    }

    return res.json({ status_url: statusUrl });
  } catch (error) {
    console.error("Error fetching metafields:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
