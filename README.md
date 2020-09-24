# Screeps Integration Test

Specialized Screeps Private Server with fine-grained control over server ticks. Suitable for unit/integration testing of user scripts.

## Actions

`yarn build` - Builds the package, emitting .js and .d.ts files\
`yarn lint` - Runs lint over the project source\
`yarn test` - Runs all tests under the src/ directory\
`yarn publish` - Bumps package version and publishes the package to NPM Registry

## Toolchain

Uses [@brisberg/cruft-typescript-pkg](https://github.com/brisberg/cruft-typescript-pkg) as a template for Toolchain configuration.

See that repo for a list of tools, documentation, and upgrade steps.
