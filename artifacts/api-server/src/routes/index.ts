import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import rssRouter from "./rss";
import searchRouter from "./search";
import articlesRouter from "./articles";
import adminRouter from "./admin";
import editorsRouter from "./editors";
import engagementRouter from "./engagement";
import storageRouter from "./storage";
import newsletterRouter from "./newsletter";
import commentsRouter from "./comments";
import sitemapRouter from "./sitemap";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(rssRouter);
router.use(searchRouter);
router.use(articlesRouter);
router.use(adminRouter);
router.use(editorsRouter);
router.use(engagementRouter);
router.use(storageRouter);
router.use(newsletterRouter);
router.use(commentsRouter);
router.use(sitemapRouter);

export default router;
