import fs from "fs";
import os from "os";
import path from "path";

interface Credentials {
  accessToken: string;
  refreshToken: string;
  username?: string;
}

const credDir = path.join(os.homedir(), ".insighta");
const credPath = path.join(credDir, "credentials.json");

export function saveCredentials(creds: Credentials): void {
  fs.mkdirSync(credDir, { recursive: true });
  fs.writeFileSync(credPath, JSON.stringify(creds, null, 2), { mode: 0o600 }); // owner read/write only
}

export function loadCredentials(): Credentials | null {
  if (!fs.existsSync(credPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(credPath, "utf-8"));
  } catch {
    return null;
  }
}

export function clearCredentials(): void {
  if (fs.existsSync(credPath)) fs.unlinkSync(credPath);
}
