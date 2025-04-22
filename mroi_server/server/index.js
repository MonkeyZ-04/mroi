const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const ffmpeg  = require('fluent-ffmpeg');
const {PassThrough} = require('stream');
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// สร้าง PostgreSQL pool connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});


app.get("/api/schemas", async (req, res) => {
    try {
      const result = await pool.query(`SELECT schema_name FROM information_schema.schemata`);
      res.json(result.rows); 
    } catch (err) {
      console.error("Error querying schemas:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

app.get("/api/schemas/:SchemaSite", async (req, res) => {
    const { SchemaSite } = req.params;
    console.log("SchemaSite", SchemaSite);
    try {
        const result = await pool.query(
            `SELECT DISTINCT camera_site FROM ${SchemaSite}.iv_cameras`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});
app.get("/api/get/camera_name", async (req, res) => {
  const { customer,customerSite } = req.query;
  console.log("Schema : ",customer,"customer site",customerSite );
  try {
      const result = await pool.query(
          `SELECT DISTINCT camera_name FROM ${customer}.iv_cameras WHERE camera_site = '${customerSite}'`
      );
      res.json(result.rows);
  } catch (err) {
      console.error("DB Error:", err);
      res.status(500).json({ error: "Something went wrong" });
  }
});

// get region and get rtsp link
app.get("/api/region-config", async (req, res) => {
  var { customer,customerSite, cameraName } = req.query;
  const stream = new PassThrough();
  let rtsp_link = '';
  cameraName = cameraName.toString();
  console.log("customer:", customer,"customerSite : ",customerSite, "cameraName:", cameraName);

  try {
    const result = await pool.query(
      `SELECT metthier_ai_config,rtsp FROM ${customer}.iv_cameras WHERE camera_name = '${cameraName}' AND camera_site = '${customerSite}'`,
    );
    // This url is just an example, this realCode  result.rows[0].rtsp 
    // rtsp://mioc_cms:Mi0C2023Cms@10.54.1.3:554/cam/realmonitor?channel=5&subtype=0
    // result.rows[0].rtsp realCode 
    rtsp_link = 'rtsp://mioc_cms:Mi0C2023Cms@10.54.1.3:554/cam/realmonitor?channel=5&subtype=1';

    res.json({
      config: result.rows[0].metthier_ai_config || null,
      rtsp: rtsp_link
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get('/snapshot', (req, res) => {
  const { rtsp } = req.query;

  if (!rtsp) return res.status(400).send("RTSP URL is required");

  try {
    const stream = new PassThrough();
    res.type('image/jpeg');

    ffmpeg(rtsp)
      .inputOptions('-rtsp_transport tcp')         // ใช้ TCP เพื่อให้การเชื่อมต่อเสถียรขึ้น
      .outputOptions([
        '-vf fps=1',                                // ลด frame rate เพื่อความเร็ว
        '-t 1',                                     // ดึงวิดีโอความยาว 2 วินาที
        '-ss 00:00:01'                              // ข้าม 1 วินาทีแรกก่อนเริ่ม snapshot
      ])
      .frames(1)
      .format('image2')
      .outputOptions('-q:v 2')
      .on('error', err => {
        console.error("FFmpeg error:", err);
        if (!res.headersSent) res.status(500).send("Failed to capture snapshot");
      })
      .pipe(stream);

    stream.pipe(res);
  } catch (err) {
    console.error("Snapshot error:", err);
    if (!res.headersSent) res.status(500).send("Internal server error");
  }
});


app.post("/api/save-region-config", async (req, res) => {
  const { customer, customerSite, cameraName } = req.query;
  const regionAIConfig = req.body;

  if (!customer || !customerSite || !cameraName || !regionAIConfig) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      `UPDATE ${customer}.iv_cameras 
       SET metthier_ai_config = $1 
       WHERE camera_name = $2 AND camera_site = $3`,
      [JSON.stringify(regionAIConfig), cameraName, customerSite]
    );

    res.status(200).json({ message: 'Region AI config saved successfully.' });
  } catch (error) {
    console.error("Error saving region config:", error);
    res.status(500).json({ message: 'Failed to save configuration.' });
  }
});


app.listen(PORT, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
});
