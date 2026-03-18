import busboy from 'busboy';
import sharp from 'sharp';
import { put } from '@vercel/blob';

// Disable Vercel's default body parser so busboy can read the raw file stream
export const config = {
  api: { bodyParser: false, sizeLimit: "10mb" },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });

  // Vercel securely injects this token from your project settings
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'Token missing.' });

  return new Promise((resolve) => {
    const bb = busboy({ headers: req.headers });
    let fileBuffer = null;
    let fileName = 'upload.webp';

    bb.on('file', (name, file, info) => {
      fileName = info.filename;
      const chunks = [];
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });

    bb.on('finish', async () => {
      if (!fileBuffer) {
        res.status(400).json({ error: 'No file found.' });
        return resolve();
      }

      try {
        // Compress and resize the image to a 256x256 WebP
        const processedBuffer = await sharp(fileBuffer)
          .rotate()                        
          .resize(256, 256, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();                     

        const baseName = fileName.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
        const webpFilename = `${baseName}-${Date.now()}.webp`;

        // Upload to Vercel Blob
        const blob = await put(`avatars/${webpFilename}`, processedBuffer, {
          access: 'public',
          token: token
        });

        // Send the new public URL back to the frontend
        res.status(200).json({ url: blob.url });
      } catch (error) {
        res.status(500).json({ error: 'Upload failed: ' + error.message });
      }
      resolve();
    });

    req.pipe(bb);
  });
}