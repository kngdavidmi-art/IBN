import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import rssRouter from "./rss";
import searchRouter from "./search";
import articlesRouter from "./articles";
import adminRouter from "./admin";
import editorsRouter from "./editors";
import engagementRouter from "./engagement";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(rssRouter);
router.use(searchRouter);
router.use(articlesRouter);
router.use(adminRouter);
router.use(editorsRouter);
router.use(engagementRouter);

export default router;
