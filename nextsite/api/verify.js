module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { key } = req.query;
  if (!key) return res.json({ valid: false, reason: "No key provided" });

  // License store via environment variable (set LICENSES as JSON in Vercel)
  let licenses = {};
  try {
    licenses = JSON.parse(process.env.LICENSES || "{}");
  } catch {
    licenses = {};
  }

  const record = licenses[key.trim().toUpperCase()];
  if (!record) return res.json({ valid: false, reason: "Key not found" });
  if (record.status !== "active") return res.json({ valid: false, reason: "Cancelled" });

  return res.json({ valid: true, email: record.email });
};
