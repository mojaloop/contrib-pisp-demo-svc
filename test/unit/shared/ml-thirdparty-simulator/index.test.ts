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

import * as faker from 'faker'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

import config from '~/lib/config'
import { Simulator } from '~/shared/ml-thirdparty-simulator'
import {
  PartyIdType,
  Currency,
  AmountType,
  AuthenticationType,
  AuthenticationResponseType,
} from '~/shared/ml-thirdparty-client/models/core'
import {
  ThirdPartyTransactionRequest,
  AuthorizationsPutIdRequest,
} from '~/shared/ml-thirdparty-client/models/openapi'
import { PartyFactory } from '~/shared/ml-thirdparty-simulator/factories/party'
import { ConsentFactory } from '~/shared/ml-thirdparty-simulator/factories/consents'
import { AuthorizationFactory } from '~/shared/ml-thirdparty-simulator/factories/authorization'
import { TransferFactory } from '~/shared/ml-thirdparty-simulator/factories/transfer'
import { ParticipantFactory } from '~/shared/ml-thirdparty-simulator/factories/__mocks__/participant'

jest.useFakeTimers()

/**
 * Mock data for party lookup.
 */
const partyLookupParams = {
  type: PartyIdType.MSISDN,
  id: '+1-111-111-1111',
}

/**
 * Mock data for transaction request.
 */
const transactionRequestData = {
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

/*
 * Mock consent and request data
 */
const consentId = '123'

const id = '111'

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
      rawId: 'some_fido_id',
      response: {
        clientDataJSON: 'some_client_data_json',
        attestationObject: 'some_attestation_object'
      },
      type: 'public-key'
    },
  },
}

// Mock firebase to prevent server from listening to the changes.
jest.mock('~/lib/firebase')

// Mock the factories to consistently return the hardcoded values.
jest.mock('~/shared/ml-thirdparty-simulator/factories/participant')
jest.mock('~/shared/ml-thirdparty-simulator/factories/party')
jest.mock('~/shared/ml-thirdparty-simulator/factories/consents')
jest.mock('~/shared/ml-thirdparty-simulator/factories/authorization')
jest.mock('~/shared/ml-thirdparty-simulator/factories/transfer')

describe('Mojaloop third-party simulator', () => {
  let simulator: Simulator
  let server: StateServer

  beforeAll(async () => {
    server = ({
      inject: jest.fn().mockImplementation(),
    } as unknown) as StateServer

    simulator = new Simulator(server, {
      host: 'mojaloop.' + config.get('hostname'),
      delay: 100,
    })
  })

  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  it('Should inject server with the result of party lookup', async () => {
    const targetUrl =
      '/mojaloop/parties/' + partyLookupParams.type + '/' + partyLookupParams.id

    // this is a workaround to handle the delay before injecting response to the server
    Promise.resolve().then(() => jest.advanceTimersByTime(100))
    await simulator.getParties(partyLookupParams.type, partyLookupParams.id)

    // payload that is injected to the server must match the one generated by the simulator
    const payload = PartyFactory.createPutPartiesRequest(
      partyLookupParams.type,
      partyLookupParams.id
    )

    expect(server.inject).toBeCalledTimes(1)
    expect(server.inject).toBeCalledWith({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: 'mojaloop.' + config.get('hostname'),
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  })

  it('Should inject server with the authorization prompt', async () => {
    const targetUrl = '/mojaloop/authorizations'
    const payerInfo = PartyFactory.createPutPartiesRequest(
      PartyIdType.MSISDN,
      '+1-222-222-2222'
    )
    const payeeInfo = PartyFactory.createPutPartiesRequest(
      PartyIdType.MSISDN,
      '+1-111-111-1111'
    )
    const request: ThirdPartyTransactionRequest = {
      payer: payerInfo.party,
      payee: payeeInfo.party,
      ...transactionRequestData,
    }

    // this is a workaround to handle the delay before injecting response to the server
    Promise.resolve().then(() => jest.advanceTimersByTime(100))
    await simulator.postTransactions(request)

    const payload = AuthorizationFactory.createPostAuthorizationsRequest(
      request
    )

    expect(server.inject).toBeCalledTimes(1)
    expect(server.inject).toBeCalledWith({
      method: 'POST',
      url: targetUrl,
      headers: {
        host: 'mojaloop.' + config.get('hostname'),
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  })

  // TODO - LD tech debt
  it.skip('Should inject server with the transfer result', async () => {
    const transactionRequestId = '111'
    const transactionId = '222'
    const transferId = '78910'

    const randomUuidSpy = jest
      .spyOn(faker.random, 'uuid')
      .mockImplementation(() => transferId)
    const targetUrl = '/transfers/' + transferId

    const request: AuthorizationsPutIdRequest = {
      authenticationInfo: {
        authentication: AuthenticationType.U2F,
        authenticationValue: 'abcdefg',
      },
      responseType: AuthenticationResponseType.ENTERED,
    }

    // this is a workaround to handle the delay before injecting response to the server
    Promise.resolve().then(() => jest.advanceTimersByTime(100))
    await simulator.putAuthorizations(
      transactionRequestId,
      // TODO: fix me!
      // @ts-ignore
      request,
      transactionId
    )

    const payload = TransferFactory.createTransferIdPutRequest(
      transactionRequestId,
      request,
      transactionId
    )

    expect(randomUuidSpy).toHaveBeenCalledTimes(1)
    expect(server.inject).toHaveBeenCalledTimes(1)
    expect(server.inject).toHaveBeenCalledWith({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: 'mojaloop.' + config.get('hostname'),
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  })

  it('Should inject server with the result of participant lookup', async () => {
    const targetUrl = '/participants'

    // this is a workaround to handle the delay before injecting response to the server
    Promise.resolve().then(() => jest.advanceTimersByTime(100))
    await simulator.getParticipants()

    // payload that is injected to the server must match the one generated by the simulator
    const payload = ParticipantFactory.getParticipants()

    expect(server.inject).toBeCalledTimes(1)
    expect(server.inject).toBeCalledWith({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: 'mojaloop.' + config.get('hostname'),
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  })

  it.skip('Should inject server with result of requesting a new consent', async () => {
    const targetUrl = '/mojaloop/consentRequests/' + id

    // this is a workaround to handle the delay before injecting response to the server
    Promise.resolve().then(() => jest.advanceTimersByTime(100))
    await simulator.postConsentRequests(postConsentRequestPayload)

    const payload = ConsentFactory.createPutConsentRequestIdRequest(
      postConsentRequestPayload
    )

    expect(server.inject).toBeCalledTimes(1)
    expect(server.inject).toBeCalledWith({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: 'mojaloop.' + config.get('hostname'),
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  })

  it('Should inject server with a granted consent', async () => {
    const targetUrl = '/mojaloop/consents'

    // this is a workaround to handle the delay before injecting response to the server
    Promise.resolve().then(() => jest.advanceTimersByTime(100))
    await simulator.patchConsentRequests(
      consentRequestId,
      patchConsentRequestPayload,
      'dfspa'
    )

    const payload = ConsentFactory.createPostConsentRequest(
      consentRequestId,
    )

    expect(server.inject).toBeCalledTimes(1)
    expect(server.inject).toBeCalledWith({
      method: 'POST',
      url: targetUrl,
      headers: {
        host: 'mojaloop.' + config.get('hostname'),
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  })

  it('Should inject server with an updated consent', async () => {
    const targetUrl = `/mojaloop/consents/${consentId}`

    // this is a workaround to handle the delay before injecting response to the server
    Promise.resolve().then(() => jest.advanceTimersByTime(100))
    await simulator.putConsentId(consentId, putConsentPayload)

    const payload = ConsentFactory.createPutConsentIdValidationRequest(
      putConsentPayload
    )

    expect(server.inject).toBeCalledTimes(1)
    expect(server.inject).toBeCalledWith({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: 'mojaloop.' + config.get('hostname'),
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  })

  it('Should inject server with patch from revoking consent', async () => {
    const targetUrl = '/consents/' + consentId

    // this is a workaround to handle the delay before injecting response to the server
    Promise.resolve().then(() => jest.advanceTimersByTime(100))
    await simulator.postRevokeConsent(consentId)

    const payload = ConsentFactory.createPatchConsentRevokeRequest()

    expect(server.inject).toBeCalledTimes(1)
    expect(server.inject).toBeCalledWith({
      method: 'PATCH',
      url: targetUrl,
      headers: {
        host: 'mojaloop.' + config.get('hostname'),
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  })
})
