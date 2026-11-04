# Third-party licences

This file lists the open-source packages the MPowered app depends on, with the licence each one declares. The app's own licence is in [LICENSE](LICENSE).

- **Generated:** 5 November 2026, from `npm ls --omit=dev --all` on the installed packages (Windows). It covers every package that npm treats as a production dependency, including their dependencies.
- **Packages:** 738 (name and version are unique rows).
- **Over-inclusive on purpose.** Some entries are build or test tools that reach the list through `expo` or `expo-router` and are not shipped inside the app.
- **Platform-specific packages** (for example native binaries) differ by operating system, so a Mac or Linux install lists different binaries.
- **Declared licences, not legal advice.** The licence comes from each package's `package.json`. Anyone relying on this for a legal purpose should check the packages themselves.
- **To refresh** after dependencies change, run a licence checker over production dependencies, for example `npx license-checker --production --summary`, and update this file.

## Summary by licence

| Licence | Packages |
| ------- | -------- |
| MIT | 647 |
| ISC | 34 |
| BSD-3-Clause | 16 |
| BSD-2-Clause | 11 |
| BlueOak-1.0.0 | 9 |
| Apache-2.0 | 7 |
| Unlicense | 2 |
| 0BSD | 2 |
| MPL-2.0 | 2 |
| (MIT OR CC0-1.0) | 2 |
| MIT AND Apache-2.0 | 1 |
| Python-2.0 | 1 |
| CC-BY-4.0 | 1 |
| (MIT OR Apache-2.0) | 1 |
| CC0-1.0 | 1 |
| (BSD-3-Clause OR GPL-2.0) | 1 |

## Licences that need a note

Almost everything is permissive (MIT, ISC, BSD, Apache-2.0, and similar). These are the exceptions.

| Package | Licence | Note |
| ------- | ------- | ---- |
| lightningcss, lightningcss-win32-x64-msvc | MPL-2.0 | A build tool pulled in by `expo` (through `@expo/metro-config`). MPL-2.0 is a file-level copyleft licence. It only applies to changes made to those files, and we use the packages unmodified, so it puts no obligation on the app's own source. |
| node-forge | (BSD-3-Clause OR GPL-2.0) | Dual-licensed. We rely on the BSD-3-Clause option. |
| caniuse-lite | CC-BY-4.0 | Browser data used by build tooling. Requires attribution, which this file provides. |
| argparse | Python-2.0 | A permissive licence, used by tooling. |

No package in the list declares GPL, AGPL or LGPL as its only licence.

## Full list

| Package | Version | Licence | Copyright line from the licence file | Source |
| ------- | ------- | ------- | ------------------------------------ | ------ |
| @babel/code-frame | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/compat-data | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/core | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/generator | 7.29.8 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-annotate-as-pure | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-compilation-targets | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-create-class-features-plugin | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-create-regexp-features-plugin | 7.29.10 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-define-polyfill-provider | 0.6.8 | MIT | Copyright (c) 2014-present Nicolò Ribaudo and other contributors | https://github.com/babel/babel-polyfills |
| @babel/helper-globals | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-member-expression-to-functions | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-module-imports | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-module-transforms | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-optimise-call-expression | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-plugin-utils | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-remap-async-to-generator | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-replace-supers | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-skip-transparent-expression-wrappers | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-string-parser | 7.29.11 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-validator-identifier | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-validator-option | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helper-wrap-function | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/helpers | 7.29.10 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/parser | 7.29.11 | MIT | Copyright (C) 2012-2014 by various contributors (see AUTHORS) | https://github.com/babel/babel |
| @babel/plugin-proposal-decorators | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-proposal-export-default-from | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-async-generators | 7.8.4 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-async-generators |
| @babel/plugin-syntax-bigint | 7.8.3 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-bigint |
| @babel/plugin-syntax-class-properties | 7.12.13 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-class-static-block | 7.14.5 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-decorators | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-dynamic-import | 7.8.3 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-dynamic-import |
| @babel/plugin-syntax-export-default-from | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-flow | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-import-attributes | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-import-meta | 7.10.4 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-json-strings | 7.8.3 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-json-strings |
| @babel/plugin-syntax-jsx | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-logical-assignment-operators | 7.10.4 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-nullish-coalescing-operator | 7.8.3 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-nullish-coalescing-operator |
| @babel/plugin-syntax-numeric-separator | 7.10.4 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-object-rest-spread | 7.8.3 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-object-rest-spread |
| @babel/plugin-syntax-optional-catch-binding | 7.8.3 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-optional-catch-binding |
| @babel/plugin-syntax-optional-chaining | 7.8.3 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel/tree/master/packages/babel-plugin-syntax-optional-chaining |
| @babel/plugin-syntax-private-property-in-object | 7.14.5 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-top-level-await | 7.14.5 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-syntax-typescript | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-arrow-functions | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-async-generator-functions | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-async-to-generator | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-block-scoping | 7.29.11 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-class-properties | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-class-static-block | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-classes | 7.29.11 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-destructuring | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-export-namespace-from | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-flow-strip-types | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-for-of | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-logical-assignment-operators | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-modules-commonjs | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-named-capturing-groups-regex | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-nullish-coalescing-operator | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-object-rest-spread | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-optional-catch-binding | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-optional-chaining | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-parameters | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-private-methods | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-private-property-in-object | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-react-display-name | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-react-jsx | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-react-jsx-development | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-react-jsx-self | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-react-jsx-source | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-react-pure-annotations | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-regenerator | 7.29.8 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-runtime | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-shorthand-properties | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-template-literals | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-typescript | 7.29.9 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/plugin-transform-unicode-regex | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/preset-typescript | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/runtime | 7.29.10 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/template | 7.29.7 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/traverse | 7.29.10 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @babel/types | 7.29.11 | MIT | Copyright (c) 2014-present Sebastian McKenzie and other contributors | https://github.com/babel/babel |
| @bcoe/v8-coverage | 0.2.3 | MIT | Copyright © 2015-2017 Charles Samborski | git://github.com/demurgos/v8-coverage |
| @expo-google-fonts/material-symbols | 0.4.51 | MIT AND Apache-2.0 | Copyright (c) 2020 Expo | https://github.com/expo/google-fonts |
| @expo/cli | 58.1.18 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/code-signing-certificates | 0.0.7 | MIT | Copyright (c) 2020-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/code-signing-certificates |
| @expo/config | 58.0.10 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/config-plugins | 58.0.11 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/config-types | 58.0.3 | MIT | Copyright (c) 2020-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/devcert | 1.2.2 | MIT | Copyright (c) 2017 Dave Wasmer | https://github.com/expo/devcert |
| @expo/devtools | 58.0.2 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/dom-webview | 58.0.2 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/env | 2.5.3 | MIT | Copyright (c) 2023-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/fingerprint | 0.21.8 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/image-utils | 0.12.6 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/inline-modules | 0.2.8 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/json-file | 11.2.1 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/local-build-cache-provider | 58.0.10 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/log-box | 58.0.14 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/log-box-utils | 58.0.2 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/metro | 58.0.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/expo/expo-metro |
| @expo/metro-config | 58.0.20 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/metro-file-map | 58.0.5 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/metro-runtime | 58.0.16 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/modules-macros-win32-x64 | 0.27.1 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo-modules-macros |
| @expo/osascript | 2.8.1 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/package-manager | 1.14.2 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/platforms | 58.0.1 | MIT | Copyright (c) 2023-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/plist | 0.10.1 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/prebuild-config | 58.0.18 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/require-utils | 58.0.5 | MIT | Copyright (c) 2025-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/router-server | 58.0.20 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/schema-utils | 58.0.3 | MIT | Copyright (c) 2025-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| @expo/sdk-runtime-versions | 1.0.1 | MIT | Copyright (c) 2025-present 650 Industries, Inc. (aka Expo) |  |
| @expo/spawn-async | 1.8.0 | MIT | Copyright (c) 2015 650 Industries | https://github.com/expo/spawn-async |
| @expo/sudo-prompt | 9.3.2 | MIT | Copyright (c) 2015 Joran Dirk Greef | https://github.com/expo/sudo-prompt |
| @expo/ui | 58.0.26 | MIT |  | https://github.com/expo/expo |
| @expo/ws-tunnel | 2.0.1 | MIT | Copyright (c) 2025-present 650 Industries, Inc. (aka Expo) |  |
| @expo/xcpretty | 4.4.7 | MIT | Copyright (c) 2013-2016 Marin Usalj | https://github.com/expo/expo |
| @isaacs/cliui | 8.0.2 | ISC | Copyright (c) 2015, Contributors | yargs/cliui |
| @isaacs/ttlcache | 1.4.1 | ISC | Copyright (c) 2022-2023 - Isaac Z. Schlueter and Contributors | https://github.com/isaacs/ttlcache |
| @istanbuljs/load-nyc-config | 1.1.0 | ISC | Copyright (c) 2019, Contributors | https://github.com/istanbuljs/load-nyc-config |
| @istanbuljs/schema | 0.1.6 | MIT | Copyright (c) 2019 CFWare, LLC | https://github.com/istanbuljs/schema |
| @jest/console | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/core | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/diff-sequences | 30.5.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/environment | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/expect | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/expect-utils | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/fake-timers | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/get-type | 30.5.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/globals | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/pattern | 30.5.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/reporters | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/schemas | 29.6.3 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/schemas | 30.5.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/snapshot-utils | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/source-map | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/test-result | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/test-sequencer | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/transform | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/types | 29.6.3 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jest/types | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| @jridgewell/gen-mapping | 0.3.13 | MIT | Copyright 2024 Justin Ridgewell <justin@ridgewell.name> | https://github.com/jridgewell/sourcemaps |
| @jridgewell/remapping | 2.3.5 | MIT | Copyright 2024 Justin Ridgewell <justin@ridgewell.name> | https://github.com/jridgewell/sourcemaps |
| @jridgewell/resolve-uri | 3.1.2 | MIT | Copyright 2019 Justin Ridgewell <jridgewell@google.com> | https://github.com/jridgewell/resolve-uri |
| @jridgewell/source-map | 0.3.11 | MIT | Copyright 2024 Justin Ridgewell <justin@ridgewell.name> | https://github.com/jridgewell/sourcemaps |
| @jridgewell/sourcemap-codec | 1.6.0 | MIT | Copyright 2024 Justin Ridgewell <justin@ridgewell.name> | https://github.com/jridgewell/sourcemaps |
| @jridgewell/trace-mapping | 0.3.31 | MIT | Copyright 2024 Justin Ridgewell <justin@ridgewell.name> | https://github.com/jridgewell/sourcemaps |
| @noxcturnal/noxcturnal-win32-x64-msvc | 0.1.11 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/expo/noxcturnal |
| @oxc-project/types | 0.154.0 | MIT | Copyright (c) 2024-present VoidZero Inc. & Contributors | https://github.com/oxc-project/oxc |
| @parcel/watcher | 2.6.0 | MIT | Copyright (c) 2017-present Devon Govett | https://github.com/parcel-bundler/watcher |
| @parcel/watcher-win32-x64 | 2.6.0 | MIT | Copyright (c) 2017-present Devon Govett | https://github.com/parcel-bundler/watcher |
| @pkgjs/parseargs | 0.11.0 | MIT | "Licensor" shall mean the copyright owner or entity authorized by | git@github.com:pkgjs/parseargs |
| @pkgr/core | 0.3.6 | MIT |  | https://github.com/un-ts/pkgr |
| @radix-ui/primitive | 1.2.0 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-collection | 1.2.0 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-compose-refs | 1.1.5 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-context | 1.3.0 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-direction | 1.2.0 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-id | 1.1.4 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-presence | 1.1.11 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-primitive | 2.2.0 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-roving-focus | 1.2.1 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-slot | 1.5.0 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-tabs | 1.2.1 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-use-callback-ref | 1.1.5 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-use-controllable-state | 1.3.0 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-use-effect-event | 0.0.5 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-use-is-hydrated | 0.1.3 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @radix-ui/react-use-layout-effect | 1.1.4 | MIT | Copyright (c) 2022 WorkOS | https://github.com/radix-ui/primitives |
| @react-native-async-storage/async-storage | 2.2.0 | MIT | Copyright (c) 2015-present, Facebook, Inc. | https://github.com/react-native-async-storage/async-storage |
| @react-native-community/slider | 5.2.1 | MIT |  | https://github.com/callstack/react-native-slider |
| @react-native-masked-view/masked-view | 0.3.2 | MIT | Copyright (c) 2015-present, Facebook, Inc. | https://github.com/react-native-masked-view/masked-view |
| @react-native/asset-utils | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/babel-plugin-codegen | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/babel-preset | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/codegen | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/community-cli-plugin | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/debugger-frontend | 0.88.1 | BSD-3-Clause |  | https://github.com/react/react-native |
| @react-native/debugger-shell | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/dev-middleware | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/gradle-plugin | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/js-polyfills | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/metro-babel-transformer | 0.88.1 | MIT |  | ssh://git@github.com/react/react-native |
| @react-native/metro-config | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/normalize-colors | 0.74.89 | MIT |  | https://github.com/facebook/react-native |
| @react-native/normalize-colors | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @react-native/virtualized-lists | 0.88.1 | MIT |  | https://github.com/react/react-native |
| @sinclair/typebox | 0.27.12 | MIT | Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com> | https://github.com/sinclairzx81/sinclair-typebox |
| @sinclair/typebox | 0.34.52 | MIT | Copyright (c) 2017-2026 Haydn Paterson | https://github.com/sinclairzx81/sinclair-typebox |
| @sinonjs/commons | 3.0.1 | BSD-3-Clause | Copyright (c) 2018, Sinon.JS | https://github.com/sinonjs/commons |
| @sinonjs/fake-timers | 15.4.0 | BSD-3-Clause | Copyright (c) 2010-2014, Christian Johansen, christian@cjohansen.no. All rights reserved. | https://github.com/sinonjs/fake-timers |
| @supabase/auth-js | 2.118.0 | MIT | Copyright (c) 2020 Supabase | https://github.com/supabase/supabase-js |
| @supabase/functions-js | 2.118.0 | MIT | Copyright (c) 2020 Supabase | https://github.com/supabase/supabase-js |
| @supabase/phoenix | 0.4.5 | MIT | Copyright (c) 2014 Chris McCord | git://github.com/supabase/phoenix |
| @supabase/postgrest-js | 2.118.0 | MIT | Copyright (c) 2020 Supabase | https://github.com/supabase/supabase-js |
| @supabase/realtime-js | 2.118.0 | MIT | Copyright (c) 2020 Supabase | https://github.com/supabase/supabase-js |
| @supabase/storage-js | 2.118.0 | MIT | Copyright (c) 2020 Supabase | https://github.com/supabase/supabase-js |
| @supabase/supabase-js | 2.118.0 | MIT | Copyright (c) 2020 Supabase | https://github.com/supabase/supabase-js |
| @testing-library/react-native | 14.1.0 | MIT | Copyright (c) 2018 Callstack and Rally Health | https://www.github.com/callstack/react-native-testing-library |
| @types/babel__core | 7.20.5 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/babel__generator | 7.27.0 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/babel__template | 7.4.4 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/babel__traverse | 7.28.0 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/istanbul-lib-coverage | 2.0.6 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/istanbul-lib-report | 3.0.3 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/istanbul-reports | 3.0.4 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/node | 26.6.5 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/react | 19.3.0 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/react-reconciler | 0.34.1 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/react-test-renderer | 19.3.0 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/stack-utils | 2.0.3 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/yargs | 17.0.35 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/yargs-parser | 21.0.3 | MIT | Copyright (c) Microsoft Corporation. | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @ungap/structured-clone | 1.4.0 | ISC | Copyright (c) 2021, Andrea Giammarchi, @WebReflection | https://github.com/ungap/structured-clone |
| @unrs/resolver-binding-win32-x64-msvc | 1.12.2 | MIT |  | https://github.com/unrs/unrs-resolver |
| @xmldom/xmldom | 0.8.15 | MIT | Copyright 2019 - present Christopher J. Brody and other contributors, as listed in: https://github.com/xmldom/xmldom/graphs/contributors | git://github.com/xmldom/xmldom |
| @xmldom/xmldom | 0.9.12 | MIT | Copyright 2019 - present Christopher J. Brody and other contributors, as listed in: https://github.com/xmldom/xmldom/graphs/contributors | git://github.com/xmldom/xmldom |
| 2g | 1.0.1 | MIT | Copyright (c) Phil Pluckthun, | https://github.com/kitten/2g |
| abort-controller | 3.0.0 | MIT | Copyright (c) 2017 Toru Nagashima | https://github.com/mysticatea/abort-controller |
| accepts | 1.3.8 | MIT | Copyright (c) 2014 Jonathan Ong <me@jongleberry.com> | jshttp/accepts |
| accepts | 2.0.0 | MIT | Copyright (c) 2014 Jonathan Ong <me@jongleberry.com> | jshttp/accepts |
| acorn | 8.19.0 | MIT | Copyright (C) 2012-2022 by various contributors (see AUTHORS) | https://github.com/acornjs/acorn |
| agent-base | 7.1.4 | MIT | Copyright (c) 2013 Nathan Rajlich <nathan@tootallnate.net> | https://github.com/TooTallNate/proxy-agents |
| agent-cli-detector | 0.1.7 | MIT | Copyright (c) 2026 David Mokos | https://github.com/expo/agent-cli-detector |
| anser | 1.4.10 | MIT | Copyright (c) 2012-20 Ionică Bizău <bizauionica@gmail.com> (https://ionicabizau.net) | git://github.com/IonicaBizau/anser |
| ansi-escapes | 4.3.2 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/ansi-escapes |
| ansi-regex | 4.1.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/ansi-regex |
| ansi-regex | 5.0.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/ansi-regex |
| ansi-regex | 6.4.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | chalk/ansi-regex |
| ansi-styles | 3.2.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/ansi-styles |
| ansi-styles | 4.3.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/ansi-styles |
| ansi-styles | 5.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/ansi-styles |
| ansi-styles | 6.2.3 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | chalk/ansi-styles |
| anymatch | 3.1.3 | ISC | Copyright (c) 2019 Elan Shanker, Paul Miller (https://paulmillr.com) | https://github.com/micromatch/anymatch |
| arg | 4.1.3 | MIT | Copyright (c) 2017-2019 Zeit, Inc. | zeit/arg |
| arg | 5.0.2 | MIT | Copyright (c) 2021 Vercel, Inc. | vercel/arg |
| argparse | 1.0.10 | MIT | Copyright (C) 2012 by Vitaly Puzrin | nodeca/argparse |
| argparse | 2.0.1 | Python-2.0 | provided, however, that PSF's License Agreement and PSF's notice of copyright, | nodeca/argparse |
| asap | 2.0.6 | MIT | Copyright 2009–2014 Contributors. All rights reserved. | https://github.com/kriskowal/asap |
| await-lock | 2.2.2 | MIT | Copyright (c) 2015-present James Ide | https://github.com/ide/await-lock |
| babel-jest | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| babel-plugin-istanbul | 8.0.0 | BSD-3-Clause | Copyright (c) 2016, Istanbul Code Coverage | https://github.com/istanbuljs/babel-plugin-istanbul |
| babel-plugin-jest-hoist | 30.5.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| babel-plugin-polyfill-corejs2 | 0.4.17 | MIT | Copyright (c) 2014-present Nicolò Ribaudo and other contributors | https://github.com/babel/babel-polyfills |
| babel-plugin-polyfill-corejs3 | 0.13.0 | MIT | Copyright (c) 2014-present Nicolò Ribaudo and other contributors | https://github.com/babel/babel-polyfills |
| babel-plugin-polyfill-regenerator | 0.6.8 | MIT | Copyright (c) 2014-present Nicolò Ribaudo and other contributors | https://github.com/babel/babel-polyfills |
| babel-plugin-react-compiler | 1.0.0 | MIT |  | https://github.com/facebook/react |
| babel-plugin-react-native-web | 0.21.4 | MIT | Copyright (c) Nicolas Gallagher. | https://github.com/necolas/react-native-web |
| babel-plugin-syntax-hermes-parser | 0.36.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | git@github.com:facebook/hermes |
| babel-plugin-transform-flow-enums | 0.0.2 | MIT | Copyright (c) Facebook, Inc. and its affiliates. | https://github.com/facebook/flow |
| babel-preset-current-node-syntax | 1.2.0 | MIT | Copyright (c) 2020 Nicolò Ribaudo and other contributors | https://github.com/nicolo-ribaudo/babel-preset-current-node-syntax |
| babel-preset-expo | 58.0.23 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| babel-preset-jest | 30.5.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| badgin | 1.2.3 | MIT |  | https://github.com/jaulz/badgin |
| balanced-match | 1.0.2 | MIT | Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt; | git://github.com/juliangruber/balanced-match |
| balanced-match | 4.0.4 | MIT | Original code Copyright Julian Gruber <julian@juliangruber.com> | git://github.com/juliangruber/balanced-match |
| base64-js | 1.5.1 | MIT | Copyright (c) 2014 Jameson Little | git://github.com/beatgammit/base64-js |
| baseline-browser-mapping | 2.11.32 | Apache-2.0 | "Licensor" shall mean the copyright owner or entity authorized by | https://github.com/web-platform-dx/baseline-browser-mapping |
| big-integer | 1.6.52 | Unlicense | In jurisdictions that recognize copyright laws, the author or authors | git@github.com:peterolson/BigInteger.js |
| boolbase | 1.0.0 | ISC |  | https://github.com/fb55/boolbase |
| bplist-creator | 0.1.0 | MIT | Copyright (c) 2012 Near Infinity Corporation | https://github.com/nearinfinity/node-bplist-creator |
| bplist-parser | 0.3.1 | MIT |  | https://github.com/nearinfinity/node-bplist-parser |
| brace-expansion | 2.1.7 | MIT | Copyright (c) 2013 Julian Gruber <julian@juliangruber.com> | git://github.com/juliangruber/brace-expansion |
| brace-expansion | 5.0.12 | MIT | Copyright Julian Gruber <julian@juliangruber.com> | https://github.com/juliangruber/brace-expansion |
| braces | 3.0.3 | MIT | Copyright (c) 2014-present, Jon Schlinkert. | micromatch/braces |
| browserslist | 4.29.4 | MIT | Copyright 2014 Andrey Sitnik <andrey@sitnik.es> and other contributors | browserslist/browserslist |
| bser | 2.1.2 | MIT | Copyright (c) Meta Platforms, Inc. and its affiliates. | https://github.com/facebook/watchman |
| buffer-from | 1.1.2 | MIT | Copyright (c) 2016, 2018 Linus Unnebäck | LinusU/buffer-from |
| bytes | 3.1.2 | MIT | Copyright (c) 2012-2014 TJ Holowaychuk <tj@vision-media.ca> | visionmedia/bytes.js |
| callsites | 3.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/callsites |
| camelcase | 5.3.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/camelcase |
| camelcase | 6.3.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/camelcase |
| caniuse-lite | 1.0.30001819 | CC-BY-4.0 | original works of authorship and other material subject to copyright | browserslist/caniuse-lite |
| chalk | 2.4.2 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/chalk |
| chalk | 4.1.2 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/chalk |
| char-regex | 1.0.2 | MIT | Copyright (c) 2019 Richie Bendall | https://github.com/Richienb/char-regex |
| ci-info | 3.9.0 | MIT | Copyright (c) 2016 Thomas Watson Steen | https://github.com/watson/ci-info |
| ci-info | 4.4.0 | MIT | Copyright (c) 2016 Thomas Watson Steen | https://github.com/watson/ci-info |
| cjs-module-lexer | 2.3.0 | MIT | Copyright (C) 2018-2020 Guy Bedford | https://github.com/nodejs/cjs-module-lexer |
| cli-cursor | 2.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/cli-cursor |
| cli-spinners | 2.9.2 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/cli-spinners |
| client-only | 0.0.1 | MIT |  | https://reactjs.org/ |
| cliui | 8.0.1 | ISC | Copyright (c) 2015, Contributors | yargs/cliui |
| clone | 1.0.4 | MIT | Copyright © 2011-2015 Paul Vorbach <paul@vorba.ch> | git://github.com/pvorb/node-clone |
| co | 4.6.0 | MIT | Copyright (c) 2014 TJ Holowaychuk &lt;tj@vision-media.ca&gt; | tj/co |
| collect-v8-coverage | 1.0.3 | MIT | Copyright (c) 2019 Simen Bekkhus | SimenB/collect-v8-coverage |
| color | 4.2.3 | MIT | Copyright (c) 2012 Heather Arthur | Qix-/color |
| color-convert | 1.9.3 | MIT | Copyright (c) 2011-2016 Heather Arthur <fayearthur@gmail.com> | Qix-/color-convert |
| color-convert | 2.0.1 | MIT | Copyright (c) 2011-2016 Heather Arthur <fayearthur@gmail.com> | Qix-/color-convert |
| color-name | 1.1.3 | MIT | Copyright (c) 2015 Dmitry Ivanov | git@github.com:dfcreative/color-name |
| color-name | 1.1.4 | MIT | Copyright (c) 2015 Dmitry Ivanov | git@github.com:colorjs/color-name |
| color-string | 1.9.1 | MIT | Copyright (c) 2011 Heather Arthur <fayearthur@gmail.com> | Qix-/color-string |
| commander | 12.1.0 | MIT | Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca> | https://github.com/tj/commander.js |
| commander | 2.20.3 | MIT | Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca> | https://github.com/tj/commander.js |
| commander | 7.2.0 | MIT | Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca> | https://github.com/tj/commander.js |
| compressible | 2.0.18 | MIT | Copyright (c) 2013 Jonathan Ong <me@jongleberry.com> | jshttp/compressible |
| compression | 1.8.2 | MIT | Copyright (c) 2014 Jonathan Ong <me@jongleberry.com> | expressjs/compression |
| connect | 3.7.0 | MIT | Copyright (c) 2010 Sencha Inc. | senchalabs/connect |
| content-type | 2.1.0 | MIT | Copyright (c) 2015 Douglas Christopher Wilson | jshttp/content-type |
| convert-source-map | 2.0.0 | MIT | Copyright 2013 Thorsten Lorenz. | git://github.com/thlorenz/convert-source-map |
| core-js-compat | 3.51.0 | MIT | Copyright (c) 2013–2025 Denis Pushkarev (zloirock.ru) | https://github.com/zloirock/core-js |
| cross-fetch | 3.2.0 | MIT | Copyright (c) 2017 Leonardo Quixadá | https://github.com/lquixada/cross-fetch |
| cross-spawn | 7.0.6 | MIT | Copyright (c) 2018 Made With MOXY Lda <hello@moxy.studio> | git@github.com:moxystudio/node-cross-spawn |
| css-in-js-utils | 3.1.0 | MIT | Copyright (c) 2017 Robin Frischmann | https://github.com/robinweser/css-in-js-utils |
| css-select | 5.2.2 | BSD-2-Clause | Copyright (c) Felix Böhm | git://github.com/fb55/css-select |
| css-tree | 1.1.3 | MIT | Copyright (C) 2016-2019 by Roman Dvornov | csstree/csstree |
| css-what | 6.2.2 | BSD-2-Clause | Copyright (c) Felix Böhm | https://github.com/fb55/css-what |
| csstype | 3.2.3 | MIT | Copyright (c) 2017-2018 Fredrik Nicol | https://github.com/frenic/csstype |
| debug | 2.6.9 | MIT | Copyright (c) 2014 TJ Holowaychuk <tj@vision-media.ca> | git://github.com/visionmedia/debug |
| debug | 3.2.7 | MIT | Copyright (c) 2014 TJ Holowaychuk <tj@vision-media.ca> | git://github.com/visionmedia/debug |
| debug | 4.4.3 | MIT | Copyright (c) 2014-2017 TJ Holowaychuk <tj@vision-media.ca> | git://github.com/debug-js/debug |
| dedent | 1.7.2 | MIT | The above copyright notice and this permission notice shall be | https://github.com/dmnd/dedent |
| deepmerge | 4.3.1 | MIT | Copyright (c) 2012 James Halliday, Josh Duff, and other contributors | git://github.com/TehShrike/deepmerge |
| defaults | 1.0.4 | MIT | Copyright (c) 2022 Sindre Sorhus | git://github.com/sindresorhus/node-defaults |
| define-lazy-prop | 2.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/define-lazy-prop |
| depd | 2.0.0 | MIT | Copyright (c) 2014-2018 Douglas Christopher Wilson | dougwilson/nodejs-depd |
| destroy | 1.2.0 | MIT | Copyright (c) 2014 Jonathan Ong me@jongleberry.com | stream-utils/destroy |
| detect-libc | 2.1.2 | Apache-2.0 | "Licensor" shall mean the copyright owner or entity authorized by | git://github.com/lovell/detect-libc |
| detect-newline | 3.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/detect-newline |
| dnssd-advertise | 1.1.6 | MIT | Copyright (c) Phil Pluckthun, | https://github.com/kitten/dnssd-advertise |
| dom-serializer | 2.0.0 | MIT | Copyright (c) 2014 The cheeriojs contributors | git://github.com/cheeriojs/dom-serializer |
| domelementtype | 2.3.0 | BSD-2-Clause | Copyright (c) Felix Böhm | git://github.com/fb55/domelementtype |
| domhandler | 5.0.3 | BSD-2-Clause | Copyright (c) Felix Böhm | git://github.com/fb55/domhandler |
| domutils | 3.2.2 | BSD-2-Clause | Copyright (c) Felix Böhm | git://github.com/fb55/domutils |
| eastasianwidth | 0.2.0 | MIT |  | git://github.com/komagata/eastasianwidth |
| ee-first | 1.1.1 | MIT | Copyright (c) 2014 Jonathan Ong me@jongleberry.com | jonathanong/ee-first |
| electron-to-chromium | 1.5.464 | ISC | Copyright 2018 Kilian Valkhof | https://github.com/Kilian/electron-to-chromium |
| emittery | 0.13.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/emittery |
| emoji-regex | 8.0.0 | MIT | Copyright Mathias Bynens <https://mathiasbynens.be/> | https://github.com/mathiasbynens/emoji-regex |
| emoji-regex | 9.2.2 | MIT | Copyright Mathias Bynens <https://mathiasbynens.be/> | https://github.com/mathiasbynens/emoji-regex |
| encodeurl | 1.0.2 | MIT | Copyright (c) 2016 Douglas Christopher Wilson | pillarjs/encodeurl |
| encodeurl | 2.0.0 | MIT | Copyright (c) 2016 Douglas Christopher Wilson | pillarjs/encodeurl |
| entities | 4.5.0 | BSD-2-Clause | Copyright (c) Felix Böhm | git://github.com/fb55/entities |
| error-ex | 1.3.4 | MIT | Copyright (c) 2015 JD Ballard | qix-/node-error-ex |
| error-stack-parser | 2.1.4 | MIT | Copyright (c) 2017 Eric Wendelin and other contributors | git://github.com/stacktracejs/error-stack-parser |
| es-errors | 1.3.0 | MIT | Copyright (c) 2024 Jordan Harband | https://github.com/ljharb/es-errors |
| es-module-lexer | 2.3.2 | MIT | Copyright (C) 2018-2022 Guy Bedford | https://github.com/guybedford/es-module-lexer |
| escalade | 3.2.0 | MIT | Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com) | lukeed/escalade |
| escape-html | 1.0.3 | MIT | Copyright (c) 2012-2013 TJ Holowaychuk | component/escape-html |
| escape-string-regexp | 1.0.5 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/escape-string-regexp |
| escape-string-regexp | 2.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/escape-string-regexp |
| escape-string-regexp | 4.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/escape-string-regexp |
| esprima | 4.0.1 | BSD-2-Clause | Copyright JS Foundation and other contributors, https://js.foundation/ | https://github.com/jquery/esprima |
| etag | 1.8.1 | MIT | Copyright (c) 2014-2016 Douglas Christopher Wilson | jshttp/etag |
| event-target-shim | 5.0.1 | MIT | Copyright (c) 2015 Toru Nagashima | https://github.com/mysticatea/event-target-shim |
| execa | 5.1.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/execa |
| exit-x | 0.2.2 | MIT | Copyright (c) 2013 "Cowboy" Ben Alman | git://github.com/gruntjs/node-exit-x |
| expect | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| expo | 58.0.22 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-application | 58.1.2 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-asset | 58.0.19 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-constants | 58.0.14 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-device | 58.0.5 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-eas-client | 58.0.2 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-file-system | 58.0.13 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-font | 58.0.11 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-glass-effect | 58.0.5 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-image | 58.0.18 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-json-utils | 58.0.1 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-keep-awake | 58.0.3 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-linear-gradient | 58.0.3 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-linking | 58.0.15 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-manifests | 58.0.1 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-modules-autolinking | 58.0.16 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-modules-cli | 0.4.0 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-modules-core | 58.0.29 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-modules-jsi | 58.0.21 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-modules-macros | 0.27.1 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo-modules-macros |
| expo-notifications | 58.1.7 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-print | 58.0.8 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-router | 58.0.29 | MIT |  | https://github.com/expo/expo |
| expo-server | 58.0.6 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-sharing | 58.0.21 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-speech-recognition | 58.0.0 | MIT | Copyright (c) 2024 jamsch | https://github.com/jamsch/expo-speech-recognition |
| expo-splash-screen | 58.0.12 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-sqlite | 58.0.15 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-status-bar | 58.0.4 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-structured-headers | 58.0.1 | MIT |  | https://github.com/expo/expo |
| expo-symbols | 58.0.4 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-system-ui | 58.0.7 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-updates | 58.0.20 | MIT |  | https://github.com/expo/expo |
| expo-updates-interface | 58.0.1 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| expo-web-browser | 58.0.7 | MIT | Copyright (c) 2015-present 650 Industries, Inc. (aka Expo) | https://github.com/expo/expo |
| exponential-backoff | 3.1.3 | Apache-2.0 | "Licensor" shall mean the copyright owner or entity authorized by | https://github.com/coveooss/exponential-backoff |
| fast-json-stable-stringify | 2.1.0 | MIT | Copyright (c) 2017 Evgeny Poberezkin | git://github.com/epoberezkin/fast-json-stable-stringify |
| fb-dotslash | 0.5.8 | (MIT OR Apache-2.0) |  | https://github.com/facebook/dotslash |
| fb-watchman | 2.0.4 | MIT | Copyright (c) Meta Platforms, Inc. and its affiliates. | git@github.com:facebook/watchman |
| fbjs | 3.0.5 | MIT | Copyright (c) 2013-present, Facebook, Inc. | facebook/fbjs |
| fbjs-css-vars | 1.0.2 | MIT | Copyright (c) 2013-present, Facebook, Inc. | facebook/fbjs |
| fdir | 6.5.0 | MIT | Copyright 2023 Abdullah Atta | https://github.com/thecodrr/fdir |
| fetch-nodeshim | 0.4.10 | MIT | Copyright (c) Phil Pluckthun, | https://github.com/kitten/fetch-nodeshim |
| fill-range | 7.1.1 | MIT | Copyright (c) 2014-present, Jon Schlinkert. | jonschlinkert/fill-range |
| finalhandler | 1.1.2 | MIT | Copyright (c) 2014-2017 Douglas Christopher Wilson <doug@somethingdoug.com> | pillarjs/finalhandler |
| find-up | 4.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/find-up |
| flow-enums-runtime | 0.0.6 | MIT | Copyright (c) Facebook, Inc. and its affiliates. | https://github.com/facebook/flow |
| flow-estree | 0.327.0 | MIT |  | https://github.com/facebook/flow |
| flow-estree | 0.331.0 | MIT |  | https://github.com/facebook/flow |
| flow-parser | 0.327.0 | MIT |  | https://github.com/facebook/flow |
| flow-parser | 0.331.0 | MIT |  | https://github.com/facebook/flow |
| foreground-child | 3.3.1 | ISC | Copyright (c) 2015-2023 Isaac Z. Schlueter and Contributors | https://github.com/tapjs/foreground-child |
| fresh | 0.5.2 | MIT | Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca> | jshttp/fresh |
| function-bind | 1.1.2 | MIT | Copyright (c) 2013 Raynos. | https://github.com/Raynos/function-bind |
| gensync | 1.0.0-beta.2 | MIT | Copyright 2018 Logan Smyth <loganfsmyth@gmail.com> | https://github.com/loganfsmyth/gensync |
| get-caller-file | 2.0.5 | ISC | Copyright 2018 Stefan Penner | https://github.com/stefanpenner/get-caller-file |
| get-package-type | 0.1.0 | MIT | Copyright (c) 2020 CFWare, LLC | https://github.com/cfware/get-package-type |
| get-stream | 6.0.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/get-stream |
| getenv | 2.0.0 | MIT | Copyright (c) 2012-2019 Christoph Tavan <dev@tavan.de> | git://github.com/ctavan/node-getenv |
| glob | 10.5.0 | ISC | Copyright (c) 2009-2023 Isaac Z. Schlueter and Contributors | git://github.com/isaacs/node-glob |
| glob | 13.0.6 | BlueOak-1.0.0 | ## Copyright | git@github.com:isaacs/node-glob |
| graceful-fs | 4.2.11 | ISC | Copyright (c) 2011-2022 Isaac Z. Schlueter, Ben Noordhuis, and Contributors | https://github.com/isaacs/node-graceful-fs |
| has-flag | 3.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/has-flag |
| has-flag | 4.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/has-flag |
| hasown | 2.0.4 | MIT | Copyright (c) Jordan Harband and contributors | https://github.com/inspect-js/hasOwn |
| hermes-compiler | 260318099.0.5 | MIT |  | ssh://git@github.com/facebook/hermes |
| hermes-estree | 0.36.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | git@github.com:facebook/hermes |
| hermes-parser | 0.36.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | git@github.com:facebook/hermes |
| hosted-git-info | 7.0.2 | ISC | Copyright (c) 2015, Rebecca Turner | https://github.com/npm/hosted-git-info |
| html-escaper | 2.0.2 | MIT | Copyright (C) 2017-present by Andrea Giammarchi - @WebReflection | https://github.com/WebReflection/html-escaper |
| http-errors | 2.0.1 | MIT | Copyright (c) 2014 Jonathan Ong me@jongleberry.com | jshttp/http-errors |
| https-proxy-agent | 7.0.6 | MIT | Copyright (c) 2013 Nathan Rajlich <nathan@tootallnate.net> | https://github.com/TooTallNate/proxy-agents |
| human-signals | 2.1.0 | Apache-2.0 | "Licensor" shall mean the copyright owner or entity authorized by | ehmicky/human-signals |
| hyphenate-style-name | 1.1.0 | BSD-3-Clause | Copyright (c) 2015, Espen Hovlandsdal | ssh://git@github.com/rexxars/hyphenate-style-name |
| iceberg-js | 0.8.1 | MIT | Copyright (c) 2025 Supabase | https://github.com/supabase/iceberg-js |
| ignore | 5.3.2 | MIT | Copyright (c) 2013 Kael Zhang <i@kael.me>, contributors | git@github.com:kaelzhang/node-ignore |
| import-local | 3.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/import-local |
| imurmurhash | 0.1.4 | MIT |  | https://github.com/jensyt/imurmurhash-js |
| indent-string | 4.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/indent-string |
| inherits | 2.0.4 | ISC | Copyright (c) Isaac Z. Schlueter | git://github.com/isaacs/inherits |
| inline-style-prefixer | 7.0.1 | MIT | Copyright (c) 2015 Robin Frischmann | https://github.com/robinweser/inline-style-prefixer |
| invariant | 2.2.4 | MIT | Copyright (c) 2013-present, Facebook, Inc. | https://github.com/zertosh/invariant |
| is-arrayish | 0.2.1 | MIT | Copyright (c) 2015 JD Ballard | https://github.com/qix-/node-is-arrayish |
| is-arrayish | 0.3.4 | MIT | Copyright (c) 2015 JD Ballard | https://github.com/qix-/node-is-arrayish |
| is-core-module | 2.17.0 | MIT | Copyright (c) 2014 Dave Justice | https://github.com/inspect-js/is-core-module |
| is-docker | 2.2.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/is-docker |
| is-extglob | 2.1.1 | MIT | Copyright (c) 2014-2016, Jon Schlinkert | jonschlinkert/is-extglob |
| is-fullwidth-code-point | 3.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/is-fullwidth-code-point |
| is-generator-fn | 2.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/is-generator-fn |
| is-glob | 4.0.3 | MIT | Copyright (c) 2014-2017, Jon Schlinkert. | micromatch/is-glob |
| is-number | 7.0.0 | MIT | Copyright (c) 2014-present, Jon Schlinkert. | jonschlinkert/is-number |
| is-plain-obj | 2.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/is-plain-obj |
| is-stream | 2.0.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/is-stream |
| is-wsl | 2.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/is-wsl |
| isexe | 2.0.0 | ISC | Copyright (c) Isaac Z. Schlueter and Contributors | https://github.com/isaacs/isexe |
| istanbul-lib-coverage | 3.2.2 | BSD-3-Clause | Copyright 2012-2015 Yahoo! Inc. | ssh://git@github.com/istanbuljs/istanbuljs |
| istanbul-lib-instrument | 6.0.3 | BSD-3-Clause | Copyright 2012-2015 Yahoo! Inc. | ssh://git@github.com/istanbuljs/istanbuljs |
| istanbul-lib-report | 3.0.1 | BSD-3-Clause | Copyright 2012-2015 Yahoo! Inc. | ssh://git@github.com/istanbuljs/istanbuljs |
| istanbul-lib-source-maps | 5.0.6 | BSD-3-Clause | Copyright 2015 Yahoo! Inc. | ssh://git@github.com/istanbuljs/istanbuljs |
| istanbul-reports | 3.2.0 | BSD-3-Clause | Copyright 2012-2015 Yahoo! Inc. | ssh://git@github.com/istanbuljs/istanbuljs |
| jackspeak | 3.4.3 | BlueOak-1.0.0 | ## Copyright | https://github.com/isaacs/jackspeak |
| jest | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-changed-files | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-circus | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-cli | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-config | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-diff | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-docblock | 30.5.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-each | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-environment-node | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-get-type | 29.6.3 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-haste-map | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-leak-detector | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-matcher-utils | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-message-util | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-mock | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-regex-util | 30.5.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-resolve | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-resolve-dependencies | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-runner | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-runtime | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-snapshot | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-util | 29.7.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-util | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-validate | 29.7.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-validate | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-watcher | 30.5.2 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-worker | 29.7.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jest-worker | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| jimp-compact | 0.16.1 | MIT |  | nuxt-community/jimp-compact |
| js-tokens | 4.0.0 | MIT | Copyright (c) 2014, 2015, 2016, 2017, 2018 Simon Lydell | lydell/js-tokens |
| js-yaml | 3.15.2 | MIT | Copyright (C) 2011-2015 by Vitaly Puzrin | nodeca/js-yaml |
| js-yaml | 4.3.2 | MIT | Copyright (C) 2011-2015 by Vitaly Puzrin | nodeca/js-yaml |
| jsc-safe-url | 0.2.4 | 0BSD |  | https://github.com/robhogan/jsc-safe-url |
| jsesc | 3.1.0 | MIT | Copyright Mathias Bynens <https://mathiasbynens.be/> | https://github.com/mathiasbynens/jsesc |
| json-parse-even-better-errors | 2.3.1 | MIT | Copyright 2017 Kat Marchán | https://github.com/npm/json-parse-even-better-errors |
| json5 | 2.2.3 | MIT | Copyright (c) 2012-2018 Aseem Kishore, and [others]. | https://github.com/json5/json5 |
| kleur | 3.0.3 | MIT | Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com) | lukeed/kleur |
| lan-network | 0.2.1 | MIT | Copyright (c) Phil Pluckthun, | https://github.com/kitten/lan-network |
| leven | 3.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/leven |
| lightningcss | 1.33.0 | MPL-2.0 | applicable copyright doctrines of fair use, fair dealing, or other | https://github.com/parcel-bundler/lightningcss |
| lightningcss-win32-x64-msvc | 1.33.0 | MPL-2.0 | applicable copyright doctrines of fair use, fair dealing, or other | https://github.com/parcel-bundler/lightningcss |
| lines-and-columns | 1.2.4 | MIT | Copyright (c) 2015 Brian Donovan | https://github.com/eventualbuddha/lines-and-columns |
| locate-path | 5.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/locate-path |
| lodash.debounce | 4.0.8 | MIT | Copyright jQuery Foundation and other contributors <https://jquery.org/> | lodash/lodash |
| lodash.throttle | 4.1.1 | MIT | Copyright jQuery Foundation and other contributors <https://jquery.org/> | lodash/lodash |
| log-symbols | 2.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/log-symbols |
| loose-envify | 1.4.0 | MIT | Copyright (c) 2015 Andres Suarez <zertosh@gmail.com> | git://github.com/zertosh/loose-envify |
| lru-cache | 10.4.3 | ISC | Copyright (c) 2010-2023 Isaac Z. Schlueter and Contributors | git://github.com/isaacs/node-lru-cache |
| lru-cache | 11.5.3 | BlueOak-1.0.0 | ## Copyright | ssh://git@github.com/isaacs/node-lru-cache |
| lru-cache | 5.1.1 | ISC | Copyright (c) Isaac Z. Schlueter and Contributors | git://github.com/isaacs/node-lru-cache |
| make-dir | 4.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/make-dir |
| makeerror | 1.0.12 | BSD-3-Clause | Copyright (c) 2014, Naitik Shah. All rights reserved. | https://github.com/daaku/nodejs-makeerror |
| mdn-data | 2.0.14 | CC0-1.0 | exclusive Copyright and Related Rights (defined below) upon the creator and | https://github.com/mdn/data |
| memoize-one | 5.2.1 | MIT | Copyright (c) 2019 Alexander Reardon | https://github.com/alexreardon/memoize-one |
| memoize-one | 6.0.0 | MIT | Copyright (c) 2019 Alexander Reardon | https://github.com/alexreardon/memoize-one |
| merge-options | 3.0.4 | MIT | Copyright (c) Michael Mayer <michael@schnittstabil.de> | schnittstabil/merge-options |
| merge-stream | 2.0.0 | MIT | Copyright (c) Stephen Sugden <me@stephensugden.com> (stephensugden.com) | grncdr/merge-stream |
| metro | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-babel-transformer | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-cache | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-cache-key | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-config | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-core | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-file-map | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-minify-terser | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-resolver | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-runtime | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-source-map | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-symbolicate | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-transform-plugins | 0.87.1 | MIT |  | https://github.com/react/metro |
| metro-transform-worker | 0.87.1 | MIT |  | https://github.com/react/metro |
| micromatch | 4.0.8 | MIT | Copyright (c) 2014-present, Jon Schlinkert. | micromatch/micromatch |
| mime | 1.6.0 | MIT | Copyright (c) 2010 Benjamin Thomas, Robert Kieffer | https://github.com/broofa/node-mime |
| mime-db | 1.52.0 | MIT | Copyright (c) 2014 Jonathan Ong <me@jongleberry.com> | jshttp/mime-db |
| mime-db | 1.54.0 | MIT | Copyright (c) 2014 Jonathan Ong <me@jongleberry.com> | jshttp/mime-db |
| mime-types | 2.1.35 | MIT | Copyright (c) 2014 Jonathan Ong <me@jongleberry.com> | jshttp/mime-types |
| mime-types | 3.0.2 | MIT | Copyright (c) 2014 Jonathan Ong <me@jongleberry.com> | jshttp/mime-types |
| mimic-fn | 1.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/mimic-fn |
| mimic-fn | 2.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/mimic-fn |
| min-indent | 1.0.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com), James Kyle <me@thejameskyle.com> (thejameskyle.com) | https://github.com/thejameskyle/min-indent |
| minimatch | 10.2.6 | BlueOak-1.0.0 | ## Copyright | git@github.com:isaacs/minimatch |
| minimatch | 9.0.9 | ISC | Copyright (c) 2011-2023 Isaac Z. Schlueter and Contributors | git://github.com/isaacs/minimatch |
| minipass | 7.1.3 | BlueOak-1.0.0 | ## Copyright | https://github.com/isaacs/minipass |
| ms | 2.0.0 | MIT | Copyright (c) 2016 Zeit, Inc. | zeit/ms |
| ms | 2.1.3 | MIT | Copyright (c) 2020 Vercel, Inc. | vercel/ms |
| multitars | 1.0.2 | MIT | Copyright (c) Phil Pluckthun, | https://github.com/expo/multitars |
| nanoid | 3.3.20 | MIT | Copyright 2017 Andrey Sitnik <andrey@sitnik.ru> | ai/nanoid |
| napi-postinstall | 0.3.7 | MIT | Copyright (c) 2021-present UnTS | https://github.com/un-ts/napi-postinstall |
| natural-compare | 1.4.0 | MIT |  | git://github.com/litejs/natural-compare-lite |
| negotiator | 0.6.3 | MIT | Copyright (c) 2012-2014 Federico Romero | jshttp/negotiator |
| negotiator | 0.6.4 | MIT | Copyright (c) 2012-2014 Federico Romero | jshttp/negotiator |
| negotiator | 1.1.0 | MIT | Copyright (c) 2012-2014 Federico Romero | jshttp/negotiator |
| node-addon-api | 7.1.1 | MIT | Copyright (c) 2017 [Node.js API collaborators](https://github.com/nodejs/node-addon-api#collaborators) | git://github.com/nodejs/node-addon-api |
| node-fetch | 2.7.0 | MIT | Copyright (c) 2016 David Frank | https://github.com/bitinn/node-fetch |
| node-forge | 1.4.0 | (BSD-3-Clause OR GPL-2.0) | use this project in commercial projects as long as the copyright header is | https://github.com/digitalbazaar/forge |
| node-int64 | 0.4.0 | MIT | Copyright (c) 2014 Robert Kieffer | https://github.com/broofa/node-int64 |
| node-releases | 2.0.60 | MIT | Copyright (c) 2017 Sergey Rubanov (https://github.com/chicoxyzzy) | https://github.com/chicoxyzzy/node-releases |
| normalize-path | 3.0.0 | MIT | Copyright (c) 2014-2018, Jon Schlinkert. | jonschlinkert/normalize-path |
| noxcturnal | 0.1.11 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/expo/noxcturnal |
| npm-package-arg | 11.0.3 | ISC | Copyright (c) npm, Inc. | https://github.com/npm/npm-package-arg |
| npm-run-path | 4.0.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/npm-run-path |
| nth-check | 2.1.1 | BSD-2-Clause | Copyright (c) Felix Böhm | https://github.com/fb55/nth-check |
| nullthrows | 1.1.1 | MIT | Copyright (c) 2016 Andres Suarez | https://github.com/zertosh/nullthrows |
| ob1 | 0.87.1 | MIT |  | https://github.com/react/metro |
| object-assign | 4.1.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/object-assign |
| on-finished | 2.3.0 | MIT | Copyright (c) 2013 Jonathan Ong <me@jongleberry.com> | jshttp/on-finished |
| on-finished | 2.4.2 | MIT | Copyright (c) 2013 Jonathan Ong <me@jongleberry.com> | jshttp/on-finished |
| on-headers | 1.1.0 | MIT | Copyright (c) 2014 Douglas Christopher Wilson | jshttp/on-headers |
| onetime | 2.0.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/onetime |
| onetime | 5.1.2 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/onetime |
| open | 8.4.2 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/open |
| ora | 3.4.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/ora |
| p-limit | 2.3.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/p-limit |
| p-limit | 3.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/p-limit |
| p-locate | 4.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/p-locate |
| p-try | 2.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/p-try |
| package-json-from-dist | 1.0.1 | BlueOak-1.0.0 | ## Copyright | https://github.com/isaacs/package-json-from-dist |
| parse-json | 5.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/parse-json |
| parse-png | 2.1.0 | MIT | Copyright (c) Kevin Mårtensson <kevinmartensson@gmail.com> (github.com/kevva) | kevva/parse-png |
| parseurl | 1.3.3 | MIT | Copyright (c) 2014 Jonathan Ong <me@jongleberry.com> | pillarjs/parseurl |
| path-exists | 4.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/path-exists |
| path-key | 3.1.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/path-key |
| path-parse | 1.0.7 | MIT | Copyright (c) 2015 Javier Blanco | https://github.com/jbgutierrez/path-parse |
| path-scurry | 1.11.1 | BlueOak-1.0.0 | ## Copyright | https://github.com/isaacs/path-scurry |
| path-scurry | 2.0.2 | BlueOak-1.0.0 | ## Copyright | https://github.com/isaacs/path-scurry |
| picocolors | 1.1.1 | ISC | Copyright (c) 2021-2024 Oleksii Raspopov, Kostiantyn Denysov, Anton Verinov | alexeyraspopov/picocolors |
| picomatch | 2.3.2 | MIT | Copyright (c) 2017-present, Jon Schlinkert. | micromatch/picomatch |
| picomatch | 4.0.7 | MIT | Copyright (c) 2017-present, Jon Schlinkert. | micromatch/picomatch |
| pirates | 4.0.7 | MIT | Copyright (c) 2016-2018 Ari Porad | https://github.com/danez/pirates |
| pkg-dir | 4.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/pkg-dir |
| plist | 3.1.1 | MIT | Copyright (c) 2010-2017 Nathan Rajlich <nathan@tootallnate.net> | git://github.com/TooTallNate/node-plist |
| pngjs | 3.4.0 | MIT | pngjs2 original work Copyright (c) 2015 Luke Page & Original Contributors | git://github.com/lukeapage/pngjs2 |
| postcss | 8.5.32 | MIT | Copyright 2013 Andrey Sitnik <andrey@sitnik.es> | postcss/postcss |
| postcss-value-parser | 4.2.0 | MIT | Copyright (c) Bogdan Chadkin <trysound@yandex.ru> | https://github.com/TrySound/postcss-value-parser |
| pretty-format | 29.7.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| pretty-format | 30.5.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/jestjs/jest |
| proc-log | 4.2.0 | ISC | Copyright (c) GitHub, Inc. | https://github.com/npm/proc-log |
| progress | 2.0.3 | MIT | Copyright (c) 2017 TJ Holowaychuk <tj@vision-media.ca> | git://github.com/visionmedia/node-progress |
| promise | 7.3.1 | MIT | Copyright (c) 2014 Forbes Lindesay | https://github.com/then/promise |
| promise | 8.3.0 | MIT | Copyright (c) 2014 Forbes Lindesay | https://github.com/then/promise |
| prompts | 2.4.2 | MIT | Copyright (c) 2018 Terkel Gjervig Nielsen | terkelg/prompts |
| pure-rand | 7.0.1 | MIT | Copyright (c) 2018 Nicolas DUBIEN | https://github.com/dubzzz/pure-rand |
| range-parser | 1.2.1 | MIT | Copyright (c) 2012-2014 TJ Holowaychuk <tj@vision-media.ca> | jshttp/range-parser |
| react | 19.3.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/react/react |
| react-devtools-core | 6.1.5 | MIT |  | https://github.com/facebook/react |
| react-dom | 19.3.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/react/react |
| react-fast-compare | 3.2.2 | MIT | Copyright (c) 2018 Formidable Labs | https://github.com/FormidableLabs/react-fast-compare |
| react-freeze | 1.0.4 | MIT | Copyright (c) 2021 Software Mansion | software-mansion/react-freeze |
| react-is | 18.3.1 | MIT | Copyright (c) Facebook, Inc. and its affiliates. | https://github.com/facebook/react |
| react-is | 19.3.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/react/react |
| react-native | 0.88.1 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/react/react-native |
| react-native-drawer-layout | 4.2.12 | MIT | Copyright (c) 2017 React Native Community | https://github.com/react-navigation/react-navigation |
| react-native-gesture-handler | 3.3.0 | MIT | Copyright (c) 2016 Software Mansion <swmansion.com> | https://github.com/software-mansion/react-native-gesture-handler |
| react-native-is-edge-to-edge | 1.3.1 | MIT | Copyright (c) 2024 Mathieu Acthernoene | https://github.com/zoontek/react-native-edge-to-edge |
| react-native-reanimated | 4.7.1 | MIT | Copyright (c) 2016 Software Mansion <swmansion.com> | https://github.com/software-mansion/react-native-reanimated |
| react-native-safe-area-context | 5.10.1 | MIT | Copyright (c) 2019 Th3rd Wave | https://github.com/appandflow/react-native-safe-area-context |
| react-native-screens | 4.30.1 | MIT | Copyright (c) 2018 Software Mansion <swmansion.com> | https://github.com/software-mansion/react-native-screens |
| react-native-svg | 15.16.0 | MIT | Copyright (c) [2015-2016] [Horcrux] | https://github.com/software-mansion/react-native-svg |
| react-native-url-polyfill | 4.0.0 | MIT | Copyright (c) 2019 Nicolas Charpentier | https://github.com/charpeni/react-native-url-polyfill |
| react-native-web | 0.21.4 | MIT | Copyright (c) Nicolas Gallagher. | https://github.com/necolas/react-native-web |
| react-native-webview | 14.0.1 | MIT | Copyright (c) 2015-present, Facebook, Inc. | https://github.com/react-native-webview/react-native-webview |
| react-native-worklets | 0.13.0 | MIT | Copyright (c) 2024 nobody | https://github.com/software-mansion/react-native-reanimated |
| react-reconciler | 0.34.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/react/react |
| react-refresh | 0.14.2 | MIT | Copyright (c) Facebook, Inc. and its affiliates. | https://github.com/facebook/react |
| redent | 3.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/redent |
| regenerate | 1.5.0 | MIT | Copyright Mathias Bynens <https://mathiasbynens.be/> | https://github.com/mathiasbynens/regenerate |
| regenerate-unicode-properties | 10.3.0 | MIT | Copyright Mathias Bynens <https://mathiasbynens.be/> | https://github.com/mathiasbynens/regenerate-unicode-properties |
| regenerator-runtime | 0.13.11 | MIT | Copyright (c) 2014-present, Facebook, Inc. | https://github.com/facebook/regenerator/tree/main/packages/runtime |
| regexpu-core | 6.5.3 | MIT | Copyright Mathias Bynens <https://mathiasbynens.be/> | https://github.com/mathiasbynens/regexpu-core |
| regjsgen | 0.8.0 | MIT | Copyright 2014-2020 Benjamin Tan <https://ofcr.se/> | https://github.com/bnjmnt4n/regjsgen |
| regjsparser | 0.13.4 | BSD-2-Clause | Copyright (c) Julian Viereck and Contributors, All Rights Reserved. | ssh://git@github.com/jviereck/regjsparser |
| require-directory | 2.1.1 | MIT | Copyright (c) 2011 Troy Goode <troygoode@gmail.com> | git://github.com/troygoode/node-require-directory |
| resolve | 1.22.13 | MIT | Copyright (c) 2012 James Halliday | ssh://github.com/browserify/resolve |
| resolve-cwd | 3.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/resolve-cwd |
| resolve-from | 5.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/resolve-from |
| resolve-workspace-root | 2.0.1 | MIT | Copyright (c) 2024-present Cedric van Putten <me@cedric.dev> | https://github.com/byCedric/resolve-workspace-root |
| restore-cursor | 2.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/restore-cursor |
| safe-buffer | 5.2.1 | MIT | Copyright (c) Feross Aboukhadijeh | git://github.com/feross/safe-buffer |
| sandbox-cli-detector | 0.2.0 | MIT | Copyright (c) 2026 David Mokos | https://github.com/davidmokos/sandbox-cli-detector |
| sax | 1.6.1 | BlueOak-1.0.0 | ## Copyright | ssh://git@github.com/isaacs/sax-js |
| scheduler | 0.28.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | https://github.com/react/react |
| semver | 6.3.1 | ISC | Copyright (c) Isaac Z. Schlueter and Contributors | https://github.com/npm/node-semver |
| semver | 7.8.5 | ISC | Copyright (c) Isaac Z. Schlueter and Contributors | https://github.com/npm/node-semver |
| send | 0.19.2 | MIT | Copyright (c) 2012 TJ Holowaychuk | pillarjs/send |
| serialize-error | 2.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/serialize-error |
| serve-static | 1.16.3 | MIT | Copyright (c) 2010 Sencha Inc. | expressjs/serve-static |
| server-only | 0.0.1 | MIT |  | https://reactjs.org/ |
| setimmediate | 1.0.5 | MIT | Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola | YuzuJS/setImmediate |
| setprototypeof | 1.2.0 | ISC | Copyright (c) 2015, Wes Todd | https://github.com/wesleytodd/setprototypeof |
| sf-symbols-typescript | 2.2.0 | MIT | Copyright (c) 2023 Fernando Rojo | https://github.com/nandorojo/typescript-sf-symbols |
| shebang-command | 2.0.0 | MIT | Copyright (c) Kevin Mårtensson <kevinmartensson@gmail.com> (github.com/kevva) | kevva/shebang-command |
| shebang-regex | 3.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/shebang-regex |
| shell-quote | 1.12.0 | MIT | Copyright (c) 2013 James Halliday (mail@substack.net) | http://github.com/ljharb/shell-quote |
| signal-exit | 3.0.7 | ISC | Copyright (c) 2015, Contributors | https://github.com/tapjs/signal-exit |
| signal-exit | 4.1.0 | ISC | Copyright (c) 2015-2023 Benjamin Coe, Isaac Z. Schlueter, and Contributors | https://github.com/tapjs/signal-exit |
| simple-plist | 1.3.1 | MIT | Copyright (c) 2013 Joe Wollard | https://github.com/wollardj/simple-plist |
| simple-swizzle | 0.2.4 | MIT | Copyright (c) 2015 Josh Junon | qix-/node-simple-swizzle |
| sisteransi | 1.0.5 | MIT | Copyright (c) 2018 Terkel Gjervig Nielsen | https://github.com/terkelg/sisteransi |
| slash | 3.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/slash |
| slugify | 1.6.9 | MIT | Copyright (c) Simeon Velichkov <simeonvelichkov@gmail.com> | https://github.com/simov/slugify |
| source-map | 0.5.7 | BSD-3-Clause | Copyright (c) 2009-2011, Mozilla Foundation and contributors | http://github.com/mozilla/source-map |
| source-map | 0.6.1 | BSD-3-Clause | Copyright (c) 2009-2011, Mozilla Foundation and contributors | http://github.com/mozilla/source-map |
| source-map-js | 1.2.2 | BSD-3-Clause | Copyright (c) 2009-2011, Mozilla Foundation and contributors | 7rulnik/source-map-js |
| source-map-support | 0.5.21 | MIT | Copyright (c) 2014 Evan Wallace | https://github.com/evanw/node-source-map-support |
| sprintf-js | 1.0.3 | BSD-3-Clause | Copyright (c) 2007-2014, Alexandru Marasteanu <hello [at) alexei (dot] ro> | https://github.com/alexei/sprintf.js |
| stack-utils | 2.0.6 | MIT | Copyright (c) 2016-2022 Isaac Z. Schlueter <i@izs.me>, James Talmage <james@talmage.io> (github.com/jamestalmage), and Contributors | tapjs/stack-utils |
| stackframe | 1.3.4 | MIT | Copyright (c) 2017 Eric Wendelin and other contributors | git://github.com/stacktracejs/stackframe |
| stacktrace-parser | 0.1.11 | MIT | Copyright (c) 2014-2019 Georg Tavonius | https://github.com/errwischt/stacktrace-parser |
| standard-navigation | 0.0.5 | MIT |  | ssh://git@github.com/react-navigation/standard-navigation |
| statuses | 1.5.0 | MIT | Copyright (c) 2014 Jonathan Ong <me@jongleberry.com> | jshttp/statuses |
| statuses | 2.0.2 | MIT | Copyright (c) 2014 Jonathan Ong <me@jongleberry.com> | jshttp/statuses |
| stream-buffers | 2.2.0 | Unlicense |  | https://github.com/samcday/node-stream-buffer |
| string-length | 4.0.2 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/string-length |
| string-width | 4.2.3 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/string-width |
| string-width | 5.1.2 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/string-width |
| strip-ansi | 5.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/strip-ansi |
| strip-ansi | 6.0.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/strip-ansi |
| strip-ansi | 7.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | chalk/strip-ansi |
| strip-bom | 4.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/strip-bom |
| strip-final-newline | 2.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/strip-final-newline |
| strip-indent | 3.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/strip-indent |
| strip-json-comments | 3.1.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/strip-json-comments |
| structured-headers | 0.4.1 | MIT |  | ssh://git@github.com/evert/structured-header |
| styleq | 0.1.3 | MIT | Copyright (c) Nicolas Gallagher | https://github.com/necolas/styleq |
| supports-color | 5.5.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/supports-color |
| supports-color | 7.2.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | chalk/supports-color |
| supports-color | 8.1.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | chalk/supports-color |
| supports-hyperlinks | 2.3.0 | MIT | Copyright (c) James Talmage <james@talmage.io> (github.com/jamestalmage) | jamestalmage/supports-hyperlinks |
| supports-preserve-symlinks-flag | 1.0.0 | MIT | Copyright (c) 2022 Inspect JS | https://github.com/inspect-js/node-supports-preserve-symlinks-flag |
| synckit | 0.11.13 | MIT | Copyright (c) 2021 UnTS | https://github.com/un-ts/synckit |
| terminal-link | 2.1.1 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/terminal-link |
| terser | 5.51.2 | BSD-2-Clause | Copyright 2012-2018 (c) Mihai Bazon <mihai.bazon@gmail.com> | https://github.com/terser/terser |
| test-exclude | 7.0.2 | ISC | Copyright (c) 2016, Contributors | https://github.com/istanbuljs/test-exclude |
| test-renderer | 1.3.1 | MIT |  | https://github.com/mdjastrzebski/test-renderer |
| throat | 5.0.0 | MIT | Copyright (c) 2013 Forbes Lindesay | https://github.com/ForbesLindesay/throat |
| tinyglobby | 0.2.17 | MIT | Copyright (c) 2024 Madeline Gurriarán | https://github.com/SuperchupuDev/tinyglobby |
| tmpl | 1.0.5 | BSD-3-Clause | Copyright (c) 2014, Naitik Shah. All rights reserved. | https://github.com/daaku/nodejs-tmpl |
| to-regex-range | 5.0.1 | MIT | Copyright (c) 2015-present, Jon Schlinkert. | micromatch/to-regex-range |
| toidentifier | 1.0.1 | MIT | Copyright (c) 2016 Douglas Christopher Wilson <doug@somethingdoug.com> | component/toidentifier |
| toqr | 0.1.1 | MIT | Copyright (c) Phil Pluckthun, | https://github.com/kitten/toqr |
| tr46 | 0.0.3 | MIT |  | https://github.com/Sebmaster/tr46.js |
| tslib | 2.8.1 | 0BSD | Copyright (c) Microsoft Corporation. | https://github.com/Microsoft/tslib |
| type-detect | 4.0.8 | MIT | Copyright (c) 2013 Jake Luer <jake@alogicalparadox.com> (http://alogicalparadox.com) | ssh://git@github.com/chaijs/type-detect |
| type-fest | 0.21.3 | (MIT OR CC0-1.0) | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https:/sindresorhus.com) | sindresorhus/type-fest |
| type-fest | 0.7.1 | (MIT OR CC0-1.0) | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com) | sindresorhus/type-fest |
| typescript | 6.0.3 | Apache-2.0 | "Licensor" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License. | https://github.com/microsoft/TypeScript |
| ua-parser-js | 0.7.41 | MIT | Copyright (c) 2012-2025 Faisal Salman <<f@faisalman.com>> | https://github.com/faisalman/ua-parser-js |
| ua-parser-js | 1.0.41 | MIT | Copyright (c) 2012-2025 Faisal Salman <<f@faisalman.com>> | https://github.com/faisalman/ua-parser-js |
| undici-types | 8.9.0 | MIT | Copyright (c) Matteo Collina and Undici contributors | https://github.com/nodejs/undici |
| unicode-canonical-property-names-ecmascript | 2.0.1 | MIT | Copyright Mathias Bynens <https://mathiasbynens.be/> | https://github.com/mathiasbynens/unicode-canonical-property-names-ecmascript |
| unicode-match-property-ecmascript | 2.0.0 | MIT | Copyright Mathias Bynens <https://mathiasbynens.be/> | https://github.com/mathiasbynens/unicode-match-property-ecmascript |
| unicode-match-property-value-ecmascript | 2.2.1 | MIT | Copyright Mathias Bynens <https://mathiasbynens.be/> | https://github.com/mathiasbynens/unicode-match-property-value-ecmascript |
| unicode-property-aliases-ecmascript | 2.2.0 | MIT | Copyright Mathias Bynens <https://mathiasbynens.be/> | https://github.com/mathiasbynens/unicode-property-aliases-ecmascript |
| unpipe | 1.0.0 | MIT | Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com> | stream-utils/unpipe |
| unrs-resolver | 1.12.2 | MIT |  | https://github.com/unrs/unrs-resolver |
| update-browserslist-db | 1.3.4 | MIT | Copyright 2022 Andrey Sitnik <andrey@sitnik.es> and other contributors | browserslist/update-db |
| use-latest-callback | 0.2.6 | MIT | Copyright (c) 2023 Satyajit Sahoo | https://github.com/satya164/use-latest-callback |
| utils-merge | 1.0.1 | MIT | Copyright (c) 2013-2017 Jared Hanson | git://github.com/jaredhanson/utils-merge |
| v8-to-istanbul | 9.3.0 | ISC | Copyright (c) 2017, Contributors | istanbuljs/v8-to-istanbul |
| validate-npm-package-name | 5.0.1 | ISC | Copyright (c) 2015, npm, Inc | https://github.com/npm/validate-npm-package-name |
| vary | 1.1.2 | MIT | Copyright (c) 2014-2017 Douglas Christopher Wilson | jshttp/vary |
| vlq | 1.0.1 | MIT | Copyright (c) 2017 [these people](https://github.com/Rich-Harris/vlq/graphs/contributors) | https://github.com/Rich-Harris/vlq |
| walker | 1.0.8 | Apache-2.0 | Copyright 2013 Naitik Shah | https://github.com/daaku/nodejs-walker |
| warn-once | 0.1.1 | MIT | Copyright (c) 2022 Satyajit Sahoo | https://github.com/satya164/warn-once |
| wcwidth | 1.0.1 | MIT | Copyright (C) 2012 by Jun Woong. | https://github.com/timoxley/wcwidth |
| webidl-conversions | 3.0.1 | BSD-2-Clause | Copyright (c) 2014, Domenic Denicola | jsdom/webidl-conversions |
| whatwg-fetch | 3.6.20 | MIT | Copyright (c) 2014-2023 GitHub, Inc. | github/fetch |
| whatwg-url | 5.0.0 | MIT | Copyright (c) 2015–2016 Sebastian Mayr | jsdom/whatwg-url |
| whatwg-url-minimum | 0.2.0 | MIT | Copyright (c) Phil Pluckthun, | https://github.com/expo/whatwg-url-minimum |
| which | 2.0.2 | ISC | Copyright (c) Isaac Z. Schlueter and Contributors | git://github.com/isaacs/node-which |
| wrap-ansi | 7.0.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | chalk/wrap-ansi |
| wrap-ansi | 8.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | chalk/wrap-ansi |
| write-file-atomic | 5.0.1 | ISC | Copyright (c) 2015, Rebecca Turner | https://github.com/npm/write-file-atomic |
| ws | 7.5.13 | MIT | Copyright (c) 2011 Einar Otto Stangvik <einaros@gmail.com> | websockets/ws |
| ws | 8.22.0 | MIT | Copyright (c) 2011 Einar Otto Stangvik <einaros@gmail.com> | https://github.com/websockets/ws |
| xcode | 4.0.0 | Apache-2.0 | "Licensor" shall mean the copyright owner or entity authorized by | https://github.com/apache/cordova-node-xcode |
| xml2js | 0.6.0 | MIT | Copyright 2010, 2011, 2012, 2013. All rights reserved. | https://github.com/Leonidas-from-XIV/node-xml2js |
| xmlbuilder | 11.0.1 | MIT | Copyright (c) 2013 Ozgur Ozcitak | git://github.com/oozcitak/xmlbuilder-js |
| xmlbuilder | 15.1.1 | MIT | Copyright (c) 2013 Ozgur Ozcitak | git://github.com/oozcitak/xmlbuilder-js |
| y18n | 5.0.8 | ISC | Copyright (c) 2015, Contributors | yargs/y18n |
| yallist | 3.1.1 | ISC | Copyright (c) Isaac Z. Schlueter and Contributors | https://github.com/isaacs/yallist |
| yargs | 17.7.3 | MIT | Copyright 2010 James Halliday (mail@substack.net); Modified work Copyright 2014 Contributors (ben@npmjs.com) | https://github.com/yargs/yargs |
| yargs-parser | 21.1.1 | ISC | Copyright (c) 2016, Contributors | https://github.com/yargs/yargs-parser |
| yocto-queue | 0.1.0 | MIT | Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com) | sindresorhus/yocto-queue |
