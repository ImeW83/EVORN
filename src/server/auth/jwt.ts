import { jwtVerify, SignJWT } from "jose";

export type Role = "admin" | "customer";

const ISSUER = "evorn";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value) return new TextEncoder().encode(value);
  // A guessable key would let anyone forge a login, so only allow the fallback while developing.
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is not set.");
  return new TextEncoder().encode("dev-only-secret-change-me");
}

// HS256-signed JWT. The audience is the role, so a customer token can never be accepted as an admin token.
export function signToken(role: Role, subject: string, ttlSeconds: number) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(role)
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret());
}

// Returns the subject when the token is genuine, unexpired and issued for this role; otherwise null.
export async function verifyToken(token: string | undefined, role: Role) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: ISSUER, audience: role, algorithms: ["HS256"] });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
