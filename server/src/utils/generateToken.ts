import jwt, { SignOptions } from 'jsonwebtoken';

export function generateToken(payload: object, secret: string, expiresIn: string | number): string {
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload as any, secret, options);
}


