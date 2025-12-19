import fs from "fs";
import path from "path";

const site = "https://actualitesportif.com/";
const username = "anis55345";
const appPassword = "vVB1 wL03 oVG5 Pjso wwm0 cEuK";

// Basic Auth
const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");

async function uploadImage(filePath) {
  let buffer;

    // treat as local file path
    if (!fs.existsSync(filePath)) {
      throw new Error(`Local file not found: ${filePath}`);
    }
    try {
      buffer = fs.readFileSync(filePath);
    } catch (readErr) {
      throw new Error(`Failed reading local file ${filePath}: ${readErr.message}`);
    }
  
// Generate unique filename with timestamp and random string
const originalName = path.basename(filePath || "image.png");
const ext = path.extname(originalName);
const timestamp = Date.now();
const randomStr = Math.random().toString(36).substring(2, 8);
const filename = `image_${timestamp}_${randomStr}${ext}`;

  let upload;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout for upload

    upload = await fetch(`${site}/wp-json/wp/v2/media`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type":  "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
      body: buffer,
    });

    clearTimeout(timeout);
  } catch (fetchErr) {
    const cause = fetchErr && fetchErr.cause ? fetchErr.cause : fetchErr;
    if (fetchErr.name === 'AbortError') {
      console.error("⏱️ Image upload timeout: Server took too long to respond");
      return ;
    }
    console.error(`❌ Failed to upload image: ${fetchErr.message}${cause && cause.code ? ` (${cause.code})` : ""}`);
    return ;
  }

  if (!upload.ok) {
    const txt = await upload.text().catch(() => "(no response body)");
    throw new Error(`Upload failed: ${upload.status} ${upload.statusText} - ${txt}`);
  }

  const media = await upload.json();
  return media.source_url;
}


export default uploadImage;