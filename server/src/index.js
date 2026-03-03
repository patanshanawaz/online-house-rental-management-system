import "dotenv/config";
import express from "express";
import cors from "cors";
import { CAMPUS } from "./config/serviceArea.js";
import { filterListings, getServiceArea } from "./services/listingService.js";
import { pingDatabase } from "./config/database.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    const db = await pingDatabase();
    res.json({ status: "ok", service: "accommodation-api", database: db });
  } catch {
    res.status(500).json({
      status: "error",
      service: "accommodation-api",
      database: { mode: "mysql", connected: false }
    });
  }
});

app.get("/api/meta", (_req, res) => {
  res.json({
    university: CAMPUS,
    serviceArea: getServiceArea(),
    supportedAudience: ["Students", "University Staff", "Families"]
  });
});

app.get("/api/listings", async (req, res) => {
  try {
    const filtered = await filterListings({
      q: req.query.q,
      area: req.query.area,
      maxRent: req.query.maxRent,
      audience: req.query.audience,
      maxDistanceKm: req.query.maxDistanceKm
    });

    res.json({
      count: filtered.length,
      listings: filtered
    });
  } catch {
    res.status(500).json({
      message: "Unable to fetch listings. Check MySQL configuration."
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
