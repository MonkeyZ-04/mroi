const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');

// --- VVVV --- ส่วนที่แก้ไข --- VVVV ---
exports.captureSnapshot = (rtsp, res, width, height) => {
  try {
    const stream = new PassThrough();
    res.type('image/jpeg');

    const command = ffmpeg(rtsp)
      .inputOptions('-rtsp_transport tcp');

    // สร้าง list ของ filter ที่จะใช้
    const filters = ['fps=1', 'eq=contrast=1.2:brightness=0.05:saturation=1.3'];

    // ถ้ามี width และ height ส่งมา ให้เพิ่ม scale filter เข้าไป
    if (width && height) {
      filters.push(`scale=${width}:${height}`);
    }

    command
      .outputOptions([
        `-vf ${filters.join(',')}`, // นำ filter ทั้งหมดมาต่อกันด้วย ,
        '-t 1',
        '-ss 00:00:01'
      ])
      .frames(1)
      .format('image2')
      .outputOptions('-q:v 2')
      .on('error', err => {
        console.error("FFmpeg error:", err.message);
        
        let statusCode = 500;
        let errorMessage = "Failed to capture snapshot";
        let errorCode = "UNKNOWN_ERROR";
        
        if (err.message.includes("401 Unauthorized") || 
            err.message.includes("authorization failed")) {
          statusCode = 401;
          errorMessage = "Authentication failed: Invalid camera credentials";
          errorCode = "AUTH_ERROR";
        }

        if (!res.headersSent) {
          res.status(statusCode).json({
            error: true,
            message: errorMessage,
            code: errorCode,
            details: err.message
          });
        }
      })
      .pipe(stream);

    stream.pipe(res);
  } catch (err) {
    console.error("FFmpeg service error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: true, message: "Internal server error in snapshot service." });
    }
  }
};
// --- ^^^^ --- จบส่วนที่แก้ไข --- ^^^^ ---