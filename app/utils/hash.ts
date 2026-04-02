export async function sha256(message: string) {
  // Encode the string as a Uint8Array
  const msgBuffer = new TextEncoder().encode(message);

  // Hash the message using SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  const buffer = Buffer.from(hashBuffer);

  return buffer.toString("base64");
}
