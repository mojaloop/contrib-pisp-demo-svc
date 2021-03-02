// /*****
//  License
//  --------------
//  Copyright © 2020 Mojaloop Foundation
//  The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
//  http://www.apache.org/licenses/LICENSE-2.0
//  Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
//  Contributors
//  --------------
//  This is the official list of the Mojaloop project contributors for this file.
//  Names of the original copyright holders (individuals or organizations)
//  should be listed with a '*' in the first column. People who have
//  contributed from an organization can be listed under the organization
//  that actually holds the copyright for their contributions (see the
//  Mojaloop Foundation organization for an example). Those individuals should have
//  their names indented and be marked with a '-'. Email address can be added
//  optionally within square brackets <email>.
//  * Mojaloop Foundation
//  - Name Surname <name.surname@mojaloop.io>

//  * Google
//  - Steven Wijaya <stevenwjy@google.com>
//  - Abhimanyu Kapur <abhi.kapur09@gmail.com>
//  --------------
//  ******/

// import { Plugin, Server } from '@hapi/hapi'
// import { Simulator } from '~/shared/ml-thirdparty-simulator'
// import { Options } from './options'

// /**
//  * Re-export the config schema.
//  */
// export { Options }

// /**
//  * A plugin that enables PISP demo server to pretend to communicate with Mojaloop.
//  * In fact, the server only talks with a simulator that generates a random data
//  * and inject callbacks to the internal routes.
//  *
//  * The 'MojaloopClient' plugin must be registered before trying to
//  * register this function as it will try to intercept the requests before they reach
//  * the simulator.
//  */
// export const MojaloopSimulator: Plugin<Options> = {
//   name: 'MojaloopSimulator',
//   version: '1.0.0',
//   register: (server: Server, options: Options) => {
//     (server as StateServer).app.mojaloopClient.simulator = new Simulator(
//       server as StateServer,
//       { ...options },
//     )
//   }
// }
