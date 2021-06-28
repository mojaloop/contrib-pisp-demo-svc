/* eslint-disable @typescript-eslint/ban-ts-comment */
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

import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import { ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { Context } from 'openapi-backend'
import { Enum } from '@mojaloop/central-services-shared'

import { PartyFactory } from '~/shared/ml-thirdparty-simulator/factories/party'

import * as Authorizations from '~/server/handlers/openapi/mojaloop/authorizations'
import { transactionRepository } from '~/repositories/transaction'
import { Status } from '~/models/transaction'
import config from '~/lib/config'

import { AmountType, Currency, PartyIdType } from '~/shared/ml-thirdparty-client/models/core'
import { AuthorizationFactory } from '~/shared/ml-thirdparty-simulator/factories/authorization'

// Mock the factories to consistently return the hardcoded values.
jest.mock('~/shared/ml-thirdparty-simulator/factories/participant')
jest.mock('~/shared/ml-thirdparty-simulator/factories/party')
jest.mock('~/shared/ml-thirdparty-simulator/factories/authorization')

// Mock logger to prevent handlers from logging incoming request
jest.mock('~/shared/logger', () => ({
  logger: {
    logRequest: jest.fn().mockImplementation(),
  },
}))

// Mock firebase to prevent transaction repository from opening the connection.
jest.mock('~/lib/firebase')

const mockRequest = jest.fn().mockImplementation()

// @ts-ignore
const mockResponseToolkit: ResponseToolkit = {
  response: (): ResponseObject => {
    return ({
      code: (num: number): ResponseObject => {
        return ({
          statusCode: num,
        } as unknown) as ResponseObject
      },
    } as unknown) as ResponseObject
  },
}

/**
 * Mock data for transaction request.
 */
const transactionData = {
  transactionId: '111',
  transactionRequestId: '222',
  sourceAccountId: '123',
  consentId: '333',
  amountType: AmountType.RECEIVE,
  amount: {
    amount: '20',
    currency: Currency.USD,
  },
  transactionType: {
    scenario: 'TRANSFER',
    initiator: 'PAYER',
    initiatorType: 'CONSUMER',
  },
  expiration: '12345',
}

describe('/authorizations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('POST operation', () => {
    const payeeInfo = PartyFactory.createPutPartiesRequest(
      PartyIdType.MSISDN,
      '+1-111-111-1111'
    )
    const transactionRequest: tpAPI.Schemas.ThirdpartyRequestsTransactionsPostRequest = {
      payer: {
        partyIdType: 'THIRD_PARTY_LINK',
        partyIdentifier: '+1-222-222-2222'
      },
      payee: payeeInfo.party,
      transactionRequestId: '222',
      amountType: AmountType.RECEIVE,
      amount: {
        amount: '20',
        currency: Currency.USD,
      },
      transactionType: {
        scenario: 'TRANSFER',
        initiator: 'PAYER',
        initiatorType: 'CONSUMER',
      },
      expiration: '12345',    }

    const requestBody = AuthorizationFactory.createPostAuthorizationsRequest(
      transactionRequest
    )

    const context = {
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

    const transactionRepositorySpy = jest
      .spyOn(transactionRepository, 'update')
      .mockImplementation()

    it('Should return 202 and update data in Firebase', async () => {
      const response = await Authorizations.post(
        context,
        mockRequest,
        mockResponseToolkit
      )

      expect(transactionRepositorySpy).toBeCalledWith(
        {
          transactionRequestId: requestBody.transactionRequestId,
          status: Status.PENDING_PAYEE_CONFIRMATION,
        },
        {
          authentication: {
            type: requestBody.authenticationType,
          },
          transactionId: requestBody.transactionId,
          quote: requestBody.quote,
          status: Status.AUTHORIZATION_REQUIRED,
        }
      )

      expect(response.statusCode).toBe(Enum.Http.ReturnCodes.ACCEPTED.CODE)
    })
  })
})
