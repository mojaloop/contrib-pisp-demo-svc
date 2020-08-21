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

import { ResponseToolkit, ResponseObject } from '@hapi/hapi'

import { PartyFactory } from '~/shared/ml-thirdparty-simulator/factories/party'
import { PartyIdType } from '~/shared/ml-thirdparty-client/models/core'

import { transactionRepository } from '~/repositories/transaction'
import * as PartiesByTypeAndIdHandlers from '~/server/handlers/openapi/mojaloop/parties/{Type}/{ID}'
import { Context } from 'openapi-backend'
import { Status } from '~/models/transaction'

import config from '~/lib/config'

// Mock the factories to consistently return the hardcoded values.
jest.mock('~/shared/ml-thirdparty-simulator/factories/participant')
jest.mock('~/shared/ml-thirdparty-simulator/factories/party')

// Mock logger to prevent handlers from logging incoming request
jest.mock('~/shared/logger', () => ({
  logger: {
    logRequest: jest.fn().mockImplementation()
  }
}))

// Mock firebase to prevent transaction repository from opening the connection.
jest.mock('~/lib/firebase')

const mockRequest = jest.fn().mockImplementation()

const mockResponseToolkit = {
  response: (): ResponseObject => {
    return {
      code: (num: number): ResponseObject => {
        return num as unknown as ResponseObject
      }
    } as unknown as ResponseObject
  }
} as unknown as ResponseToolkit

describe('/parties/{Type}/{ID}', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('PUT operation', () => {
    let requestBody = PartyFactory.createPutPartiesRequest(PartyIdType.MSISDN, '+1-111-111-1111')

    let context = {
      request: {
        headers: {
          host: 'mojaloop.' + config.get('hostname'),
          'content-type': 'application/json',
          'content-length': JSON.stringify(requestBody).length,
        },
        params: {
          Type: PartyIdType.MSISDN,
          ID: '+1-111-111-1111',
        },
        body: requestBody,
      }
    } as unknown as Context

    let transactionRepositorySpy = jest.spyOn(transactionRepository, 'update').mockImplementation()

    it('Should return 200 and update data in Firebase', async () => {
      let response = await PartiesByTypeAndIdHandlers.put(context, mockRequest, mockResponseToolkit)

      expect(transactionRepositorySpy).toBeCalledWith(
        {
          'payee.partyIdInfo.partyIdType': PartyIdType.MSISDN,
          'payee.partyIdInfo.partyIdentifier': '+1-111-111-1111',
          status: Status.PENDING_PARTY_LOOKUP,
        },
        {
          payee: requestBody.party,
          status: Status.PENDING_PAYEE_CONFIRMATION,
        }
      )

      expect(response).toBe(200)
    })
  })
})
