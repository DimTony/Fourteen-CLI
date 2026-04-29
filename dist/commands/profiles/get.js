import Table from "cli-table3";
import chalk from "chalk";
import ora from "ora";
import { getProfile } from "../../services/profile.service.js";
export function registerProfileGetCommand(program) {
    program
        .command("get <id>")
        .description("Get a profile by ID")
        .action(async (id) => {
        const spinner = ora("Fetching profile...").start();
        try {
            const data = await getProfile(id);
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
        }
        catch (err) {
            spinner.fail(err.message);
            process.exit(1);
        }
    });
}
