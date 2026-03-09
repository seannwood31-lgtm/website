const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function generateLicenseKey() {
  const rand = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `TBLK-${rand()}-${rand()}-${rand()}`;
}

module.exports = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.redirect("/pro");

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const email = session.customer_details?.email || "";
    const licenseKey = generateLicenseKey();

    const htmlPath = path.join(process.cwd(), "public", "success.html");
    const html = fs.readFileSync(htmlPath, "utf8")
      .replace("{{LICENSE_KEY}}", licenseKey)
      .replace("{{EMAIL}}", email);

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  } catch (err) {
    console.error(err);
    return res.redirect("/pro");
  }
};
