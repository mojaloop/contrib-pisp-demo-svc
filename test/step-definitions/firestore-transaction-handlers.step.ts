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
 - Kenneth Zeng <kkzeng@google.com>
 --------------
 ******/

import path from 'path'
import { loadFeature, defineFeature, DefineStepFunction } from 'jest-cucumber'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

import Config from '~/lib/config'
import PispDemoServer from '~/server'
import { onCreate, onUpdate } from '~/server/handlers/firestore/transactions'
import * as validator from '~/server/handlers/firestore/transactions.validator'
import { Transaction, Status, ResponseType } from '~/models/transaction'
import {
  AuthenticationResponseType,
  AuthenticationType,
  Currency,
  PartyIdType,
  AmountType,
} from '~/shared/ml-thirdparty-client/models/core'
import { consentRepository } from '~/repositories/consent'
import { transactionRepository } from '~/repositories/transaction'
import * as utils from '~/lib/utils'
import { Consent } from '~/models/consent'
import { Party } from '~/shared/ml-thirdparty-client/models/core'
import { logger } from '~/shared/logger'

// Mock firebase to prevent opening the connection
jest.mock('~/lib/firebase')

// Mock Mojaloop calls
const mockGetParties = jest.fn()
const mockPostTransactions = jest.fn()
const mockPutAuthorizations = jest.fn()
jest.mock('~/shared/ml-thirdparty-client', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getParties: mockGetParties,
      postTransactions: mockPostTransactions,
      putAuthorizations: mockPutAuthorizations,
    }
  })
})

// Mock validator functions
const mockIsValidPartyLookup = jest.spyOn(validator, 'isValidPartyLookup')
const mockIsValidPayeeConfirmation = jest.spyOn(
  validator,
  'isValidPayeeConfirmation'
)
const mockIsValidAuthorization = jest.spyOn(validator, 'isValidAuthorization')

// Mock transaction repo functions
const mockUpdateById = jest.spyOn(transactionRepository, 'updateById')
mockUpdateById.mockResolvedValue()

// Mock logger
const mockLoggerError = jest.spyOn(logger, 'error')
mockLoggerError.mockReturnValue()

// Mock consent repo functions
const party: tpAPI.Schemas.Party = {
  partyIdInfo: {
    partyIdType: PartyIdType.MSISDN,
    partyIdentifier: 'party_id',
  },
}

const consent: Consent = {
  id: 'b11ec534-ff48-4575-b6a9-ead2955b8069',
  // TODO: tech debt, need to update consent model, or ditch it altogether.
  party: party as Party
}

const mockGetConsentById = jest.spyOn(consentRepository, 'getConsentById')
mockGetConsentById.mockResolvedValue(consent)

const featurePath = path.join(
  __dirname,
  '../features/firestore-transaction-handlers.feature'
)
const feature = loadFeature(featurePath)

defineFeature(feature, (test): void => {
  let server: StateServer
  let transaction: Transaction

  afterEach(
    async (): Promise<void> => {
      jest.clearAllMocks()
      await server.stop()
    }
  )

  // Define reused steps
  const givenThePispDemoServer = (given: DefineStepFunction) => {
    given(
      'pisp-demo-server',
      async (): Promise<void> => {
        server = await PispDemoServer.run(Config)
      }
    )
  }

  const whenTheTransactionUpdatedHasXStatus = (when: DefineStepFunction) => {
    when(
      /^the Transaction that has been updated has (.*) status$/,
      async (status: string): Promise<void> => {
        if (status === 'undefined') {
          transaction = {
            id: '1234',
          }
        } else {
          transaction = {
            transactionRequestId: 'request_id',
            authentication: {
              type: AuthenticationType.OTP,
              value: '123456',
            },
            responseType: ResponseType.AUTHORIZED,
            id: '1234',
            amount: {
              amount: '12.00',
              currency: Currency.SGD,
            },
            transactionId: 'x31ec524-gh48-4535-b6c9-ead3011b8069',
            status: status as Status,
            payee: party,
          }
        }
        await onUpdate(server, transaction)
      }
    )
  }
  test('Create Transaction With Existing Status', ({
    given,
    when,
    then,
  }): void => {
    givenThePispDemoServer(given)

    when(
      'the Transaction that has been created has an existing status',
      async (): Promise<void> => {
        transaction = {
          id: '1234',
          status: Status.PENDING_PARTY_LOOKUP,
        }
        await onCreate(server, transaction)
      }
    )

    then('the server should do nothing', (): void => {
      expect(mockUpdateById).not.toBeCalled()
    })
  })

  test('Create New Transaction', ({ given, when, then }): void => {
    givenThePispDemoServer(given)

    when(
      'a new Transaction is created',
      async (): Promise<void> => {
        transaction = {
          id: '1234',
        }
        await onCreate(server, transaction)
      }
    )

    then(
      'the server should assign a transactionRequestId and a new status in the transaction repository',
      (): void => {
        expect(mockUpdateById).toBeCalledTimes(1)
        expect(mockUpdateById).toBeCalledWith(transaction.id, {
          transactionRequestId: expect.any(String),
          status: Status.PENDING_PARTY_LOOKUP,
        })
      }
    )
  })
  test('Update Transaction With <Status> Status', ({
    given,
    when,
    then,
  }): void => {
    givenThePispDemoServer(given)

    whenTheTransactionUpdatedHasXStatus(when)

    then(/^the server should (.*) on Mojaloop$/, (action: string): void => {
      switch (action) {
        case 'log an error': {
          expect(mockLoggerError).toBeCalledTimes(1)
          expect(mockLoggerError).toBeCalledWith(
            'Invalid transaction update, undefined status.'
          )
          break
        }
        case 'initiate party lookup': {
          expect(mockIsValidPartyLookup).toBeCalledTimes(1)
          expect(mockIsValidPartyLookup).toBeCalledWith(transaction)
          expect(mockGetParties).toBeCalledTimes(1)
          expect(mockGetParties).toBeCalledWith(
            transaction.payee?.partyIdInfo.partyIdType,
            transaction.payee?.partyIdInfo.partyIdentifier
          )
          break
        }
        case 'initiate payee confirmation': {
          expect(mockIsValidPayeeConfirmation).toBeCalledTimes(1)
          expect(mockIsValidPayeeConfirmation).toBeCalledWith(transaction)
          expect(mockPostTransactions).toBeCalledTimes(1)
          const expectedArg = {
            transactionRequestId: transaction.transactionRequestId,
            payee: transaction.payee,
            payer: expect.anything(),
            amountType: AmountType.RECEIVE,
            amount: transaction.amount!,
            transactionType: {
              scenario: 'TRANSFER',
              initiator: 'PAYER',
              initiatorType: 'CONSUMER',
            },
            expiration: utils.getTomorrowsDate().toISOString(),
          }
          expect(mockPostTransactions).toBeCalledWith(
            expectedArg,
            'PLACEHOLDER'
          )
          break
        }
        case 'initiate authorization': {
          expect(mockIsValidAuthorization).toBeCalledTimes(1)
          expect(mockIsValidAuthorization).toBeCalledWith(transaction)
          const expectedArgs = {
            responseType: AuthenticationResponseType.ENTERED,
            authenticationInfo: {
              authentication: transaction.authentication!.type!,
              authenticationValue: transaction.authentication!.value!,
            },
          }
          expect(mockPutAuthorizations).toBeCalledTimes(1)
          expect(mockPutAuthorizations).toBeCalledWith(
            transaction.transactionRequestId!,
            expectedArgs,
            'PLACEHOLDER'
          )
          break
        }
      }
    })
  })
})
