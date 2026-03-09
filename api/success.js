const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function generateKey() {
  const r = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `TBLK-${r()}-${r()}-${r()}`;
}

module.exports = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.redirect("/pro");
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const email = session.customer_details?.email || "";
    const key = generateKey();
    const html = fs.readFileSync(path.join(process.cwd(), "public", "success.html"), "utf8")
      .replace("{{LICENSE_KEY}}", key)
      .replace("{{EMAIL}}", email);
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  } catch (err) {
    console.error(err.message);
    return res.redirect("/pro");
  }
};
