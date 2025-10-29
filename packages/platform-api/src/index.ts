import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";

import { npiRouter } from "./routes/npi";
import { claimRouter } from "./routes/claim";
import { issuerRouter } from "./routes/issuer";
import { didRouter } from "./routes/did";

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

const upload = multer({ dest: "/tmp" });

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "platform-api" }));
app.use("/api/npi", npiRouter);
app.use("/api/claim", upload.none(), claimRouter(upload));
app.use("/api/issuer", issuerRouter);
app.use("/api/did", didRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`platform-api listening on :${PORT}`);
});
