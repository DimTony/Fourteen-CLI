import { Command } from "commander";
import http from "http";
import ora from "ora";
import fetch from "node-fetch";
import open from "open";
import { saveCredentials } from "../../utils/credentials.js";
import { generatePkce } from "../../utils/pkce.js";

const BASE_URL = process.env.INSIGHTA_API_URL ?? "";
const PORT = 3000;

export function registerLogin(program: Command) {
  program.command("login").action(async () => {
    const spinner = ora("Logging in...").start();

    try {
      const authUrl = `${BASE_URL}/auth/github?flow=cli`;

      await open(authUrl);

      const server = http.createServer(async (req, res) => {
        function finish(message: string, success = true) {
          if (success) spinner.succeed(message);
          else spinner.fail(message);

          res.setHeader("Connection", "close");
          res.end(message);

          server.closeAllConnections();
          server.close(() => process.exit(success ? 0 : 1));
        }

        if (req.url!.startsWith("/callback")) {
          const url = new URL(req.url!, `http://localhost:${PORT}`);

          const accessToken = url.searchParams.get("access_token");
          const refreshToken = url.searchParams.get("refresh_token");
          const username = url.searchParams.get("username");
          const avatarUrl = url.searchParams.get("avatar_url");

          try {
            if (!accessToken || !refreshToken || !username) {
              finish("Missing authentication data in callback.", false);
              return;
            }

            await saveCredentials({
              accessToken,
              refreshToken,
              username,
            });

            finish(`Logged in as @${username}`);
          } catch (error) {
            finish(
              `Failed to save credentials: ${(error as Error).message}`,
              false,
            );
          }

          server.close();
        }
      });

      server.listen(PORT, () => {
        console.log(`Opening browser for GitHub authentication...`);
      });
    } catch (err: any) {
      spinner.fail(err.message);
    }
  });
}
