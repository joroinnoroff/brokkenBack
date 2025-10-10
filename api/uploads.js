const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Admin middleware: cookie check
function adminCheck(req, res, next) {
  const loggedIn = req.cookies.loggedIn;
  if (!loggedIn || loggedIn !== "true") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}

router.post("/upload", adminCheck, (req, res) => {
  const form = formidable({ multiples: false });
  
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = files.file;
    const fileStream = fs.createReadStream(file.filepath);

    // Optional: dev folder
    const prefix = process.env.NODE_ENV === "development" ? "dev/" : "";
    const key = `${prefix}uploads/${file.originalFilename}`;

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: fileStream,
          ContentType: file.mimetype,
        })
      );

      const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      res.status(200).json({ url, key });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
});

module.exports = router;
