const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');
const path = require('path');

exports.captureSnapshot = (rtsp, res) => {
  try {
    const stream = new PassThrough();
    res.type('image/jpeg');

    ffmpeg(rtsp)
      .inputOptions('-rtsp_transport tcp')
      .outputOptions([
        // Improve image quality with filters
        '-vf fps=1,eq=contrast=1.2:brightness=0.05:saturation=1.3',
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
        
        // Enhanced error message parsing
        if (err.message.includes("401 Unauthorized") || 
            err.message.includes("authorization failed")) {  // Add this condition
          statusCode = 401;
          errorMessage = "Authentication failed: Invalid camera credentials";
          errorCode = "AUTH_ERROR";
        }
        // ... other error conditions ...

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
    // ... existing error handling ...
  }
};

///////==========TEST==============
//video



// exports.captureSnapshot = (videoPath, res) => {
//   try {
//     const stream = new PassThrough();
//     res.type('image/jpeg');

//     ffmpeg(videoPath)  // สามารถใช้ path แทน RTSP ได้เลย
//       .outputOptions(['-vf fps=1', '-t 1', '-ss 00:00:01'])
//       .frames(1)
//       .format('image2')
//       .outputOptions('-q:v 2')
//       .on('error', err => {
//         console.error("FFmpeg error:", err);
//         if (!res.headersSent) res.status(500).send("Snapshot failed");
//       })
//       .pipe(stream);

//     stream.pipe(res);
//   } catch (err) {
//     if (!res.headersSent) res.status(500).send("Internal server error");
//     throw err;
//   }
// };
