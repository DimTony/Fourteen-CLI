import crypto from "crypto";
export function generatePkce() {
    const verifier = crypto.randomBytes(64).toString("base64url");
    const challenge = crypto
        .createHash("sha256")
        .update(verifier)
        .digest("base64url");
    return { verifier, challenge };
}
export function generateState() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
}
function base64UrlEncode(buffer) {
    return btoa(String.fromCharCode(...buffer))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}
