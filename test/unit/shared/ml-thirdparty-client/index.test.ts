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

import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

import Client from '~/shared/ml-thirdparty-client'
import {
  AmountType,
  Currency,
  PartyIdType,
} from '~/shared/ml-thirdparty-client/models/core'
import {
  ThirdPartyTransactionRequest,
} from '~/shared/ml-thirdparty-client/models/openapi'
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

const authorizationData: tpAPI.Schemas.ThirdpartyRequestsTransactionsIDAuthorizationsPutResponse = {
  challenge: 'some_challenge_base_64_string',
  value: 'some_value_base_64_string',
  consentId: '0000-0000-0000-0001',
  sourceAccountId: 'dfspa.alice.1234',
  status: 'VERIFIED'
}

const consentId = '123'

const destParticipantId = 'dfspA'

const consentRequestId = 'ab123'

const scopes: Array<tpAPI.Schemas.Scope> = [
  {
    accountId: 'as2342',
    actions: ['accounts.getBalance', 'accounts.transfer'],
  },
  {
    accountId: 'as22',
    actions: ['accounts.getBalance'],
  },
]

const postConsentRequestPayload: tpAPI.Schemas.ConsentRequestsPostRequest = {
  consentRequestId: '111',
  userId: 'user@example.com',
  authChannels: ['WEB', 'OTP'],
  scopes,
  callbackUri: config.get('mojaloop').pispCallbackUri,
}

const patchConsentRequestPayload: tpAPI.Schemas.ConsentRequestsIDPatchRequest = {
  authToken: 'secret-token',
}

const putConsentPayload: tpAPI.Schemas.ConsentsIDPutResponseSigned = {
  scopes,
  credential: {
    credentialType: 'FIDO',
    status: 'PENDING',
    payload: {
      id: 'some_fido_id',
      response: {
        clientDataJSON: 'some_client_data_json'
      }
    },
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

    // Arrange
    const putAuthorizationSpy = jest
      .spyOn(
        client.thirdpartyRequests,
        'putThirdpartyRequestsTransactionsAuthorizations'
      )
      .mockImplementation()

    // Act
    client.putAuthorizations('111', authorizationData, '222')

    // Assert
    expect(putAuthorizationSpy).toBeCalledWith(authorizationData, '111', '222')
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
    client.postConsentRequests(postConsentRequestPayload, destParticipantId)

    // Assert
    expect(postConsentRequestsSpy).toBeCalledWith(
      postConsentRequestPayload,
      destParticipantId
    )
  })

  it('Should perform a patch request for authenticated consent', (): void => {
    // Arrange
    const patchConsentRequestsSpy = jest
      .spyOn(client.thirdpartyRequests, 'patchConsentRequests')
      .mockImplementation()

    // Act
    client.patchConsentRequests(
      consentRequestId,
      patchConsentRequestPayload,
      destParticipantId
    )

    // Assert
    expect(patchConsentRequestsSpy).toBeCalledWith(
      consentRequestId,
      patchConsentRequestPayload,
      destParticipantId
    )
  })

  it('Should perform a put request for registered consent credential,', (): void => {
    // Arrange
    const putConsentIdSpy = jest
      .spyOn(client.thirdpartyRequests, 'putConsents')
      .mockImplementation()

    // Act
    client.putConsentId(consentId, putConsentPayload, destParticipantId)

    // Assert
    expect(putConsentIdSpy).toBeCalledWith(
      consentId,
      putConsentPayload,
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
