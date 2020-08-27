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
 - Abhimanyu Kapur <abhi.kapur09@gmail.com>
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
import SDKStandardComponents from '@mojaloop/sdk-standard-components'

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
        lastName: 'Beaver',
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
    initiatorType: 'CONSUMER',
  },
  expiration: new Date(100).toISOString(),
}

const authorizationData: AuthorizationsPutIdRequest = {
  authenticationInfo: {
    authentication: AuthenticationType.U2F,
    authenticationValue: 'key12345',
  },
  responseType: AuthenticationResponseType.ENTERED,
}

const consentId = '123'

const destParticipantId = 'dfspA'

const consentRequestId = 'ab123'

const scopes = [
  {
    accountId: 'as2342',
    actions: ['account.getAccess', 'account.transferMoney'],
  },
  {
    accountId: 'as22',
    actions: ['account.getAccess'],
  },
]

const postConsentRequestRequest: SDKStandardComponents.PostConsentRequestsRequest = {
  id: '111',
  initiatorId: 'pispA',
  authChannels: ['WEB', 'OTP'],
  scopes,
  callbackUri: 'https://pisp.com',
}

const putConsentRequestRequest: SDKStandardComponents.PutConsentRequestsRequest = {
  id: '111',
  initiatorId: 'pispA',
  authChannels: ['WEB', 'OTP'],
  scopes,
  callbackUri: 'https://pisp.com',
  authorizationUri: 'https://dfspAuth.com',
  authToken: 'secret-token',
}

const putConsentRequest: SDKStandardComponents.PutConsentsRequest = {
  requestId: '88',
  initiatorId: 'pispA',
  participantId: 'participant',
  scopes,
  credential: {
    id: '9876',
    credentialType: 'FIDO',
    status: 'PENDING',
    challenge: {
      payload: 'string_representing_challenge_payload',
      signature: 'string_representing_challenge_signature',
    },
    payload: 'string_representing_credential_payload',
  },
}

describe('Mojaloop third-party client', () => {
  let client: Client
  let simulator: Simulator

  beforeAll(async () => {
    // Setup client and simulator
    client = new Client({
      participantId: 'pisp',
      endpoints: {
        default: 'api.mojaloop.io',
      },
    })

    // Use jest function for the purpose of dependency injection
    simulator = new Simulator((jest.fn() as unknown) as Server, {
      host: 'mojaloop.' + config.get('hostname'),
      delay: 100,
    })
  })

  it('Should use simulator to perform party lookup when simulator provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest
      .spyOn(simulator, 'getParties')
      .mockImplementation()

    const type = PartyIdType.MSISDN
    const identifier = '+1-111-111-1111'
    client.getParties(PartyIdType.MSISDN, '+1-111-111-1111')

    expect(simulatorSpy).toBeCalledWith(type, identifier)
  })

  it('Should use simulator to perform transaction request when simulator provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest
      .spyOn(simulator, 'postTransactions')
      .mockImplementation()

    client.postTransactions(transactionRequestData)

    expect(simulatorSpy).toBeCalledWith(transactionRequestData)
  })

  it('Should use simulator to perform authorization when simulator provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest
      .spyOn(simulator, 'putAuthorizations')
      .mockImplementation()

    client.putAuthorizations('111', authorizationData, '222')

    expect(simulatorSpy).toBeCalledWith('111', authorizationData, '222')
  })

  it('Should use simulator to perform participant lookup when simulator provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest
      .spyOn(simulator, 'getParticipants')
      .mockImplementation()

    client.getParticipants()

    expect(simulatorSpy).toBeCalledWith()
  })

  it('Should use simulator to perform request for new consent when simulator provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest
      .spyOn(simulator, 'postConsentRequests')
      .mockImplementation()

    client.postConsentRequests(postConsentRequestRequest, destParticipantId)

    expect(simulatorSpy).toBeCalledWith(
      postConsentRequestRequest,
      destParticipantId
    )
  })

  it('Should use simulator to perform a put request for authenticated consent when simulator provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest
      .spyOn(simulator, 'putConsentRequests')
      .mockImplementation()

    client.putConsentRequests(
      consentRequestId,
      putConsentRequestRequest,
      destParticipantId
    )

    expect(simulatorSpy).toBeCalledWith(
      consentRequestId,
      putConsentRequestRequest,
      destParticipantId
    )
  })

  it('Should use simulator to perform a request to generate a challenge for consent, when simulator provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest
      .spyOn(simulator, 'postGenerateChallengeForConsent')
      .mockImplementation()

    client.postGenerateChallengeForConsent(consentId)

    expect(simulatorSpy).toBeCalledWith(consentId)
  })

  it('Should use simulator to perform a put request for validated consent credential, when simulator provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest
      .spyOn(simulator, 'putConsentId')
      .mockImplementation()

    client.putConsentId(consentId, putConsentRequest, destParticipantId)

    expect(simulatorSpy).toBeCalledWith(
      consentId,
      putConsentRequest,
      destParticipantId
    )
  })

  it('Should use simulator to perform a put request for authenticated consent, when simulator provided', (): void => {
    client.simulator = simulator
    const simulatorSpy = jest
      .spyOn(simulator, 'postRevokeConsent')
      .mockImplementation()

    client.postRevokeConsent(consentId)

    expect(simulatorSpy).toBeCalledWith(consentId)
  })
})
