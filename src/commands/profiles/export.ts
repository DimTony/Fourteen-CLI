import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import { exportProfiles } from "../../services/profile.service.js";

export function registerProfileExportCommand(program: Command) {
  program
    .command("export")
    .description("Export profiles to a file")
    .requiredOption("--format <format>", "Export format: csv or json")
    .option("--gender <gender>", "Filter by gender (male or female)")
    .option("--country <country>", "Filter by country code (e.g. NG)")
    .option("--age-group <ageGroup>", "Filter by age group")
    .option("--min-age <minAge>", "Minimum age")
    .option("--max-age <maxAge>", "Maximum age")
    .option("--min-gender-probability <minGenderProbability>")
    .option("--max-gender-probability <maxGenderProbability>")
    .option("--min-country-probability <minCountryProbability>")
    .option("--sort-by <sortBy>")
    .option("--order <order>")
    .option("--page <page>")
    .option("--limit <limit>")
    .option(
      "--output <output>",
      "Output file path (defaults to profiles.<format>)",
    )
    .action(async (opts) => {
      const format = opts.format.toLowerCase();

      if (!["csv", "json"].includes(format)) {
        console.error(
          chalk.red(`Unsupported format: "${format}". Use csv or json.`),
        );
        process.exit(1);
      }

      const spinner = ora(
        `Exporting profiles as ${format.toUpperCase()}...`,
      ).start();

      try {
        const rawContent = await exportProfiles(opts);
        spinner.stop();

        if (!rawContent?.trim()) {
          console.log(chalk.yellow("No profiles to export."));
          return;
        }

        const outputPath = opts.output ?? `profiles.${format}`;
        const absolutePath = path.resolve(outputPath);

        fs.writeFileSync(absolutePath, rawContent, "utf-8");

        const rowCount = rawContent.trim().split("\n").length - 1;
        console.log(
          chalk.green(
            `Exported ${rowCount} profile${rowCount !== 1 ? "s" : ""} to ${absolutePath}`,
          ),
        );
      } catch (err: any) {
        spinner.fail(err.message);
        process.exit(1);
      }
    });
}
