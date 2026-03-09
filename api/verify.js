module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({ valid: false, reason: "No license store configured yet" });
};
