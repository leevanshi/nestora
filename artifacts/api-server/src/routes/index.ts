import { Router, type IRouter } from "express";
import healthRouter from "./health";
import listingsRouter from "./listings";
import savedListingsRouter from "./saved-listings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(listingsRouter);
router.use(savedListingsRouter);

export default router;
