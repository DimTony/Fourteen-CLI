import { Command } from "commander";
import ora from "ora";
import { searchProfiles } from "../../services/profile.service.js";
import { renderProfilesTable } from "../../utils/table.js";

export function registerProfileSearchCommand(program: Command) {
  program
    .command("search <query>")
    .description('Search profiles using a natural language query (e.g. "young males from nigeria")')
    .option("--page <page>", "Page number", "1")
    .option("--limit <limit>", "Results per page", "20")
    .action(async (query: string, opts) => {
      const spinner = ora(`Searching for "${query}"...`).start();

      try {
        const data: any = await searchProfiles(query, opts);
        spinner.stop();

        if (!data?.data?.length) {
          console.log(`\nNo profiles found for: "${query}"\n`);
          return;
        }

        renderProfilesTable(data);
        console.log(
          `Page ${data.page} of ${data.total_pages} (Total: ${data.total})`,
        );
      } catch (err: any) {
        spinner.fail(err.message);
        process.exit(1);
      }
    });
}