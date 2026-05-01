import http from "http";
import ora from "ora";
import fetch from "node-fetch";
import open from "open";
import { saveCredentials } from "../../utils/credentials.js";
import { generatePkce } from "../../utils/pkce.js";
const BASE_URL = process.env.INSIGHTA_API_URL ?? "";
const PORT = 3000;
export function registerLogin(program) {
    program.command("login").action(async () => {
        const spinner = ora("Logging in...").start();
        try {
            const state = crypto.randomUUID();
            const { verifier, challenge } = generatePkce();
            const authUrl = `${BASE_URL}/auth/github?code_challenge=${challenge}&state=${state}&cli_callback=http://localhost:${PORT}/callback`;
            await open(authUrl);
            const server = http.createServer(async (req, res) => {
                function finish(message, success = true) {
                    if (success)
                        spinner.succeed(message);
                    else
                        spinner.fail(message);
                    res.setHeader("Connection", "close");
                    res.end(message);
                    server.closeAllConnections();
                    server.close(() => process.exit(success ? 0 : 1));
                }
                if (req.url.startsWith("/callback")) {
                    const url = new URL(req.url, `http://localhost:${PORT}`);
                    const code = url.searchParams.get("code");
                    const returnedState = url.searchParams.get("state");
                    if (state !== returnedState) {
                        finish("State mismatch. Authentication failed.", false);
                        return;
                    }
                    try {
                        if (!code) {
                            finish("Missing authorization code.", false);
                            return;
                        }
                        const params = new URLSearchParams({
                            code,
                            code_verifier: verifier,
                            state: returnedState,
                        });
                        const fetchUrl = `${BASE_URL}/auth/github/callback?${params.toString()}`;
                        const tokenResponse = await fetch(fetchUrl, {
                            method: "GET",
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                            },
                        });
                        const tokenData = await tokenResponse.text();
                        // console.log("Tokennn", tokenData)
                        let data;
                        try {
                            data = JSON.parse(tokenData);
                        }
                        catch (parseErr) {
                            console.error(`[ERROR] Failed to parse response as JSON:`, parseErr);
                            throw new Error(`Invalid JSON response: ${tokenData}`);
                        }
                        const accessToken = data.access_token;
                        const refreshToken = data.refresh_token;
                        const username = data.username;
                        if (accessToken && refreshToken && username) {
                            await saveCredentials({
                                accessToken: accessToken,
                                refreshToken: refreshToken,
                                username: username,
                            });
                            finish(`Logged in as @${username}`);
                        }
                        else {
                            finish("Authentication failed.", false);
                        }
                    }
                    catch (error) {
                        finish(`Token exchange failed: ${error.message}`, false);
                    }
                    server.close();
                }
            });
            server.listen(PORT, () => {
                console.log(`Opening browser for GitHub authentication...`);
            });
        }
        catch (err) {
            spinner.fail(err.message);
        }
    });
}
