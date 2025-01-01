import { Router } from "express";
import { activeStatus } from "../controllers/ActiveStatus.js";
const router = Router();

router.route("/").get(activeStatus);

export default router;
