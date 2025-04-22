import express from "express";

import VerificationMiddleware from "@middlewares/verification";
import IVCameraController from "@controllers/camera/iv_camera";

const router = express.Router();


router.post("/add", 
    VerificationMiddleware.basicVerification, 
    IVCameraController.addCamera
);

router.post("/update", 
    VerificationMiddleware.basicVerification, 
    IVCameraController.updateCamera
);

router.post("/delete", 
    VerificationMiddleware.basicVerification, 
    IVCameraController.deleteCamera
);

router.get("/facelicense", 
    VerificationMiddleware.basicVerification, 
    IVCameraController.getFaceLicense
);
router.post("/status", 
    VerificationMiddleware.basicVerification, 
    IVCameraController.getCameraStatus
);




export default router;
