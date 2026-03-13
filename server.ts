import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import admin from "firebase-admin";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  admin.initializeApp({
    projectId: config.projectId,
  });
}

const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json());

  // Paystack Webhook
  app.post("/api/paystack/webhook", async (req, res) => {
    const event = req.body;
    // In a real app, verify signature: const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    // if (hash !== req.headers['x-paystack-signature']) return res.sendStatus(400);

    console.log("Paystack Webhook received:", event);

    if (event.event === "charge.success") {
      const { reference, metadata, amount } = event.data;
      const schoolId = metadata?.schoolId;

      if (schoolId) {
        try {
          const schoolRef = db.collection("schools").doc(schoolId);
          await schoolRef.update({
            subscriptionStatus: "Active",
            lastPaymentDate: new Date().toISOString(),
            subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days for a term
          });

          // Log subscription
          await db.collection("subscriptions").add({
            schoolId,
            amount: amount / 100, // Paystack amount is in kobo
            reference,
            status: "success",
            createdAt: new Date().toISOString(),
          });

          console.log(`Subscription updated for school ${schoolId}`);
        } catch (err) {
          console.error("Error updating subscription:", err);
        }
      }
    }

    res.sendStatus(200);
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
