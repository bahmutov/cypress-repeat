# cypress-repeat [![ci status][ci image]][ci url] [![renovate-app badge][renovate-badge]][renovate-app]

> Run Cypress multiple times in a row, great at finding test flake

Read [Wrap Cypress Using NPM Module API](https://glebbahmutov.com/blog/wrap-cypress-using-npm/)

## Install

```shell
npm i -D cypress-repeat
# or using Yarn
yarn add -D cypress-repeat
```

This module assumes the `cypress` dependency v5.3.0+ has been installed.

## Use

```shell
npx cypress-repeat run -n <N> ... rest of "cypress run" arguments
```

Which will run Cypresss `<N>` times, exiting after the first failed run or after all runs finish successfully.

### Until passes

You can flip the logic and run Cypress up to N times until the first successful exit

```shell
npx cypress-repeat run -n <N> --until-passes ... rest of "cypress run" arguments
```

### Env variables

Every run has two utility variables injected

```js
const n = Cypress.env('cypress_repeat_n') // total repeat attempts
const k = Cypress.env('cypress_repeat_k') // current attempt, starts with 1
                                          // and is <= n
```

## Debugging

Run this script with environment variable `DEBUG=cypress-repeat` to see verbose logs

[ci image]: https://github.com/bahmutov/cypress-repeat/workflows/ci/badge.svg?branch=main
[ci url]: https://github.com/bahmutov/cypress-repeat/actions
[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
