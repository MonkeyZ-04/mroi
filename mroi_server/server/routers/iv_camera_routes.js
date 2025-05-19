const express = require("express");
const router = express.Router();
const controller = require("../controllers/iv_camera_controllers");

router.get("/schemas", controller.get_schemas_name);
router.get("/schemas/:SchemaSite", controller.get_cameras_data);
router.get("/snapshot", controller.snapshot);
router.post("/save-region-config", controller.update_metthier_ai_config);

module.exports = router;
