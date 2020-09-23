#!/usr/bin/env node

// @ts-check

const cypress = require('cypress')
const debug = require('debug')('cypress-repeat')
const arg = require('arg')
const Bluebird = require('bluebird')

// if there is an .env file, lots it and add to process.env
require('dotenv').config()

const args = arg(
  {
    '-n': Number,
  },
  { permissive: true },
)

const repeatNtimes = args['-n'] ? args['-n'] : 1

console.log('will repeat Cypress run %d time(s)', repeatNtimes)

/**
 * Quick and dirty deep clone
 */
const clone = (x) => JSON.parse(JSON.stringify(x))

const parseArguments = async () => {
  const cliArgs = args._
  if (cliArgs[0] !== 'cypress') {
    cliArgs.unshift('cypress')
  }

  if (cliArgs[1] !== 'run') {
    cliArgs.splice(1, 0, 'run')
  }

  debug('parsing Cypress CLI %o', cliArgs)
  return await cypress.cli.parseRunArguments(cliArgs)
}

parseArguments()
  .then((options) => {
    debug('parsed CLI options %o', options)

    // TODO take parsed options and form a list of options
    const allRunOptions = []

    for (let k = 0; k < repeatNtimes; k += 1) {
      const runOptions = clone(options)

      if (options.record && options.group) {
        // we are recording, thus we need to update the group name
        // to avoid clashing
        runOptions.group = options.group

        if (runOptions.group && repeatNtimes > 1) {
          // make sure if we are repeating this example
          // then the recording has group names on the Dashboard
          // like "example-1-of-20", "example-2-of-20", ...
          runOptions.group += `-${k + 1}-of-${repeatNtimes}`
        }
      }

      allRunOptions.push(runOptions)
    }
    return allRunOptions
  })
  .then((allRunOptions) => {
    // @ts-ignore
    return Bluebird.mapSeries(allRunOptions, (runOptions, k, n) => {
      console.log('***** repeat %d of %d *****', k + 1, n)

      const onTestResults = (testResults) => {
        if (testResults.failures) {
          console.error(testResults.message)
          process.exit(testResults.failures)
        }

        if (testResults.totalFailed) {
          console.error('run %d of %d failed', k + 1, n)
          process.exit(testResults.totalFailed)
        }
      }

      return cypress.run(runOptions).then(onTestResults)
    })
  })
  .then(() => {
    console.log('***** finished %d run(s) successfully *****', repeatNtimes)
  })
  .catch((e) => {
    console.log('error: %s', e.message)
    console.error(e)
    process.exit(1)
  })
