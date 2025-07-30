const cameraRepo = require("../repositories/iv_camera_repositorys");
const ffmpegService = require("../services/ffmpeg_snapshot_service");
const sshService = require("../services/ssh_service");
const mqtt = require('mqtt');

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


// ======================= BLOCK ที่แก้ไขใหม่ทั้งหมด =======================
exports.update_metthier_ai_config = async (req, res) => {
  const { customer, cameraId } = req.query;
  // รับข้อมูลจาก frontend มา แต่เราจะสนใจแค่ property 'rule' เท่านั้น
  const { rule } = req.body; 

  if (!customer || !cameraId || !rule) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  // สร้าง object ที่จะใช้บันทึกลง database ให้มีแค่ `rule`
  const configToSave = { rule };

  try {
    // 1. บันทึก config ใหม่ (ที่มีแค่ rule) ลง DB 
    //    (ฟังก์ชัน update_metthier_ai_config ใน repository จะทำการ merge กับข้อมูลเดิมให้เอง)
    const affectedRows = await cameraRepo.update_metthier_ai_config(customer, cameraId, configToSave);

    if (affectedRows > 0) {
      // 2. หลังจากบันทึกสำเร็จ, อ่านข้อมูลทั้งหมดของกล้องตัวนั้นจาก DB กลับมาอีกครั้ง
      const fullUpdatedConfig = await cameraRepo.get_roi_data(customer, cameraId);

      // 3. ตรวจสอบ docker_info จากข้อมูลที่เพิ่งอ่านมาจาก DB
      if (fullUpdatedConfig && fullUpdatedConfig.docker_info && typeof fullUpdatedConfig.docker_info === 'object') {
        console.log('docker_info found in database, executing SSH command...');
        
        // สร้าง object สำหรับเชื่อมต่อ SSH จาก docker_info
        const connectionDetails = {
          host: fullUpdatedConfig.docker_info.ip,
          port: fullUpdatedConfig.docker_info.port,
          username: fullUpdatedConfig.docker_info.user,
          password: fullUpdatedConfig.docker_info.pass
        };
        
        // สร้าง command โดยใช้ docker name จาก docker_info
        const command = `docker restart ${fullUpdatedConfig.docker_info['docker name']}`;

        try {
          // ส่งทั้ง connection details และ command ไปยัง service
          await sshService.executeCommand(connectionDetails, command);
          res.status(200).json({ message: 'Config saved and restart command sent successfully via SSH.' });
        } catch (sshError) {
          res.status(207).json({ 
            message: 'Config saved, but failed to send restart command via SSH.',
            error: sshError.message 
          });
        }
      } else {
        // 4. ถ้าไม่เจอ docker_info ใน DB, ให้ส่ง MQTT
        console.log('docker_info not found in database, sending MQTT message...');
        const mqttClient = mqtt.connect('mqtt://mqtt-open.metthier.ai:61883');
        
        mqttClient.on('connect', () => {
          const topic = '/intrusion/motion_out';
          const message = JSON.stringify({ command: "restart" });
          
          mqttClient.publish(topic, message, (err) => {
            if (err) {
              console.error('MQTT publish error:', err);
              if (!res.headersSent) res.status(500).json({ message: 'Config saved, but MQTT publish failed.' });
            } else {
              console.log(`Message sent to topic: ${topic}`);
              if (!res.headersSent) res.status(200).json({ message: 'Config saved and restart command sent successfully via MQTT.' });
            }
            mqttClient.end();
          });
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT connection error:', err);
            if (!res.headersSent) res.status(500).json({ message: 'Config saved, but MQTT connection failed.' });
            mqttClient.end();
        });
      }
    } else {
      res.status(404).json({ message: 'Save failed: No matching camera found to update.' });
    }
  } catch (err) {
    console.error('Error in update_metthier_ai_config:', err);
    if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to save configuration.' });
    }
  }
};
// ===================== END BLOCK ที่แก้ไขใหม่ทั้งหมด =====================