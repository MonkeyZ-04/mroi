import express from "express";

import GeneralRouter from "./general";
// import AlertFeatureRouter from "./alert_feature";
// import TimespaceFeatureRouter from "./timespace_feature";
import StaticFeatureRouter from "./static_feature";
import CameraRouter from "./camera";

const router = express.Router();


router.use("/utcc", GeneralRouter);
// router.use("/utcc/alert-feature", AlertFeatureRouter);
// router.use("/utcc/timespace-feature", TimespaceFeatureRouter);

router.use("/utcc/static-feature", StaticFeatureRouter);
router.use("/utcc/camera", CameraRouter);


export default router;

