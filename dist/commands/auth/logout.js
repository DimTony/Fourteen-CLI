import chalk from "chalk";
import { clearCredentials, loadCredentials } from "../../utils/credentials.js";
import { logout } from "../../services/auth.service.js";
import ora from "ora";
export function registerLogoutCommand(program) {
    program.command("logout").action(async () => {
        const spinner = ora("Logging out...").start();
        function finish(message, success = true) {
            if (success)
                spinner.succeed(message);
            else
                spinner.fail(message);
            process.exit(success ? 0 : 1);
        }
        try {
            const creds = loadCredentials();
            if (!creds) {
                console.error(chalk.red("Not logged in. Run `insighta login` first."));
                process.exit(1);
            }
            const response = await logout(creds.refreshToken);
            clearCredentials();
            if (response.status === "success") {
                finish(`Successfully logged out.`);
            }
            else {
                finish("Command failed.", false);
            }
        }
        catch (error) {
            console.error(chalk.red(`✗ ${error.message}`));
            process.exit(1);
        }
    });
}
