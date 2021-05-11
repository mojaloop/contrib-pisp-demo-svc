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

import Client from '~/shared/ml-thirdparty-client'

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
import config from '~/lib/config'
import { NotImplementedError } from '~/shared/errors'

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
  initiatorId: 'pispA',
  authChannels: ['WEB', 'OTP'],
  scopes,
  callbackUri: config.get('mojaloop').pispCallbackUri,
  authUri: 'https://dfspAuth.com',
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

  beforeAll(async () => {
    // Setup client
    client = new Client({
      participantId: 'pisp',
      endpoints: {
        fspiop: 'api.mojaloop.io',
        thirdparty: 'api.mojaloop.io',
      },
    })
  })

  it('Should perform party lookup', (): void => {
    // Arrange
    const getPartiesSpy = jest
      .spyOn(client.mojaloopRequests, 'getParties')
      .mockImplementation()
    const type = PartyIdType.MSISDN
    const identifier = '+1-111-111-1111'

    // Act
    client.getParties(PartyIdType.MSISDN, '+1-111-111-1111')

    // Assert
    expect(getPartiesSpy).toBeCalledWith(type, identifier)
  })

  it('Should perform transaction request', (): void => {
    // Arrange
    const postTransactionsSpy = jest
      .spyOn(client.thirdpartyRequests, 'postThirdpartyRequestsTransactions')
      .mockImplementation()

    // Act
    client.postTransactions(transactionRequestData, destParticipantId)

    // Assert
    expect(postTransactionsSpy).toBeCalledWith(
      transactionRequestData,
      destParticipantId
    )
  })

  it('Should throw Not Implemented error, attempting to perform transaction authorization request', (): void => {
    expect(
      // TD - bad types here...
      // @ts-ignore
      client.putAuthorizations('111', authorizationData, '222')
    ).rejects.toThrow(new NotImplementedError())

    // // Arrange
    // const putAuthorizationSpy = jest
    //   .spyOn(
    //     client.thirdpartyRequests,
    //     'putThirdpartyRequestsTransactionsAuthorizations'
    //   )
    //   .mockImplementation()

    // // Act
    // client.putAuthorizations('111', authorizationData, '222')

    // // Assert
    // expect(putAuthorizationSpy).toBeCalledWith('111', authorizationData, '222')
  })

  it('Should throw Not Implemented error, attempting to perform participant lookup', (): void => {
    expect(client.getParticipants()).rejects.toThrow(new NotImplementedError())

    // TODO: Use this test once implemented
    // // Arrange
    // const getParticipantsSpy = jest
    //   .spyOn(client.thirdpartyRequests, 'getParticipants')
    //   .mockImplementation()

    // // Act
    // client.getParticipants()

    // // Assert
    // expect(getParticipantsSpy).toBeCalledWith()
  })

  it('Should perform request for new consent', (): void => {
    // Arrange
    const postConsentRequestsSpy = jest
      .spyOn(client.thirdpartyRequests, 'postConsentRequests')
      .mockImplementation()

    // Act
    client.postConsentRequests(postConsentRequestRequest, destParticipantId)

    // Assert
    expect(postConsentRequestsSpy).toBeCalledWith(
      postConsentRequestRequest,
      destParticipantId
    )
  })

  it('Should perform a put request for authenticated consent', (): void => {
    // Arrange
    const putConsentRequestsSpy = jest
      .spyOn(client.thirdpartyRequests, 'putConsentRequests')
      .mockImplementation()

    // Act
    client.putConsentRequests(
      consentRequestId,
      putConsentRequestRequest,
      destParticipantId
    )

    // Assert
    expect(putConsentRequestsSpy).toBeCalledWith(
      consentRequestId,
      putConsentRequestRequest,
      destParticipantId
    )
  })

  it('Should throw Not Implemented error, attempting to perform a request to generate a challenge for consent,', (): void => {
    expect(
      client.postGenerateChallengeForConsent(consentId)
    ).rejects.toThrow(new NotImplementedError())

    // TODO: Use this test once implemented
    // // Arrange
    // const GenerateChallengeSpy = jest
    //   .spyOn(client.thirdpartyRequests, 'generateChallenge')
    //   .mockImplementation()

    // // Act
    // client.postGenerateChallengeForConsent(consentId)

    // // Assert
    // expect(GenerateChallengeSpy).toBeCalledWith(consentId)
  })

  it('Should perform a put request for registered consent credential,', (): void => {
    // Arrange
    const putConsentIdSpy = jest
      .spyOn(client.thirdpartyRequests, 'putConsents')
      .mockImplementation()

    // Act
    client.putConsentId(consentId, putConsentRequest, destParticipantId)

    // Assert
    expect(putConsentIdSpy).toBeCalledWith(
      consentId,
      putConsentRequest,
      destParticipantId
    )
  })

  it('Should throw Not Implemented error, attempting to perform a post request to revoke a given consent,', (): void => {
    expect(
      client.postRevokeConsent(consentId, destParticipantId)
    ).rejects.toThrow(new NotImplementedError())

    // TODO: Use this test once implemented
    // // Arrange
    // const postRevokeConsentSpy = jest
    //   .spyOn(client.thirdpartyRequests, 'postRevokeConsent')
    //   .mockImplementation()

    // // Act
    // client.postRevokeConsent(consentId)

    // // Assert
    // expect(postRevokeConsentSpy).toBeCalledWith(consentId)
  })
})
