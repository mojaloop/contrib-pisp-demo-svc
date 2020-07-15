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

import { OpenApiExtHandlers } from '../../plugins/internal/openapi'
import { Context } from 'openapi-backend'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { logger } from '~/shared/logger'

import { apiHandlers as appApiHandlers } from './app'
import { apiHandlers as mojaloopApiHandlers } from './mojaloop'
import util from 'util'

export {
  appApiHandlers,
  mojaloopApiHandlers
}

export const apiHandlers = {
  ...appApiHandlers,
  ...mojaloopApiHandlers
}

export const extHandlers: OpenApiExtHandlers = {
  notFound: (context: Context, request: Request, h: ResponseToolkit) => {
    logger.error(`notFound, context: ${context}, request: ${request}, h: ${h}`)
    logger.logRequest(context, request, h)
    return h.response().code(404)
  },

  methodNotAllowed: (context: Context, request: Request, h: ResponseToolkit) => {
    logger.error(`methodNotAllowed, context: ${context}, request: ${request}, h: ${h}`)
    logger.logRequest(context, request, h)
    return h.response().code(405)
  },

  validationFail: (context: Context, request: Request, h: ResponseToolkit) => {
    let errorStr = util.inspect(context.validation.errors, { showHidden: true, depth: null })
    logger.error(`validationFail ${errorStr}`)
    logger.logRequest(context, request, h)
    return h.response().code(406)
  },

  notImplemented: (context: Context, request: Request, h: ResponseToolkit) => {
    logger.error(`notImplemented, context: ${context}, request: ${request}, h: ${h}`)
    logger.logRequest(context, request, h)
    return h.response().code(501)
  },
}
