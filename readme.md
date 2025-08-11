<div align="center">
  <img src="assets/spotenv.png" alt="spotenv" width="200" height="200">
</div>

# spotenv

> **spotenv** — scan a JavaScript/TypeScript codebase for environment variable usage and generate a **safe** `.env.example` file.

Spotenv is a small, practical CLI tool that scans your project source code (JS/TS/JSX/TSX) to find environment variable usages like `process.env.FOO`, `process.env['FOO']`, destructured patterns (`const { FOO } = process.env`) and `import.meta.env.FOO` (Vite). It produces a `.env.example` file containing the discovered keys, helpful comments about where they are used and whether a default was detected — **without** writing any secret or literal values from source.

---

## Why use spotenv

* Automatically discover the environment variables your code expects — great for onboarding, PRs, CI checks and documentation.
* Avoids manual errors: keeps `.env.example` in sync with code.
* Safer than naive tools: it uses AST-based extraction (Babel) for accurate detection rather than brittle regex-only scanning.
* Works with both JavaScript and TypeScript projects (parses TypeScript syntax via `@babel/parser` plugin).

---

## Key features

* Scans source files (`.js`, `.ts`, `.jsx`, `.tsx`, `.mjs`, `.cjs`).
* Two-pass strategy: fast text heuristics to find candidate files, then AST extraction for precision.
* Detects:

  * `process.env.FOO`
  * `process.env['FOO']` / `process.env["FOO"]`
  * `const { FOO } = process.env` (with optional default values)
  * `import.meta.env.FOO` (Vite)
* Flags dynamic usages (`process.env[someVar]`) for manual review.
* Avoids writing secrets or sensitive defaults to `.env.example` (heuristic: keys containing `SECRET`, `TOKEN`, `KEY`, `PWD`, `PASSWORD`, `PRIVATE` are treated as sensitive).
* Watch mode — auto-regenerate `.env.example` on file changes.
* Merge mode — preserve keys in an existing `.env.example` while adding newly detected keys.

---

## When spotenv is useful (scenarios)

* New developer onboarding — provide a reliable `.env.example` for a repo.
* Open-source projects — maintainers can guarantee contributors see required env keys without exposing secrets.
* CI validation — check that required env keys are documented before deploying or running builds.
* Refactor time — ensure renamed/removed env keys are reflected in the example file.

---

## Installation

Install globally so the dotx command is available system-wide:

```bash
npm install -g spotenv
# or
yarn global add spotenv
```

> Or install as a project dependency and use with npx:

```bash
npm install --save-dev spotenv
# run
npx spotenv
```

> After installing globally, users can simply run `spotenv`.
---

## Usage

```bash
# run on current directory and write .env.example
spotenv -d . -o .env.example

# scan a specific project directory
spotenv -d /path/to/project

# watch and auto-regenerate (COMMING SOON !)
spotenv -w

```

### CLI options

* `-d, --dir <dir>` — project directory to scan (default: `.`)
* `-o, --out <file>` — output file path (default: `.env.example`)
* `-w, --watch` — watch source files and auto-regenerate on change (COMMING SOON!)
* `-m, --merge` — merge results with an existing `.env.example` (keep existing keys)
* `--ignore <patterns...>` — additional glob ignore patterns

Examples:

```bash
# scan 'my-app' and write examples in repo root
spotenv -d ./my-app -o ./my-app/.env.example

# watch updates into existing example (COMMING SOON!)
spotenv -w
```

---

## Output format

Generated `.env.example` looks like this (example):

```text
# .env.example (generated)
# Add real values to .env — do NOT commit secrets to source control.

# used in: src/server.ts, src/config.ts
# default: 3000
PORT=

# used in: src/db.ts
DB_HOST=

# NOTE: dynamic keys detected (e.g. process.env[someVar]).
# Please review code and add any dynamic env keys manually.
```

Notes:

* Sensitive keys are shown but their defaults are omitted or redacted.
* If a key is detected multiple times, the file includes up to a few example source file locations.

---

## Security & Best Practices

* **Never** commit real secrets into source control. `.env.example` is meant to document keys, not store values.
* Spotenv will **not** write literal string defaults into the example if the key looks sensitive (heuristic by name). However, you should manually review keys flagged sensitive.
* The tool scans only source files; it **does not** inspect runtime environment or loaded `.env` files, so you won't accidentally reveal live secrets.
* Use `.env` (listed in `.gitignore`) for real values and keep it out of version control.

---

## Troubleshooting

###



### Dynamic keys

If the tool reports dynamic keys (`process.env[someVar]`) it cannot statically resolve them — inspect those files manually and add keys to `.env.example` where appropriate.

---

## Implementation notes

* The tool uses a **two-pass** approach: a lightweight text-based filter to find candidate files followed by AST parsing via `@babel/parser` and AST traversal (`@babel/traverse`) for accurate extraction.
* Supported AST patterns include `MemberExpression` checks for `process.env`, `VariableDeclarator` for destructured env imports, and `MetaProperty` handling for `import.meta.env`.
* The generator intentionally avoids writing secret values and uses heuristics to decide which detected defaults are safe to show in the example.

---

## Extensibility & config

Ideas you can add later:

* Support framework-specific conventions: `NEXT_PUBLIC_*` (Next.js), `VITE_` prefixes, dotenv-safe validation, etc.
* Add a JSON/Markdown report mode (`--format json|md`) for programmatic consumption.

---

## Contributing

Contributions welcome! Please open issues for feature requests or bugs.

---

## License

MIT — see `LICENSE` for details.
