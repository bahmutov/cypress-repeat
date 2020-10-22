# cypress-repeat [![ci status][ci image]][ci url] [![renovate-app badge][renovate-badge]][renovate-app]

> Run Cypress multiple times in a row, great at finding test flake

Read [Wrap Cypress Using NPM Module API](https://glebbahmutov.com/blog/wrap-cypress-using-npm/)

## Install and use

```shell
npm i -D cypress-repeat
# or using Yarn
yarn add -D cypress-repeat
```

Assuming `cypress` has been installed

```shell
npx cypress-repeat run -n <N> ... rest of "cypress run" arguments
```

Which will run Cypresss `<N>` times, exiting after the first failed run or after all runs finish successfully.

## Debugging

Run this script with environment variable `DEBUG=cypress-repeat` to see verbose logs

[ci image]: https://github.com/bahmutov/cypress-repeat/workflows/ci/badge.svg?branch=main
[ci url]: https://github.com/bahmutov/cypress-repeat/actions
[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
