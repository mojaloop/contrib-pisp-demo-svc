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

import { Server } from '@hapi/hapi'

import { PartyIdType } from '~/shared/ml-thirdparty-client/models/core'
import {
  mockPutPartiesRequest,
} from './mock'

namespace Simulator {
  /**
   * An interface definition for config options that could be passed
   * to the simulator.
   */
  export interface Options {
    /**
     * An optional field to set the host value in the request header. 
     * This is useful for a service that handles Mojaloop callback using
     * a virtual host, because it will require the host field in the request
     * header to determine the routing.
     */
    host?: string

    /**
     * A fixed delay time before injecting a response to the server.
     * This is useful to simulate network latency that may happen when 
     * communicating with the real Mojaloop services.
     */
    delay?: number
  }
}

/**
 * Simulator allows Mojaloop's client to mock out the communication and return
 * randomly generated replies. This is useful to aid the testing process when
 * Mojaloop is not deployed.
 */
export class Simulator {
  server: Server
  opts: Simulator.Options

  constructor(server: Server, opts: Simulator.Options) {
    this.server = server
    this.opts = opts
  }

  /**
   * Simulates a party lookup operation in Mojaloop, without the need of 
   * sending `GET /parties/{Type}/{ID}` request.
   * 
   * @param type  type of the party identifier.
   * @param id    the party identifier.
   */
  async getParties(type: PartyIdType, id: string): Promise<void> {
    const targetUrl = '/parties/' + type.toString() + '/' + id
    const payload = mockPutPartiesRequest(type, id)

    if (this.opts.delay) {
      // Delay operations to simulate network latency in real communication
      // with Mojaloop.
      await this.delay(1500)
    }

    // Inject a request to the server as if it receives an inbound request
    // from Mojaloop.
    this.server.inject({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: this.opts.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }

  /**
   * Returns a promise that will be resolved after a certain duration.
   * 
   * @param ms the length of delay in milisecond.
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
