import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import slugify from 'slugify';
import { getUploadsDir } from './paths';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const useCloud = Boolean(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET));

let storage: any;

if (useCloud) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const rand = crypto.randomBytes(4).toString('hex');
      const safe = slugify(file.originalname, { lower: true, strict: true });
      const public_id = `${Date.now()}-${rand}-${safe}`;
      return {
        folder: 'inova-crm',
        public_id,
        resource_type: 'auto',
      } as any;
    },
  }) as any;
} else {
  storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = getUploadsDir();
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const rand = crypto.randomBytes(4).toString('hex');
    const safe = slugify(file.originalname, { lower: true, strict: true });
    const name = `${Date.now()}-${rand}-${safe}`;
    cb(null, name);
  },
  });
}

const allowed = new Set(['image/png','image/jpg','image/jpeg','image/webp','application/pdf','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (allowed.has(file.mimetype)) return cb(null, true);
  cb(new Error('Unsupported file type'));
}

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter,
});


