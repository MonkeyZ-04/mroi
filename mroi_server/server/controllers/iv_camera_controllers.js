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

exports.get_cameras_data = async (req, res) => {
  const { SchemaSite } = req.params;
  try {
    const cameras = await cameraRepo.get_cameras_data(SchemaSite);
    res.json(cameras.map(camera => camera.toJSON()));
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
  const { customer, customerSite, cameraName } = req.query;
  const config = req.body;

  if (!customer || !customerSite || !cameraName || !config) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    await cameraRepo.update_metthier_ai_config(customer, customerSite, cameraName, config);
    res.status(200).json({ message: 'Region AI config saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save configuration.' });
  }
};
