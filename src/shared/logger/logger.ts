/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 --------------
 ******/

import { createLogger, format, transports, LoggerOptions, Logger } from 'winston'
import config from './config'

const { combine, timestamp, colorize, printf } = format

const customLevels = config.get('customLevels')

const allLevels = { error: 0, warn: 1, audit: 2, trace: 3, info: 4, perf: 5, verbose: 6, debug: 7, silly: 8 }
const customLevelsArr = customLevels.split(/ *, */) // extra white space before/after the comma is ignored
console.log("customLevels", customLevels)
const ignoredLevels = customLevels ? Object.keys(allLevels).filter(key => !customLevelsArr.includes(key)) : []

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} - ${level}: ${message}`
})

let transport: transports.FileTransportInstance | transports.ConsoleTransportInstance;
if (config.get('logTransport') === 'file') {
  transport = new transports.File(config.get('transportFileOptions'))
} else { // console
  transport = new transports.Console()
}

const defaultLoggerOpts: LoggerOptions = {
  level: config.get('level'),
  levels: allLevels,
  format: combine(
    timestamp(),
    colorize({
      colors: {
        audit: 'magenta',
        trace: 'white',
        perf: 'green'
      }
    }),
    customFormat
  ),
  transports: [
    transport
  ],
  exceptionHandlers: [
    transport
  ],
  exitOnError: false
}

export const createDefaultLogger = (): Logger => {
  const logger = createLogger(defaultLoggerOpts)

  // Modify Logger before export
  console.log('ignored levels are:', ignoredLevels)
  ignoredLevels.map(level => {
    logger.configure({
      level,
      transports: []
    })
  })

  return logger
}
