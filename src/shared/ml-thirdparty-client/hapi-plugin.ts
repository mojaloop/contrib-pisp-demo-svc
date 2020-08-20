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
 - Raman Mangla <ramanmangla@google.com>
 --------------
 ******/

import { Client } from '~/shared/ml-thirdparty-client'
import { Plugin, Server } from '@hapi/hapi'
import { Options } from './options'

/**
 * Re-export the config schema.
 */
export { Options }

/**
 * A plugin to setup a mojaloop client in the PISP demo server.
 * Note that the client object that could be used to perform various operations
 * in Mojaloop is stored in the application state.
 */
export const MojaloopClient: Plugin<Options> = {
  name: 'MojaloopClient',
  version: '1.0.0',
  register: (server: Server, config: Options) => {
    server.app.mojaloopClient = new Client({ ...config })
  },
}
