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

import OpenApiBackend, { Handler } from 'openapi-backend'

import { Plugin, Server, Request, ResponseToolkit } from '@hapi/hapi'

export interface OpenApiExtHandlers {
  notFound: Handler
  methodNotAllowed: Handler
  notImplemented: Handler
  validationFail: Handler
}

export interface OpenApiOpts {
  definition: string
  quick: boolean
  strict: boolean
  handlers: {
    api: {
      [operationId: string]: Handler
    }
    ext: OpenApiExtHandlers
  }
}

export const OpenApi: Plugin<OpenApiOpts> = {
  name: 'OpenApiBackend',
  version: '3.5.1',
  register: async (server: Server, opts: OpenApiOpts) => {

    const api = new OpenApiBackend({
      definition: opts.definition,
      quick: opts.quick,
      strict: opts.strict,
    })

    api.register({
      ...opts.handlers.api,
      ...opts.handlers.ext,
    })

    api.init()

    server.route({
      method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      path: '/{path*}',
      handler: (request: Request, h: ResponseToolkit): Promise<any> =>
        api.handleRequest(
          {
            method: request.method,
            path: request.path,
            query: request.query,
            body: request.payload,
            headers: request.headers,
          },
          request,
          h,
        )
    })
  }
}
