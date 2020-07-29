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

import { Simulator } from '~/shared/ml-thirdparty-simulator'
import { PartyIdType } from './models/core'
import { ThirdPartyTransactionRequest } from './models/openapi'

namespace Client {
  /**
   * An interface definition for the configuration needed to setup the 
   * Mojaloop client.
   */
  export interface Config {
    /**
     * Mojaloop URL for the client to communicate with.
     */
    mojaloopUrl: string
  }
}

/**
 * Default configurations for the mojaloop client libary.
 */
const defaultConfig: Client.Config = {
  mojaloopUrl: '',
}

/**
 * A client object that abstracts out operations that could be performed in
 * Mojaloop. With this, a service does not need to directly specify the request 
 * endpoint, body, params, and headers that are required to talk with the 
 * Mojaloop APIs. Instead, the service implementation could just pass the necessary
 * config upon initialization and relevant information in the function parameters
 * when it wants to perform a certain operation.
 */
export class Client {
  config: Client.Config
  simulator?: Simulator

  public constructor(config?: Client.Config) {
    if (config) {
      this.config = { ...defaultConfig, ...config }
    } else {
      this.config = defaultConfig
    }
  }

  /**
   * Performs a lookup for a party with the given identifier.
   * 
   * @param type  the type of party identifier
   * @param id    the party identifier
   */
  public async getParties(type: PartyIdType, id: string): Promise<void> {
    if (this.simulator) {
      // If the client is configured with a simulator, then it will not
      // communicate with Mojaloop directly. Instead, it will only generate
      // a random response that is injected to the internal routes.
      this.simulator.getParties(type, id)
      return
    }

    // TODO: Implement communication with Mojaloop.
  }

  public async postTransactions(requestBody: ThirdPartyTransactionRequest) {
    if (this.simulator) {
      return this.simulator.postTransactions(requestBody)
    }
  }
}
