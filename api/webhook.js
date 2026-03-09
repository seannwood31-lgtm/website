const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getDB, saveDB } = require("./_db");

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = getDB();

  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.paused") {
    const record = Object.values(db).find((r) => r.subscriptionId === event.data.object.id);
    if (record) { record.status = "cancelled"; saveDB(db); }
  }

  if (event.type === "customer.subscription.resumed" || event.type === "invoice.paid") {
    const subId = event.data.object.subscription || event.data.object.id;
    const record = Object.values(db).find((r) => r.subscriptionId === subId);
    if (record) { record.status = "active"; saveDB(db); }
  }

  res.json({ received: true });
};
