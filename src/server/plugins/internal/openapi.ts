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

import OpenApiBackend, { Handler } from 'openapi-backend'
import { Plugin, Server, Request, ResponseToolkit } from '@hapi/hapi'

export interface ExtHandlers {
  /**
   * Handler when someone tries to access an endpoint that is not defined
   * in the open API specification file.
   */
  notFound: Handler

  /**
   * Handler when someone tries to access an endpoint that is defined in the 
   * open API specification file, but with different method. For example, there
   * is only `GET` method available for `/health`. If someone tries to perform
   * `POST /health` request, then this handler will be called.
   */
  methodNotAllowed: Handler

  /**
   * Handler for endpoints that are defined in the open API specification file,
   * but not implemented on the server side.
   */
  notImplemented: Handler

  /**
   * Handler when someone tries to access a valid endpoint, but the request headers,
   * params, queries, and/or body do not pass the validation check (e.g., invalid format).
   */
  validationFail: Handler
}

export interface ApiHandlers {
  [operationId: string]: Handler
}

export interface VirtualHostOptions {
  /**
   * Subdomain for the virtual host. This value will be joined with the
   * `baseHost` with a dot character as a separator.
   */
  subdomain: string,

  /**
   * Path to the definition file for the open API.
   */
  definition: string,

  /**
   * Handlers for the open API endpoints.
   */
  handlers: {
    /**
     * Handle the API endpoints that are defined in the specification file.
     */
    api: ApiHandlers,

    /**
     * Handle extra cases that may happen such as calling undefined endpoints,
     * validation fail, etc.
     */
    ext: ExtHandlers,
  }
}

export interface SharedOptions {
  /**
   * Base host name for the open API backend. The subdomain for each virtual
   * host will be appended in the beginning of this value. For example, if
   * the base host is `api.mojaloop.io` and the subdomain for a virtual host
   * is `app`, then the resulting address for the virtual host will be
   * `app.api.mojaloop.io`.
   */
  baseHost: string

  /**
   * In the quick mode, the backend will try to optimize startup by not waiting 
   * for the OpenAPI specification file to be fully loaded and will not perform 
   * any validation to it. This might break things if a request come before the
   * specification is fully loaded. The default value is false, which means the 
   * backend will wait for the document to be loaded and try to perform validation
   * upon initialization.
   */
  quick?: boolean

  /**
   * In the strict mode, the open API backend will try to validate the definition 
   * file and could throw validation errors. The default value is false, which means 
   * the backend will only give warnings for the errors.
   */
  strict?: boolean
}

export interface Options {
  /**
   * Shared options between backends that will be registered by this
   * plugin. In the future updates, the values specified in this object
   * may act as default values that could be overwritten by the options
   * for the respective virtual host. 
   */
  shared: SharedOptions

  /**
   * Config for the open API backend that serves the endpoints
   * to communicate with the PISP demo app.
   */
  app: VirtualHostOptions

  /**
   * Config for the open API backend that serves the endpoints
   * to communicate with Mojaloop.
   */
  mojaloop: VirtualHostOptions
}


function registerBackend(server: Server, vhostOpts: VirtualHostOptions, sharedOpts: SharedOptions) {
  // Create the backend object
  const api = new OpenApiBackend({
    definition: vhostOpts.definition,
    quick: sharedOpts.quick,
    strict: sharedOpts.strict,
  })

  // Register the endpoints that need to be served by the backend
  api.register({
    ...vhostOpts.handlers.api,
    ...vhostOpts.handlers.ext,
  })

  api.init()

  // route all traffic going to the specified virtual host to be passed
  // to the open API backend.
  server.route({
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    path: '/{path*}',
    vhost: [vhostOpts.subdomain, sharedOpts.baseHost].join('.'),
    handler: (request: Request, h: ResponseToolkit) =>
      api.handleRequest(
        {
          method: request.method,
          path: request.path,
          query: request.query,
          body: request.payload,
          headers: request.headers,
        },
        request,
        h
      ),
  })
}

/**
 * Plugin to setup the open API backend that handles the communication
 * with the mobile app and Mojaloop.
 */
export const OpenApi: Plugin<Options> = {
  name: 'PispDemoOpenApi',
  version: '1.0.0',
  register: async (server: Server, opts: Options) => {
    // Register open API backends that serve endpoints to communicate with 
    // the demo app and Mojaloop. Each will use a virtual host in the format 
    // of `{subdomain}.{baseHost}`. For example, if the base host name is 
    // `api.example.com` and the subdomain is `app`, then this plugin will 
    // serve the APIs on `app.api.example.com`.
    registerBackend(server, opts.app, opts.shared)
    registerBackend(server, opts.mojaloop, opts.shared)
  },
}
