const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getDB, saveDB, generateLicenseKey } = require("./_db");
const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.redirect("/pro");

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["subscription", "customer"],
    });

    const email = session.customer_details?.email || session.customer?.email || "";
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

    const db = getDB();
    const existing = Object.values(db).find((r) => r.customerId === customerId);
    let licenseKey = existing ? existing.key : generateLicenseKey();

    if (!existing) {
      db[licenseKey] = { key: licenseKey, email, customerId, subscriptionId, status: "active", createdAt: new Date().toISOString() };
      saveDB(db);
    }

    const html = fs
      .readFileSync(path.join(__dirname, "../public/success.html"), "utf8")
      .replace("{{LICENSE_KEY}}", licenseKey)
      .replace("{{EMAIL}}", email);

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    console.error(err);
    res.redirect("/pro?error=true");
  }
};
