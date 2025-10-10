import formidable from "formidable";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const config = { api: { bodyParser: false } };

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper to parse multipart/form-data using formidable
const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });

export default async function handler(req, res) {
  // Handle CORS
  const allowedOrigin =
    process.env.NODE_ENV === "production"
      ? "https://brokken-front-yt8g.vercel.app"
      : "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileStream = fs.createReadStream(file.filepath);
    const prefix = process.env.NODE_ENV === "development" ? "dev/" : "";
    const key = `${prefix}uploads/${Date.now()}-${file.originalFilename}`;

    // Upload file to S3 with public-read ACL
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: file.mimetype,
 
      })
    );

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log("Uploaded file URL:", url);

    return res.status(200).json({ url, key });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
}
