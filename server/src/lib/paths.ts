import path from 'path';
import fs from 'fs';

export function getProjectRoot(): string {
  // __dirname is server/dist/lib in production. Go up to project root
  const here = __dirname;
  const root = path.resolve(here, '..', '..');
  return root;
}

export function getUploadsDir(): string {
  const root = getProjectRoot();
  const uploads = path.join(root, 'uploads');
  try {
    if (!fs.existsSync(uploads)) fs.mkdirSync(uploads, { recursive: true });
  } catch {}
  return uploads;
}

export function publicUrlFor(fileName: string): string {
  return `/uploads/${fileName}`;
}


