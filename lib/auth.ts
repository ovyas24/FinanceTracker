import { SignJWT, jwtVerify } from 'jose'

const COOKIE = 'auth_token'

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production')
}

export async function createToken(username: string) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

export function validateCredentials(username: string, password: string) {
  return username === (process.env.ADMIN_USERNAME || 'admin') &&
         password === (process.env.ADMIN_PASSWORD || 'admin123')
}
