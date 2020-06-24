/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 --------------
 ******/

import { createLogger, format, transports } from 'winston'
import LoggerConfig from './config'

const { combine, timestamp, colorize, printf } = format

const customLevels = LoggerConfig.get('customLevels')

const allLevels = { error: 0, warn: 1, audit: 2, trace: 3, info: 4, perf: 5, verbose: 6, debug: 7, silly: 8 }
const customLevelsArr = customLevels.split(/ *, */) // extra white space before/after the comma is ignored
const ignoredLevels = customLevels ? Object.keys(allLevels).filter(key => !customLevelsArr.includes(key)) : []

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} - ${level}: ${message}`
})

let transport: transports.FileTransportInstance | transports.ConsoleTransportInstance;
if (LoggerConfig.get('logTransport') === 'file') {
  transport = new transports.File(LoggerConfig.get('transportFileOptions'))
} else { // console
  transport = new transports.Console()
}

const Logger = createLogger({
  level: LoggerConfig.get('level'),
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
})

// Modify Logger before export
ignoredLevels.map(level => {
  Logger.configure({
    level,
    transports: []
  })
})

export default Logger
