import { SignJWT, importPKCS8, jwtVerify, importSPKI } from "jose";

export async function generateCardToken(payload: {
  memberId: string;
  planId: string;
  tier: string;
  validUntil: string; // ISO date
  status: "ACTIVE";
}): Promise<string> {
  const privateKey = await importPKCS8(process.env.QR_PRIVATE_KEY!, "ES256");
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "ES256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(new Date(payload.validUntil).getTime() / 1000))
    .sign(privateKey);
}

export async function verifyCardToken(token: string) {
  const publicKey = await importSPKI(process.env.QR_PUBLIC_KEY!, "ES256");
  return jwtVerify(token, publicKey);
}
