import ora from "ora";
import { listProfiles } from "../../services/profile.service.js";
import { renderProfilesTable } from "../../utils/table.js";
export function registerListCommand(program) {
    program
        .command("list")
        .description("List all profiles")
        .option("--gender <gender>", "Filter profiles by gender (male or female)")
        .option("--country <country>")
        .option("--age-group <ageGroup>")
        .option("--min-age <minAge>")
        .option("--max-age <maxAge>")
        .option("--min-gender-probability <minGenderProbability>")
        .option("--max-gender-probability <maxGenderProbability>")
        .option("--min-country-probability <minCountryProbability>")
        .option("--sort-by <sortBy>")
        .option("--order <order>")
        .option("--page <page>")
        .option("--limit <limit>")
        .action(async (opts, command) => {
        const spinner = ora("").start();
        try {
            const data = await listProfiles(command);
            spinner.stop();
            renderProfilesTable(data);
            console.log(`Page ${data.page} of ${data.total_pages} (Total: ${data.total})`);
        }
        catch (err) {
            spinner.fail(err.message);
        }
    });
}
