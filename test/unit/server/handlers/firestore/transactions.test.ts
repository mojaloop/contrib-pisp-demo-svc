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

import { Server } from '@hapi/hapi'

import * as utils from '~/lib/utils'
import config from '~/lib/config'
import { transactionRepository } from '~/repositories/transaction'

import createServer from '~/server/create'
import * as transactionsHandler from '~/server/handlers/firestore/transactions'

import {
  AmountType,
  AuthenticationType,
  AuthenticationResponseType,
  Currency,
  PartyIdType,
} from '~/shared/ml-thirdparty-client/models/core'
import { Status, Transaction, ResponseType } from '~/models/transaction'
import { ThirdPartyTransactionRequest, AuthorizationsPutIdRequest } from '~/shared/ml-thirdparty-client/models/openapi'
import { consentRepository } from '~/repositories/consent'
import { Consent } from '~/models/consent'

// Mock firebase to prevent server from listening to the changes.
jest.mock('~/lib/firebase')

// Mock uuid to consistently return the provided value.
jest.mock('uuid', () => ({
  v4: jest.fn().mockImplementation(() => '12345'),
}))

// Mock utils to consistently return the provided value.
jest.mock('~/lib/utils', () => ({
  getTomorrowsDate: jest.fn().mockImplementation(() => {
    return new Date(100)
  }),
}))

// Create stub data to perform transaction request
function createStubTransactionRequestData(): Transaction {
  return {
    id: '111',
    transactionRequestId: '888',
    sourceAccountId: '111',
    consentId: '222',
    amount: {
      amount: '20',
      currency: Currency.USD,
    },
    payee: {
      partyIdInfo: {
        partyIdType: PartyIdType.MSISDN,
        partyIdentifier: '+1-111-111-1111',
        fspId: 'fspa',
      },
      name: 'Alice Alpaca',
      personalInfo: {
        complexName: {
          firstName: 'Alice',
          lastName: 'Alpaca',
        },
      },
    },
    status: Status.PENDING_PAYEE_CONFIRMATION,
  }
}

// Create stub consent data related to the transaction
function createStubConsentData(): Consent {
  return {
    id: '123',
    consentId: '222',
    party: {
      partyIdInfo: {
        partyIdType: PartyIdType.MSISDN,
        partyIdentifier: '+1-222-222-2222',
        fspId: 'fspb',
      },
      name: 'Bob Beaver',
      personalInfo: {
        complexName: {
          firstName: 'Bob',
          lastName: 'Beaver',
        },
      },
    },
  }
}

describe('Handlers for transaction documents in Firebase', () => {
  let server: Server

  beforeAll(async () => {
    server = await createServer(config)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('Should set status and transactionRequestId for new transaction', () => {
    const transactionRepositorySpy = jest.spyOn(
      transactionRepository,
      'updateById'
    )
    const documentId = '111'

    transactionsHandler.onCreate(server, {
      id: documentId,
      userId: 'bob123',
      payee: {
        partyIdInfo: {
          partyIdType: PartyIdType.MSISDN,
          partyIdentifier: '+1-111-111-1111',
        },
      },
    })

    expect(transactionRepositorySpy).toBeCalledWith(documentId, {
      transactionRequestId: '12345',
      status: Status.PENDING_PARTY_LOOKUP,
    })
  })

  it('Should perform party lookup when all necessary fields are set', async () => {
    const documentId = '111'
    const mojaloopClientSpy = jest
      .spyOn(server.app.mojaloopClient, 'getParties')
      .mockImplementation()

    await transactionsHandler.onUpdate(server, {
      id: documentId,
      userId: 'bob123',
      payee: {
        partyIdInfo: {
          partyIdType: PartyIdType.MSISDN,
          partyIdentifier: '+1-111-111-1111',
        },
      },
      transactionRequestId: '12345',
      status: Status.PENDING_PARTY_LOOKUP,
    })

    expect(mojaloopClientSpy).toBeCalledWith(
      PartyIdType.MSISDN,
      '+1-111-111-1111'
    )
  })

  it('Should initiate transaction request when all necessary fields are set', async () => {
    const mojaloopClientSpy = jest
      .spyOn(server.app.mojaloopClient, 'postTransactions')
      .mockImplementation()

    // Mock transaction data given by Firebase
    const transactionRequestData = createStubTransactionRequestData()

    // Mock consent data that would be retrieved from Firebase
    const consentData = createStubConsentData()

    const consentRepositorySpy = jest
      .spyOn(consentRepository, 'getByConsentId')
      .mockImplementation(() => new Promise((resolve) => resolve(consentData)))

    // Mock the expected transaction request being sent.
    const transactionRequest: ThirdPartyTransactionRequest = {
      transactionRequestId: transactionRequestData.transactionRequestId!,
      sourceAccountId: transactionRequestData.sourceAccountId!,
      consentId: transactionRequestData.consentId!,
      payee: transactionRequestData.payee!,
      payer: consentData.party!,
      amountType: AmountType.RECEIVE,
      amount: transactionRequestData.amount!,
      transactionType: {
        scenario: 'TRANSFER',
        initiator: 'PAYER',
        initiatorType: 'CONSUMER',
      },
      expiration: utils.getTomorrowsDate().toISOString(),
    }

    await transactionsHandler.onUpdate(server, transactionRequestData)

    expect(consentRepositorySpy).toBeCalled()
    expect(mojaloopClientSpy).toBeCalledWith(transactionRequest)
  })

  it('Should send authorization when all necessary fields are set', () => {
    const documentId = '111'
    let mojaloopClientSpy = jest.spyOn(server.app.mojaloopClient, 'putAuthorizations').mockImplementation()

    // Mock transaction data given by Firebase
    const transactionData: Transaction = {
      id: documentId,
      userId: 'bob123',
      transactionRequestId: '111',
      transactionId: '222',
      authentication: {
        type: AuthenticationType.U2F,
        value: '12345'
      },
      responseType: ResponseType.AUTHORIZED,
      status: Status.AUTHORIZATION_REQUIRED,
    }

    // Mock the expected authorization being sent.
    const authorization: AuthorizationsPutIdRequest = {
      authenticationInfo: {
        authentication: AuthenticationType.U2F,
        authenticationValue: '12345'
      },
      responseType: AuthenticationResponseType.ENTERED,
    }

    transactionsHandler.onUpdate(server, transactionData)

    expect(mojaloopClientSpy).toBeCalledWith(
      transactionData.transactionRequestId!, authorization, transactionData.transactionId
    )
  })
})
