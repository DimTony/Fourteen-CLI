# Fourteen-CLI

# insighta CLI

A command-line interface for the Insighta platform — manage, search, and export demographic profiles directly from your terminal.

---

## Requirements

- **Node.js** v20 or higher
- **npm** v7 or higher
- An active Insighta account (GitHub login)

---

## Installation

### From npm (recommended)

```bash
npm install -g insighta-cli
```

### From source

```bash
git clone https://github.com/your-org/insighta-cli.git
cd insighta-cli
npm install
npm run build
npm link
```

After linking, the `insighta` command will be available globally on your machine.

---

## Configuration

By default, the CLI points to the Insighta production API. If you need to override this (e.g. for a self-hosted instance or local development), create a `.env` file in your working directory:

```env
INSIGHTA_API_URL=https://your-backend.com
INSIGHTA_API_VERSION=1
```

You can also set these as shell environment variables:

```bash
export INSIGHTA_API_URL=https://your-backend.com
```

---

## Authentication

### Login

Authenticate via GitHub OAuth. This opens your browser and completes the flow automatically.

```bash
insighta login
```

On success, credentials are saved to `~/.insighta/credentials.json` (readable only by your user account).

### Check current user

```bash
insighta whoami
```

Displays your user ID, username, email, role, and avatar URL.

### Logout

```bash
insighta logout
```

Revokes your session and clears locally stored credentials.

---

## Profiles

All profile commands live under the `profiles` subcommand.

### List profiles

```bash
insighta profiles list [options]
```

**Options:**

| Flag | Description |
|------|-------------|
| `--gender <gender>` | Filter by `male` or `female` |
| `--country <code>` | Filter by country code (e.g. `NG`, `US`) |
| `--age-group <group>` | Filter by age group |
| `--min-age <n>` | Minimum age |
| `--max-age <n>` | Maximum age |
| `--min-gender-probability <n>` | Minimum gender confidence score |
| `--max-gender-probability <n>` | Maximum gender confidence score |
| `--min-country-probability <n>` | Minimum country confidence score |
| `--sort-by <field>` | Field to sort by |
| `--order <asc\|desc>` | Sort order |
| `--page <n>` | Page number (default: 1) |
| `--limit <n>` | Results per page (default: 20) |

**Examples:**

```bash
# List all profiles
insighta profiles list

# List male profiles from Nigeria
insighta profiles list --gender male --country NG

# List profiles sorted by age, descending
insighta profiles list --sort-by age --order desc --limit 50
```

---

### Get a profile

```bash
insighta profiles get <id>
```

Fetches and displays full details for a single profile by its UUID.

```bash
insighta profiles get 550e8400-e29b-41d4-a716-446655440000
```

---

### Search profiles

Search using a natural language query.

```bash
insighta profiles search "<query>" [options]
```

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `--page <n>` | Page number | `1` |
| `--limit <n>` | Results per page | `20` |

**Examples:**

```bash
insighta profiles search "young males from nigeria"
insighta profiles search "senior women in the US" --limit 10
insighta profiles search "middle-aged professionals" --page 2
```

---

### Create a profile

```bash
insighta profiles create --name "<full name>" [options]
```

**Options:**

| Flag | Description |
|------|-------------|
| `--name <name>` | *(Required)* Full name for the profile |
| `--gender <gender>` | Override inferred gender (`male` or `female`) |
| `--country <code>` | Override inferred country code (e.g. `NG`, `US`) |

**Examples:**

```bash
# Create with name only (gender and country inferred)
insighta profiles create --name "Amina Bello"

# Create with explicit overrides
insighta profiles create --name "John Smith" --gender male --country US
```

---

### Export profiles

Export profiles to a CSV or JSON file on disk.

```bash
insighta profiles export --format <csv|json> [options]
```

**Options:**

| Flag | Description |
|------|-------------|
| `--format <format>` | *(Required)* `csv` or `json` |
| `--output <path>` | Output file path (default: `profiles.csv` or `profiles.json`) |
| `--gender <gender>` | Filter by gender |
| `--country <code>` | Filter by country code |
| `--age-group <group>` | Filter by age group |
| `--min-age <n>` | Minimum age |
| `--max-age <n>` | Maximum age |
| `--min-gender-probability <n>` | Minimum gender confidence |
| `--max-gender-probability <n>` | Maximum gender confidence |
| `--min-country-probability <n>` | Minimum country confidence |
| `--sort-by <field>` | Sort field |
| `--order <asc\|desc>` | Sort order |
| `--page <n>` | Page number |
| `--limit <n>` | Results per page |

**Examples:**

```bash
# Export all profiles as CSV
insighta profiles export --format csv

# Export filtered profiles to a specific path
insighta profiles export --format json --gender female --country NG --output ./nigerian-women.json

# Export first 100 male profiles sorted by age
insighta profiles export --format csv --gender male --sort-by age --order asc --limit 100 --output males.csv
```

---

## How token refresh works

The CLI handles authentication automatically. When your access token expires, it silently refreshes using the stored refresh token and retries the failed request. You will only be asked to log in again if the refresh token itself has expired.

---

## Credentials storage

Credentials are stored at `~/.insighta/credentials.json` with permissions set to `600` (owner read/write only). To manually clear your session:

```bash
insighta logout
# or manually:
rm ~/.insighta/credentials.json
```

---

## Troubleshooting

**`command not found: insighta`**
Run `npm run build && npm link` from the project root, or ensure your npm global bin directory is on your `PATH`.

```bash
# Check your npm global bin path
npm bin -g
# Add to PATH in your shell profile (.bashrc, .zshrc, etc.)
export PATH="$(npm bin -g):$PATH"
```

**`Session expired. Please run insighta login`**
Your refresh token has expired. Run `insighta login` to re-authenticate.

**`EADDRINUSE` during login**
Port `9876` is in use. Quit any other process using that port and try again.

**API errors / wrong URL**
Verify your `INSIGHTA_API_URL` environment variable is pointing to the correct backend.

---

## Development

```bash
# Install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Link locally for testing
npm link

# Watch mode (if you add ts-node or similar)
npm run dev
```

Source lives in `src/`, compiled output in `dist/`. The `dist/` folder is committed to the repo so end users don't need to compile anything after cloning.

---

## License

MIT