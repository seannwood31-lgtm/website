const { getDB } = require("./_db");

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { key } = req.query;
  if (!key) return res.json({ valid: false, reason: "No key provided" });

  const db = getDB();
  const record = db[key.trim().toUpperCase()];

  if (!record) return res.json({ valid: false, reason: "Key not found" });
  if (record.status !== "active") return res.json({ valid: false, reason: "Subscription cancelled" });

  res.json({ valid: true, email: record.email });
};
