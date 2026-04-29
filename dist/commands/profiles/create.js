import Table from "cli-table3";
import chalk from "chalk";
import ora from "ora";
import { createProfile } from "../../services/profile.service.js";
export function registerProfileCreateCommand(program) {
    program
        .command("create")
        .description("Create a new profile")
        .requiredOption("--name <name>", "Full name for the profile")
        .option("--gender <gender>", "Gender override (male or female)")
        .option("--country <country>", "Country code override (e.g. NG, US)")
        .action(async (opts) => {
        const spinner = ora(`Creating profile for "${opts.name}"...`).start();
        try {
            const data = await createProfile(opts);
            spinner.stop();
            const profile = data.data ?? data;
            const table = new Table({
                colWidths: [25, 50],
                style: {
                    head: [],
                    border: ["cyan"],
                },
            });
            table.push([chalk.bold("Field"), chalk.bold("Value")], ["ID", profile.id ?? "—"], ["Name", profile.name ?? "—"], ["Gender", profile.gender ?? "—"], ["Gender Probability", profile.gender_probability ?? "—"], ["Age", profile.age ?? "—"], ["Age Group", profile.age_group ?? "—"], ["Country", profile.country_name ?? "—"], ["Country Probability", profile.country_probability ?? "—"], ["Country ID", profile.country_id ?? "—"], ["Created At", profile.created_at ?? "—"]);
            console.log("\n");
            console.log(table.toString());
            console.log("\n");
            console.log(chalk.green(`Profile created with ID: ${profile.id}`));
        }
        catch (err) {
            spinner.fail(err.message);
            process.exit(1);
        }
    });
}
