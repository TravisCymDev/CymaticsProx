app.get("/status-url", async (req, res) => {
  const orderId = req.query.order_id;
  console.log("Received order ID:", orderId);

  if (!orderId) {
    return res.status(400).json({ error: "Missing order_id parameter" });
  }

  const apiUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.API_VERSION}/orders/${orderId}/metafields.json`;

  try {
    console.log("Calling Shopify API:", apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const metafields = response.data.metafields;
    console.log("All metafields returned:", JSON.stringify(metafields, null, 2));

    const statusUrl = metafields.find(
      (m) => m.namespace === "custom" && m.key === "status_url"
    )?.value;

    if (!statusUrl) {
      console.log("Metafield 'custom.status_url' not found.");
      return res.status(404).json({ error: "Status URL not found" });
    }

    return res.json({ status_url: statusUrl });
  } catch (error) {
    console.error("Error fetching metafields:", error.response?.status, error.response?.data || error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});
