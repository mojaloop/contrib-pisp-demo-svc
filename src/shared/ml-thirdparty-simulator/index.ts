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
import * as faker from 'faker'

import { PartyIdType } from '~/shared/ml-thirdparty-client/models/core'
import { ThirdPartyTransactionRequest, AuthorizationsPutIdRequest } from '../ml-thirdparty-client/models/openapi'

import {
  mockPutPartiesRequest,
  mockPostAuthorizationsRequest,
  mockTransferIdPutRequest
} from './mock'

namespace Simulator {
  export interface Options {
    vhost?: string
  }
}

export class Simulator {
  server: Server
  opts: Simulator.Options

  constructor(server: Server, opts: Simulator.Options) {
    this.server = server
    this.opts = opts
  }

  async getParties(type: PartyIdType, id: string): Promise<void> {
    const targetUrl = '/parties/' + type.toString() + '/' + id
    console.log("tesstt", targetUrl)

    this.server.inject({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: this.opts.vhost ?? '',
        'Content-Length': '1234',
        'Content-Type': 'application/json',
      },
      payload: mockPutPartiesRequest(type, id),
    })
  }

  async postTransactions(request: ThirdPartyTransactionRequest): Promise<void> {
    this.server.inject({
      method: 'POST',
      url: '/authorizations',
      headers: {
        host: this.opts.vhost ?? '',
        'Content-Length': '1234',
        'Content-Type': 'application/json',
      },
      payload: mockPostAuthorizationsRequest(request),
    })
  }

  async putAuthorizations(id: string,
    request: AuthorizationsPutIdRequest, transactionId: string): Promise<void> {

    this.server.inject({
      method: 'PUT',
      url: '/transfers/' + faker.random.uuid(),
      headers: {
        host: this.opts.vhost ?? '',
        'content-length': '1234',
        'content-type': 'application/json',
      },
      payload: mockTransferIdPutRequest(id, request, transactionId),
    })
  }
}
