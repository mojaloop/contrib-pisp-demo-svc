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

import { Server } from '@hapi/hapi'

import config from '~/lib/config'

import { Client } from '~/shared/ml-thirdparty-client'
import { Simulator } from '~/shared/ml-thirdparty-simulator'

import {
  AmountType,
  AuthenticationResponseType,
  AuthenticationType,
  Currency,
  PartyIdType,
} from '~/shared/ml-thirdparty-client/models/core'

import {
  AuthorizationsPutIdRequest,
  ThirdPartyTransactionRequest,
} from '~/shared/ml-thirdparty-client/models/openapi'

const transactionRequestData: ThirdPartyTransactionRequest = {
  transactionRequestId: '888',
  sourceAccountId: '111',
  consentId: '222',
  payee: {
    partyIdInfo: {
      partyIdType: PartyIdType.MSISDN,
      partyIdentifier: '+1-111-111-1111',
      fspId: 'fspa',
    },
    name: 'Alice Alpaca',
  },
  payer: {
    partyIdInfo: {
      partyIdType: PartyIdType.MSISDN,
      partyIdentifier: '+1-222-222-2222',
      fspId: 'fspb',
    },
    name: 'Bob Beaver',
    personalInfo: {
      complexName: {
        firstName: 'Bob',
        lastName: 'Beaver'
      },
    },
  },
  amountType: AmountType.RECEIVE,
  amount: {
    amount: '20',
    currency: Currency.USD,
  },
  transactionType: {
    scenario: 'TRANSFER',
    initiator: 'PAYER',
    intiiatorType: 'CONSUMER',
  },
  expiration: (new Date(100)).toISOString(),
}

const authorizationData: AuthorizationsPutIdRequest = {
  authenticationInfo: {
    authentication: AuthenticationType.U2F,
    authenticationValue: 'key12345',
  },
  responseType: AuthenticationResponseType.ENTERED,
}

describe('Mojaloop third-party client', () => {
  let client: Client
  let simulator: Simulator

  beforeAll(async () => {
    // Setup client and simulator
    client = new Client()

    // Use jest function for the purpose of dependency injection
    simulator = new Simulator(jest.fn() as unknown as Server, {
      host: 'mojaloop.' + config.get('hostname'),
      delay: 100,
    })
  })

  it('Should use simulator to perform party lookup when it is provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest.spyOn(simulator, 'getParties').mockImplementation()

    const type = PartyIdType.MSISDN
    const identifier = "+1-111-111-1111"
    client.getParties(PartyIdType.MSISDN, "+1-111-111-1111")

    expect(simulatorSpy).toBeCalledWith(type, identifier)
  })

  it('Should use simulator to perform transaction request when it is provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest.spyOn(simulator, 'postTransactions').mockImplementation()

    client.postTransactions(transactionRequestData)

    expect(simulatorSpy).toBeCalledWith(transactionRequestData)
  })

  it('Should use simulator to perform authorization when it is provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest.spyOn(simulator, 'putAuthorizations').mockImplementation()

    client.putAuthorizations('111', authorizationData, '222')

    expect(simulatorSpy).toBeCalledWith('111', authorizationData, '222')
  })
})
