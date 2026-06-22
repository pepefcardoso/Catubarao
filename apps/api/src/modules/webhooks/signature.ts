import crypto from "crypto";
import { env } from "../../lib/env";

export function verifyMercadoPagoSignature(
  rawBody: Buffer | string,
  signatureHeader: string | string[] | undefined,
  requestIdHeader: string | string[] | undefined
): boolean {
  if (!signatureHeader || !requestIdHeader) return false;

  const signatureStr = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  const requestIdStr = Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader;

  // signature format: ts=168...,v1=6a7...
  const parts = signatureStr.split(",");
  let ts = "";
  let v1 = "";
  
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "ts") ts = value;
    if (key === "v1") v1 = value;
  }

  if (!ts || !v1) return false;

  let dataId: string;
  try {
    const parsed = JSON.parse(rawBody.toString());
    dataId = parsed.data?.id;
  } catch (err) {
    return false;
  }

  if (!dataId) return false;

  const manifest = `id:${dataId};request-id:${requestIdStr};ts:${ts};`;
  const secret = env.MP_WEBHOOK_SECRET;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(manifest);
  const hash = hmac.digest("hex");

  return hash === v1;
}
