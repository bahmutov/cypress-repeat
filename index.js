#!/usr/bin/env node

// @ts-check

const cypress = require('cypress')
const debug = require('debug')('cypress-repeat')
const arg = require('arg')
const Bluebird = require('bluebird')

// if there is an .env file, lots it and add to process.env
require('dotenv').config()

const args = arg({
  '-n': Number,
})

const repeatNtimes = args['-n'] ? args['-n'] : 1

console.log('will repeat Cypress run %d time(s)', repeatNtimes)

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
    // TODO run N times
  })
  .catch((e) => {
    console.log('error: %s', e.message)
    console.error(e)
    process.exit(1)
  })
