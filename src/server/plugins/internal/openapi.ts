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
  baseHost: string
  definition: {
    app: string
    mojaloop: string
  }
  quick: boolean
  strict: boolean
  handlers: {
    api: {
      app: {
        [operationId: string]: Handler
      }
      mojaloop: {
        [operationId: string]: Handler
      }
    }
    ext: OpenApiExtHandlers
  }
}

const registerAppBackend = (server: Server, opts: OpenApiOpts) => {
  const api = new OpenApiBackend({
    definition: opts.definition.app,
    quick: opts.quick,
    strict: opts.strict,
  })

  api.register({
    ...opts.handlers.api.app,
    ...opts.handlers.ext,
  })

  api.init()

  server.route({
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    path: '/{path*}',
    vhost: 'app.' + opts.baseHost,
    handler: (request: Request, h: ResponseToolkit): Promise<any> => {
      console.log('here come')
      return api.handleRequest(
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
    }
  })
}

const registerMojaloopBackend = (server: Server, opts: OpenApiOpts) => {
  const api = new OpenApiBackend({
    definition: opts.definition.mojaloop,
    quick: opts.quick,
    strict: opts.strict,
  })

  api.register({
    ...opts.handlers.api.mojaloop,
    ...opts.handlers.ext,
  })

  api.init()

  server.route({
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    path: '/{path*}',
    vhost: 'mojaloop.' + opts.baseHost,
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

export const OpenApi: Plugin<OpenApiOpts> = {
  name: 'PispDemoOpenApi',
  version: '1.0.0',
  register: async (server: Server, opts: OpenApiOpts) => {
    registerAppBackend(server, opts)
    registerMojaloopBackend(server, opts)
  }
}
