const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
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

  
app.get("/api/pool/rtsp", async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT camera_site FROM metthier.iv_cameras");
    res.json(result.rows);

  } catch (err) {
    console.error("Error querying DB:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/schemas/:camerasSite", async (req, res) => {
    const { camerasSite } = req.params;
    console.log("camerasSite", camerasSite);
    try {
        const result = await pool.query(
            `SELECT DISTINCT camera_site, camera_name FROM ${camerasSite}.iv_cameras`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// get point in rule
app.get("/api/schemas/:camerasSite", async (req, res) => {
    const { camerasSite } = req.params;
    console.log("camerasSite", camerasSite);
    try {
        const result = await pool.query(`SELECT DISTINCT camera_site , camera_name FROM ${camerasSite}.iv_cameras`);
        res.json(result.rows); 
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.get("/api/region-config", async (req, res) => {
  var { customer, cameraName } = req.query;
  cameraName = cameraName.toString();
  console.log("customer:", customer, "cameraName:", cameraName);

  try {
    const result = await pool.query(
      `SELECT metthier_ai_config FROM ${customer}.iv_cameras WHERE camera_name = '${cameraName}'`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});



app.listen(PORT, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
});
