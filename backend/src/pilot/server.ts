import express from "express";
import { pilotRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(pilotRoutes());

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`api listening on :${PORT}`));