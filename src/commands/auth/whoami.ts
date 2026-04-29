import { Command } from "commander";
import Table from "cli-table3";
import chalk from "chalk";
import { loadCredentials } from "../../utils/credentials.js";
import { whoami } from "../../services/auth.service.js";
import ora from "ora";

export function registerWhoamiCommand(program: Command) {
  program.command("whoami").action(async () => {
    const spinner = ora("").start();
    function finish(message: string, success = true) {
      if (success) spinner.succeed(message);
      else spinner.fail(message);
      process.exit(success ? 0 : 1);
    }

    try {
      const creds = loadCredentials();

      if (!creds) {
        console.error(chalk.red("Not logged in. Run `insighta login` first."));
        process.exit(1);
      }

      const response: any = await whoami();

      const userData = response.data;

      const table = new Table({
        colWidths: [20, 50],
        style: {
          head: [],
          border: ["cyan"],
        },
      });

      table.push(
        [chalk.bold("Field"), chalk.bold("Value")],
        ["ID", userData.id || "—"],
        ["Username", userData.username || "—"],
        ["Email", userData.email || "—"],
        ["Role", userData.role || "—"],
        ["Avatar URL", userData.avatar_url || "—"],
      );

      console.log("\n");
      console.log(table.toString());
      console.log("\n");

      if (response.status === "success") {
        finish(`This is who you are`);
      } else {
        finish("Command failed.", false);
      }
    } catch (error: any) {
      console.error(chalk.red(`✗ ${error.message}`));
      process.exit(1);
    }
  });
}
