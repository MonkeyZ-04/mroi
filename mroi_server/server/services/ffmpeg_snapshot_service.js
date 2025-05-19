const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');

exports.captureSnapshot = (rtsp, res) => {
  try {
    const stream = new PassThrough();
    res.type('image/jpeg');

    ffmpeg(rtsp)
      .inputOptions('-rtsp_transport tcp')
      .outputOptions(['-vf fps=1', '-t 1', '-ss 00:00:01'])
      .frames(1)
      .format('image2')
      .outputOptions('-q:v 2')
      .on('error', err => {
        console.error("FFmpeg error:", err);
        if (!res.headersSent) res.status(500).send("Snapshot failed");
      })
      .pipe(stream);

    stream.pipe(res);
  } catch (err) {
    if (!res.headersSent) res.status(500).send("Internal server error");
    throw err;
  }
};
