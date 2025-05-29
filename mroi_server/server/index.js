const express = require("express");
const cors = require("cors");
require("dotenv").config();

const cameraRoutes = require("./routers/iv_camera_routes");

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/api", cameraRoutes);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
 