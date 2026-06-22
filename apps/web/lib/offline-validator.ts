import { jwtVerify, importSPKI } from "jose";

export async function verifyOfflineToken(token: string) {
  try {
    const rawKey = process.env.NEXT_PUBLIC_QR_PUBLIC_KEY;
    if (!rawKey) {
      throw new Error("Missing NEXT_PUBLIC_QR_PUBLIC_KEY");
    }

    // Handle escaped newlines from .env
    const formattedKey = rawKey.replace(/\\n/g, "\n");
    
    const publicKey = await importSPKI(formattedKey, "ES256");
    const { payload } = await jwtVerify(token, publicKey);
    
    return {
      isValid: true,
      payload,
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: error.code || error.message,
    };
  }
}
