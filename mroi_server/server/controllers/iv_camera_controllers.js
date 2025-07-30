const cameraRepo = require("../repositories/iv_camera_repositorys");
const ffmpegService = require("../services/ffmpeg_snapshot_service");
const sshService = require("../services/ssh_service");
const mqtt = require('mqtt'); // 1. Import library MQTT ที่เพิ่งติดตั้ง

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


// ======================= BLOCK ที่แก้ไข =======================
exports.update_metthier_ai_config = async (req, res) => {
  const { customer, cameraId } = req.query;
  const receivedConfig = req.body;

  if (!customer || !cameraId || !receivedConfig) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  // แยก docker_info ออกมา
  const dockerCommand = receivedConfig.docker_info;
  const { docker_info, ...configToSave } = receivedConfig;

  try {
    // บันทึก config ลง database (ส่วนนี้จะไม่มี docker_info แล้ว)
    const affectedRows = await cameraRepo.update_metthier_ai_config(customer, cameraId, configToSave);

    if (affectedRows > 0) {
      // 2. ตรวจสอบว่ามี dockerCommand หรือไม่
      if (dockerCommand) {
        // --- ถ้ามี docker_info: ให้รัน SSH ---
        console.log('docker_info found, executing SSH command...');
        try {
          await sshService.executeCommand(dockerCommand);
          res.status(200).json({ message: 'Config saved and restart command sent successfully via SSH.' });
        } catch (sshError) {
          res.status(207).json({ 
            message: 'Config saved, but failed to send restart command via SSH.',
            error: sshError.message 
          });
        }
      } else {
        // --- ถ้าไม่มี docker_info: ให้ส่ง MQTT ---
        console.log('docker_info not found, sending MQTT message...');
        const mqttClient = mqtt.connect('mqtt://mqtt-open.metthier.ai:61883');
        
        mqttClient.on('connect', () => {
          console.log('Connected to MQTT broker.');
          const topic = '/intrusion/motion_out';
          const message = JSON.stringify({ command: "restart" });
          
          mqttClient.publish(topic, message, (err) => {
            if (err) {
              console.error('MQTT publish error:', err);
              if (!res.headersSent) {
                res.status(500).json({ message: 'Config saved, but failed to send restart command via MQTT.' });
              }
            } else {
              console.log(`Message sent to topic: ${topic}`);
              if (!res.headersSent) {
                res.status(200).json({ message: 'Config saved and restart command sent successfully via MQTT.' });
              }
            }
            mqttClient.end(); // ปิดการเชื่อมต่อหลังส่งเสร็จ
          });
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT connection error:', err);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Config saved, but failed to connect to MQTT broker.' });
            }
            mqttClient.end();
        });
      }
    } else {
      res.status(404).json({ message: 'Save failed: No matching camera found to update.' });
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to save configuration.' });
    }
  }
};
// ===================== END BLOCK ที่แก้ไข =====================