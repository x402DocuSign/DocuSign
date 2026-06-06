# Workflow Cleanup

Use the package scripts instead of manually deleting files.

## Daily Development

```powershell
pnpm dev:web
pnpm dev:api
```

`pnpm dev:web` uses webpack for local development because Turbopack is currently panicking on this workspace with `Next.js package not found`.

To retry Turbopack after a fresh install:

```powershell
pnpm dev:web:turbo
```

## Cleanup Commands

```powershell
pnpm clean
pnpm clean:logs
pnpm clean:next
pnpm clean:turbo
```

On Windows, you can also run:

```powershell
cleanup.bat
```

Pass a specific cleanup target if you only want one area:

```powershell
cleanup.bat logs
cleanup.bat next
cleanup.bat turbo
```

## Dependency Layout

The repo now uses pnpm's isolated linker in `.npmrc`. After this change, run:

```powershell
pnpm install
```

If PowerShell blocks `pnpm`, use:

```powershell
pnpm.cmd install
```

## Notes

- The cleanup script only removes generated logs and framework caches.
- It does not delete source files, docs, migrations, environment files, uploads, or credentials.
- Local logs and generated caches are ignored by Git.
