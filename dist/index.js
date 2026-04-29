import "dotenv/config";
import { Command } from "commander";
import { registerLogin } from "./commands/auth/login.js";
import { registerWhoamiCommand } from "./commands/auth/whoami.js";
import { registerListCommand } from "./commands/profiles/list.js";
import { registerLogoutCommand } from "./commands/auth/logout.js";
import { registerProfileGetCommand } from "./commands/profiles/get.js";
import { registerProfileSearchCommand } from "./commands/profiles/search.js";
import { registerProfileCreateCommand } from "./commands/profiles/create.js";
import { registerProfileExportCommand } from "./commands/profiles/export.js";
const program = new Command();
program.name("insighta").version("1.0.0");
registerLogin(program);
registerWhoamiCommand(program);
registerLogoutCommand(program);
const profilesCommand = program
    .command("profiles")
    .description("Manage profiles");
registerListCommand(profilesCommand);
registerProfileGetCommand(profilesCommand);
registerProfileSearchCommand(profilesCommand);
registerProfileCreateCommand(profilesCommand);
registerProfileExportCommand(profilesCommand);
program.parse();
