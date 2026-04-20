# Publishing

Pre-publish checklist for `remotion-scene-kit`. Run each step in order; do not skip. Nothing is published until the final step, which is gated on explicit user approval.

## Checklist

1. **Bump version** in `package.json` (semver: patch for fixes, minor for additive, major for breaking).
2. **Build**: `npm run build` — regenerates `dist/` via `tsup`.
3. **Test**: `npm run test` — runs Vitest suite once.
4. **Typecheck**: `npm run typecheck` — `tsc --noEmit` against the source.
5. **Pack and inspect**: `npm pack` — produces a tarball. Run `tar -tf remotion-scene-kit-*.tgz` and confirm only these paths appear:
   - `package/dist/...`
   - `package/README.md`
   - `package/LICENSE`
   - `package/package.json`

   No `src/`, `test/`, `example/`, `tsconfig*.json`, `tsup.config.ts`, or `.map` files outside `dist/`. If anything extra slipped in, fix `files` in `package.json` before proceeding.
6. **Dry-run publish**: `npm publish --dry-run` — catches packaging issues (missing fields, auth, registry) without pushing.
7. **Publish (only after user explicitly approves)**: `npm publish --access public`.

## After publishing

- Tag the commit: `git tag v<version> && git push --tags`.
- Verify the package renders correctly on the npm page.
- Test installation in a clean project: `npm install remotion-scene-kit@<version>`.
