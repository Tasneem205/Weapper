import { Router } from "express";

const router = new Router();

router.get("/{location}", () => {});

router.get("/forecast/{location}", () => {});
router.get("/forecast/daily", () => {});
router.get("/forecast/hourly", () => {});

router.get("/historical/{location}", () => {});

router.get("/alerts/{location}", () => {});

router.get("/locations/{location}/save", () => {});
router.get("/locations/saved", () => {});
router.post("/locations/saved", () => {});

router.get("/settings", () => {});
router.post("/settings", () => {});

router.get("/current}", () => {});

router.get("/cities", () => {});

router.get("/rain-chance", () => {});

router.get("/uv-index", () => {});

export default router;
