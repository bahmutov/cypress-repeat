#!/usr/bin/env node

// @ts-check

const debug = require('debug')('cypress-repeat')

// allows us to debug any cypress install problems
debug('requiring cypress with module.paths %o', module.paths)
const cypress = require('cypress')

const arg = require('arg')
const Bluebird = require('bluebird')

// if there is an .env file, lots it and add to process.env
require('dotenv').config()

debug('process argv %o', process.argv)
const args = arg(
  {
    '-n': Number,
    '--until-passes': Boolean,
    '--rerun-failed-only': Boolean,
  },
  { permissive: true },
)
const name = 'cypress-repeat:'
const repeatNtimes = '-n' in args ? args['-n'] : 1
const untilPasses = '--until-passes' in args ? args['--until-passes'] : false
const rerunFailedOnly =
  '--rerun-failed-only' in args ? args['--rerun-failed-only'] : false

console.log('%s will repeat Cypress command %d time(s)', name, repeatNtimes)

if (untilPasses) {
  console.log('%s but only until it passes', name)
}

if (rerunFailedOnly) {
  console.log('%s it only reruns specs which have failed', name)
}

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

      const envVariables = `cypress_repeat_n=${repeatNtimes},cypress_repeat_k=${
        k + 1
      }`
      if (!('env' in runOptions)) {
        runOptions.env = envVariables
      } else {
        runOptions.env += ',' + envVariables
      }

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
      const isLastRun = k === n - 1
      console.log('***** %s %d of %d *****', name, k + 1, n)

      /**
       * @type {(testResults: CypressCommandLine.CypressRunResult | CypressCommandLine.CypressFailedRunResult) => void}
       */
      const onTestResults = (testResults) => {
        debug('is %d the last run? %o', k, isLastRun)
        if (rerunFailedOnly && !isLastRun) {
          const failedSpecs = testResults.runs
            .filter((run) => run.stats.failures != 0)
            .map((run) => run.spec.relative)
            .join(',')

          if (failedSpecs.length) {
            console.log('%s failed specs', name)
            console.log(failedSpecs)
            allRunOptions[k + 1].spec = failedSpecs
          } else {
            console.log('%s there were no failed specs', name)
            console.log('%s exiting', name)
            process.exit(0)
          }
        }

        if (testResults.status === 'failed') {
          // failed to even run Cypress tests
          if (testResults.failures) {
            console.error(testResults.message)
            return process.exit(testResults.failures)
          }
        }

        if (testResults.status === 'finished') {
          if (untilPasses) {
            if (!testResults.totalFailed) {
              console.log(
                '%s successfully passed on run %d of %d',
                name,
                k + 1,
                n,
              )
              process.exit(0)
            }
            console.error('%s run %d of %d failed', name, k + 1, n)
            if (k === n - 1) {
              console.error('%s no more attempts left', name)
              process.exit(testResults.totalFailed)
            }
          } else {
            if (testResults.totalFailed) {
              console.error('%s run %d of %d failed', name, k + 1, n)
              if (!rerunFailedOnly || isLastRun) {
                process.exit(testResults.totalFailed)
              }
            }
          }
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
