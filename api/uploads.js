// api/uploads.js
import formidable from "formidable";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const config = {
  api: {
    bodyParser: false, // important: let formidable handle parsing
  },
};

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Optional: admin check middleware
function adminCheck(req) {
  // e.g., check req.headers.cookie or a token
  const loggedIn = req.cookies?.loggedIn;
  return loggedIn === "true";
}

export default async function handler(req, res) {
  // CORS
  const allowedOrigin =
    process.env.NODE_ENV === "production"
      ? "https://brokken-front-yt8g.vercel.app"
      : "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

 {/**
   if (req.method === "POST") {
    if (!adminCheck(req)) {
      return res.status(403).json({ error: "Unauthorized" });
    } */}

    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: err.message });

      const file = files.file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const fileStream = fs.createReadStream(file.filepath);
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
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
