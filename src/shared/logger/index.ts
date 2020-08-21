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
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 --------------
 ******/

import util from 'util'

import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi'
import { Context } from 'openapi-backend'

import { createDefaultLogger } from './logger'

export interface RequestLogged extends Request {
  response: ResponseLogged;
}

export interface ResponseLogged extends ResponseObject {
  source: string;
  statusCode: number;
}

export interface BaseLogger {
  info: (message: string, ...meta: any[]) => any
  error: (messsage: string, ...meta: any[]) => any
}

export class Logger {
  _logger: BaseLogger

  constructor() {
    this._logger = createDefaultLogger()
  }

  logRequest(context: Context, _: Request, __: ResponseToolkit): void {
    const headersStr = util.inspect(context.request.headers, { showHidden: true, depth: null })
    const paramstStr = util.inspect(context.request.params, { showHidden: true, depth: null })
    const payloadStr = util.inspect(context.request.body, { showHidden: true, depth: null })
    this._logger.info(`New request - headers: ${headersStr}, params: ${paramstStr}, payload: ${payloadStr}`)
  }

  logResponse(request: RequestLogged) {
    if (request && request.response) {
      let response
      try {
        response = JSON.stringify(request.response.source)
      } catch (e) {
        response = util.inspect(request.response.source, { showHidden: true, depth: null })
      }
      if (!response) {
        this._logger.info(`AS-Trace - Response: ${request.response}`)
      } else {
        this._logger.info(`AS-Trace - Response: ${response} Status: ${request.response.statusCode}`)
      }
    }
  }

  info(message: string, ...meta: any[]) {
    this._logger.info(message, ...meta)
  }

  error(message: string, ...meta: any[]) {
    this._logger.error(message, ...meta)
  }
}

export const logger = new Logger()
