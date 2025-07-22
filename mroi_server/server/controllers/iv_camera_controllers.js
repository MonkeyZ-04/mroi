const cameraRepo = require("../repositories/iv_camera_repositorys");
const ffmpegService = require("../services/ffmpeg_snapshot_service");

exports.get_schemas_name = async (req, res) => {
  try {
    const result = await cameraRepo.get_schemas_name();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.get_all_cameras = async (req, res) => {
  try {
    const cameras = await cameraRepo.get_all_cameras_from_all_schemas();
    res.json(cameras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query error for all cameras" });
  }
};

exports.get_roi_data = async (req, res) => {
  const {schema,key} = req.query;
  try {
    const result = await cameraRepo.get_roi_data(schema, key);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.get_cameras_data = async (req, res) => {
  const { SchemaSite } = req.params;
  try {
    const cameras = await cameraRepo.get_cameras_data(SchemaSite);
    res.json(cameras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query error" });
  }
};

exports.snapshot = (req, res) => {
  const { rtsp } = req.query;
  
  if (!rtsp) return res.status(400).send("RTSP URL is required");
  ffmpegService.captureSnapshot(rtsp, res);
};

exports.update_metthier_ai_config = async (req, res) => {
  const { customer, cameraId } = req.query;
  const config = req.body;

  if (!customer || !cameraId || !config) {
    return res.status(400).json({ message: 'Missing required fields: customer, cameraId, or config.' });
  }

  try {
    const affectedRows = await cameraRepo.update_metthier_ai_config(customer, cameraId, config);

    if (affectedRows > 0) {
      res.status(200).json({ message: 'Region AI config saved successfully.' });
    } else {
      res.status(404).json({ message: 'Save failed: No matching camera found with the provided ID.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save configuration.' });
  }
};