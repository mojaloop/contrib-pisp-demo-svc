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
 - Abhimanyu Kapur <abhi.kapur09@gmail.com>
 --------------
 ******/

import { Server } from '@hapi/hapi'

import config from '~/lib/config'

import createServer from '~/server/create'
import * as consentsHandler from '~/server/handlers/firestore/consents'

import { consentRepository } from '~/repositories/consent'
import * as Validator from '~/server/handlers/firestore/consents.validator'
import { Consent, ConsentStatus } from '~/models/consent'
import {
  PartyIdType,
  Currency,
} from '~/shared/ml-thirdparty-client/models/core'
import SDKStandardComponents, {
  TAuthChannel,
  TCredentialScope,
} from '@mojaloop/sdk-standard-components'

// Mock firebase to prevent server from listening to the changes.
jest.mock('~/lib/firebase')

// Mock uuid to consistently return the provided value.
jest.mock('uuid', () => ({
  v4: jest.fn().mockImplementation(() => '12345'),
}))

// Mock utils to consistently return the provided value.
// jest.mock('~/shared/logger', () => ({
// }))

const documentId = '111'

describe('Handlers for consent documents in Firebase', () => {
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

  describe('OnCreate', () => {
    it('Should set status and consentRequestId for new consent', () => {
      const consentRepositorySpy = jest.spyOn(
        consentRepository,
        'updateConsentById'
      )

      consentsHandler.onCreate(server, {
        id: '111',
        userId: 'bob123',
        party: {
          partyIdInfo: {
            partyIdType: PartyIdType.OPAQUE,
            partyIdentifier: 'bob1234',
            fspId: 'fspb',
          },
        },
      })

      expect(consentRepositorySpy).toBeCalledWith('111', {
        consentRequestId: '12345',
        status: ConsentStatus.PENDING_PARTY_LOOKUP,
      })
    })
  })

  describe('OnUpdate', () => {
    describe('Party Lookup', () => {
      // Mocked Methods
      const mojaloopClientSpy = jest
        .spyOn(server.app.mojaloopClient, 'getParties')
        .mockImplementation()

      const validatorSpy = jest
        .spyOn(Validator, 'isValidPartyLookup')
        .mockReturnValue(true)

      // Mock consent data that would be given by Firebase
      const consentPartyLookup: Consent = {
        id: documentId,
        userId: 'bob123',
        party: {
          partyIdInfo: {
            partyIdType: PartyIdType.OPAQUE,
            partyIdentifier: 'bob1234',
          },
        },
        consentRequestId: '12345',
        status: ConsentStatus.PENDING_PARTY_LOOKUP,
      }

      it('Should perform party lookup when all necessary fields are set', async () => {
        await consentsHandler.onUpdate(server, consentPartyLookup)

        expect(validatorSpy).toBeCalledWith(consentPartyLookup)
        expect(mojaloopClientSpy).toBeCalledWith(PartyIdType.OPAQUE, 'bob1234')
      })

      it('Should throw an error if Validator returns false', async () => {
        validatorSpy.mockReturnValueOnce(false)

        const consentPartyLookup: Consent = {
          id: documentId,
          userId: 'bob123',
          party: {
            partyIdInfo: {
              partyIdType: PartyIdType.OPAQUE,
              partyIdentifier: 'bob1234',
            },
          },
          status: ConsentStatus.PENDING_PARTY_LOOKUP,
        }

        await expect(
          consentsHandler.onUpdate(server, consentPartyLookup)
        ).rejects.toThrowError('Consent Object Missing Fields')

        expect(validatorSpy).toBeCalledWith(consentPartyLookup)
        expect(mojaloopClientSpy).not.toBeCalled()
      })

      it('Should throw an error if mojaloop client throws error', async () => {
        mojaloopClientSpy.mockImplementation(() => {
          throw new Error('Client not connected')
        })

        await consentsHandler.onUpdate(server, consentPartyLookup)

        expect(validatorSpy).toBeCalledWith(consentPartyLookup)
        expect(mojaloopClientSpy).toBeCalledWith(PartyIdType.OPAQUE, 'bob1234')
        expect()
      })
    })

    describe('Authentication', () => {
      const mojaloopClientSpy = jest
        .spyOn(server.app.mojaloopClient, 'putConsentRequests')
        .mockImplementation()

      const validatorSpy = jest
        .spyOn(Validator, 'isValidAuthentication')
        .mockReturnValue(true)

      // Mock consent data that would be given by Firebase
      const consentAuthentication: Consent = {
        id: documentId,
        userId: 'bob123',
        initiatorId: 'pispa',
        party: {
          partyIdInfo: {
            partyIdType: PartyIdType.MSISDN,
            partyIdentifier: 'bob1234',
            fspId: 'fspb',
          },
        },
        scopes: [
          {
            accountId: 'as2342',
            actions: ['account.getAccess', 'account.transferMoney'],
          },
          {
            accountId: 'as22',
            actions: ['account.getAccess'],
          },
        ],
        consentRequestId: '12345',
        authChannels: ['WEB'],
        authUri: 'http//auth.com',
        authToken: '<secret>',
        accounts: [
          { id: 'bob.aaaaa.fspb', currency: Currency.SGD },
          { id: 'bob.bbbbb.fspb', currency: Currency.USD },
        ],
        status: ConsentStatus.AUTHENTICATION_REQUIRED,
      }

      // Mock the expected transaction request being sent.
      const request: SDKStandardComponents.PutConsentRequestsRequest = {
        initiatorId: consentAuthentication.initiatorId as string,
        scopes: consentAuthentication.scopes as TCredentialScope[],
        authChannels: consentAuthentication.authChannels as TAuthChannel[],
        callbackUri: config.get('mojaloop').callbackUri,
        authToken: consentAuthentication.authToken as string,
        authUri: consentAuthentication.authUri as string,
      }
      it('Should initiate consent request request when all necessary fields are set', async () => {
        await consentsHandler.onUpdate(server, consentAuthentication)

        expect(mojaloopClientSpy).toBeCalledWith(
          consentAuthentication.id,
          request,
          consentAuthentication.party?.partyIdInfo.fspId
        )
        expect(validatorSpy).toBeCalledWith(consentAuthentication)
      })

      it('Should throw an error if Validator returns false', async () => {
        validatorSpy.mockReturnValueOnce(false)

        await expect(
          consentsHandler.onUpdate(server, consentAuthentication)
        ).rejects.toThrowError('Consent Object Missing Fields')

        expect(validatorSpy).toBeCalledWith(consentAuthentication)
        expect(mojaloopClientSpy).not.toBeCalled()
      })

      it('Should log an error if mojaloop client throws error', async () => {
        mojaloopClientSpy.mockImplementation(() => {
          throw new Error('Client not connected')
        })

        await consentsHandler.onUpdate(server, consentAuthentication)

        expect(mojaloopClientSpy).toBeCalledWith(
          consentAuthentication.id,
          request,
          consentAuthentication.party?.partyIdInfo.fspId
        )
        expect(validatorSpy).toBeCalledWith(consentAuthentication)
        expect()
      })
    })

    describe('Consent Request', () => {
      const mojaloopClientSpy = jest
        .spyOn(server.app.mojaloopClient, 'postConsentRequests')
        .mockImplementation()

      const validatorSpy = jest
        .spyOn(Validator, 'isValidConsentRequest')
        .mockReturnValue(true)

      // Mock consent data that would be given by Firebase
      const consentConsentRequest: Consent = {
        id: documentId,
        userId: 'bob123',
        party: {
          partyIdInfo: {
            partyIdType: PartyIdType.OPAQUE,
            partyIdentifier: 'bob1234',
            fspId: 'fspb',
          },
        },
        scopes: [
          {
            accountId: 'as2342',
            actions: ['account.getAccess', 'account.transferMoney'],
          },
          {
            accountId: 'as22',
            actions: ['account.getAccess'],
          },
        ],
        consentRequestId: '12345',
        authChannels: ['WEB'],
        accounts: [
          { id: 'bob.aaaaa.fspb', currency: Currency.SGD },
          { id: 'bob.bbbbb.fspb', currency: Currency.USD },
        ],
        status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
      }

      // Mock the expected request being sent.
      const consentRequest: SDKStandardComponents.PostConsentRequestsRequest = {
        initiatorId: consentConsentRequest.initiatorId as string,
        id: consentConsentRequest.id,
        scopes: consentConsentRequest.scopes as TCredentialScope[],
        authChannels: consentConsentRequest.authChannels as TAuthChannel[],
        callbackUri: config.get('mojaloop').callbackUri,
      }

      it('Should initiate consent request request when all necessary fields are set', async () => {
        await consentsHandler.onUpdate(server, consentConsentRequest)

        expect(mojaloopClientSpy).toBeCalledWith(
          consentRequest,
          consentConsentRequest.party?.partyIdInfo.fspId
        )
        expect(validatorSpy).toBeCalledWith(consentConsentRequest)
      })

      it('Should throw an error if Validator returns false', async () => {
        validatorSpy.mockReturnValueOnce(false)

        await expect(
          consentsHandler.onUpdate(server, consentConsentRequest)
        ).rejects.toThrowError('Consent Object Missing Fields')

        expect(validatorSpy).toBeCalledWith(consentConsentRequest)
        expect(mojaloopClientSpy).not.toBeCalled()
      })

      it('Should log an error if mojaloop client throws error', async () => {
        mojaloopClientSpy.mockImplementation(() => {
          throw new Error('Client not connected')
        })

        await consentsHandler.onUpdate(server, consentConsentRequest)

        expect(mojaloopClientSpy).toBeCalledWith(
          consentRequest,
          consentConsentRequest.party?.partyIdInfo.fspId
        )
        expect(validatorSpy).toBeCalledWith(consentConsentRequest)
        expect()
      })
    })

    describe('Challenge Generation Request', () => {
      // Mocked Methods
      const mojaloopClientSpy = jest
        .spyOn(server.app.mojaloopClient, 'postGenerateChallengeForConsent')
        .mockImplementation()

      const validatorSpy = jest
        .spyOn(Validator, 'isValidChallengeGeneration')
        .mockReturnValue(true)

      // Mock consent data that would be given by Firebase
      const consentGenerateChallenge: Consent = {
        id: '111',
        consentId: '2323',
        party: {
          partyIdInfo: {
            partyIdType: PartyIdType.MSISDN,
            partyIdentifier: '+1-222-222-2222',
            fspId: 'fspb',
          },
        },
        status: ConsentStatus.ACTIVE,
        scopes: [
          {
            accountId: 'as2342',
            actions: ['account.getAccess', 'account.transferMoney'],
          },
          {
            accountId: 'as22',
            actions: ['account.getAccess'],
          },
        ],
        consentRequestId: '12345',
        authChannels: ['WEB'],
        accounts: [
          { id: 'bob.aaaaa.fspb', currency: Currency.SGD },
          { id: 'bob.bbbbb.fspb', currency: Currency.USD },
        ],
      }

      it('Should initiate challenge generation request when all necessary fields are set', async () => {
        await consentsHandler.onUpdate(server, consentGenerateChallenge)

        expect(validatorSpy).toBeCalledWith(consentGenerateChallenge)
        expect(mojaloopClientSpy).toBeCalledWith(
          consentGenerateChallenge.consentId,
          consentGenerateChallenge.party?.partyIdInfo.fspId
        )
      })

      it('Should throw an error if Validator returns false', async () => {
        validatorSpy.mockReturnValueOnce(false)

        await consentsHandler.onUpdate(server, consentGenerateChallenge)

        expect(validatorSpy).toBeCalledWith(consentGenerateChallenge)
        expect(mojaloopClientSpy).not.toBeCalled()
      })

      it('Should log an error if mojaloop client throws error', async () => {
        mojaloopClientSpy.mockImplementation(() => {
          throw new Error('Client not connected')
        })

        await consentsHandler.onUpdate(server, consentGenerateChallenge)

        expect(validatorSpy).toBeCalledWith(consentGenerateChallenge)
        expect(mojaloopClientSpy).toBeCalledWith(
          consentGenerateChallenge.consentId,
          consentGenerateChallenge.party?.partyIdInfo.fspId
        )
        expect()
      })
    })

    describe('Signed Challenge', () => {
      const mojaloopClientSpy = jest
        .spyOn(server.app.mojaloopClient, 'putConsentId')
        .mockImplementation()

      const validatorSpy = jest
        .spyOn(Validator, 'isValidSignedChallenge')
        .mockReturnValue(true)

      // Mock the expected transaction request being sent.
      const consentVerifiedChallenge = {
        id: '111',
        consentId: '2323',
        initiatorId: 'pispa',
        participantId: 'pispb',
        scopes: [
          {
            accountId: 'as2342',
            actions: ['account.getAccess', 'account.transferMoney'],
          },
          {
            accountId: 'as22',
            actions: ['account.getAccess'],
          },
        ],
        party: {
          partyIdInfo: {
            partyIdType: PartyIdType.MSISDN,
            partyIdentifier: '+1-222-222-2222',
            fspId: 'fspb',
          },
        },
        status: ConsentStatus.CHALLENGE_VERIFIED,
        credential: {
          id: '9876',
          credentialType: 'FIDO' as const,
          status: 'VERIFIED' as const,
          challenge: {
            payload: 'string_representing_challenge_payload',
            signature: 'string_representing_challenge_signature',
          },
          payload: 'string_representing_credential_payload',
        },
      }
      it('Should initiate PUT consent/{ID} request when challenge has been signed and all necessary fields are set', async () => {
        await consentsHandler.onUpdate(server, consentVerifiedChallenge)

        expect(validatorSpy).toBeCalledWith(consentVerifiedChallenge)
        expect(mojaloopClientSpy).toBeCalledWith(
          consentVerifiedChallenge.consentId,
          {
            requestId: consentVerifiedChallenge.id,
            initiatorId: consentVerifiedChallenge.initiatorId,
            participantId: consentVerifiedChallenge.participantId,
            scopes: consentVerifiedChallenge.scopes,
            credential: consentVerifiedChallenge.credential,
          },
          consentVerifiedChallenge.party.partyIdInfo.fspId
        )
      })

      it('Should throw an error if Validator returns false', async () => {
        await consentsHandler.onUpdate(server, consentVerifiedChallenge)

        expect(validatorSpy).toBeCalledWith(consentVerifiedChallenge)
        expect(mojaloopClientSpy).toBeCalledWith(
          consentVerifiedChallenge.consentId,
          {
            requestId: consentVerifiedChallenge.id,
            initiatorId: consentVerifiedChallenge.initiatorId,
            participantId: consentVerifiedChallenge.participantId,
            scopes: consentVerifiedChallenge.scopes,
            credential: consentVerifiedChallenge.credential,
          },
          consentVerifiedChallenge.party.partyIdInfo.fspId
        )
      })

      it('Should log an error if mojaloop client throws error', async () => {
        mojaloopClientSpy.mockImplementation(() => {
          throw new Error('Client not connected')
        })

        await consentsHandler.onUpdate(server, consentVerifiedChallenge)

        expect(validatorSpy).toBeCalledWith(consentVerifiedChallenge)
        expect(mojaloopClientSpy).toBeCalledWith(
          consentVerifiedChallenge.consentId,
          {
            requestId: consentVerifiedChallenge.id,
            initiatorId: consentVerifiedChallenge.initiatorId,
            participantId: consentVerifiedChallenge.participantId,
            scopes: consentVerifiedChallenge.scopes,
            credential: consentVerifiedChallenge.credential,
          },
          consentVerifiedChallenge.party.partyIdInfo.fspId
        )
        expect()
      })
    })

    describe('Request to Revoke Consent ', () => {
      // Mocked Methods
      const mojaloopClientSpy = jest
        .spyOn(server.app.mojaloopClient, 'postRevokeConsent')
        .mockImplementation()

      const validatorSpy = jest
        .spyOn(Validator, 'isValidRevokeConsent')
        .mockReturnValue(true)

      // Mock the expected transaction request being sent.
      const consentRevokeRequested = {
        id: '111',
        consentId: '2323',
        party: {
          partyIdInfo: {
            partyIdType: PartyIdType.MSISDN,
            partyIdentifier: '+1-222-222-2222',
            fspId: 'fspb',
          },
        },
        status: ConsentStatus.REVOKE_REQUESTED,
      }

      it('Should initiate consent revoke request when all necessary fields are set', async () => {
        await consentsHandler.onUpdate(server, consentRevokeRequested)

        expect(validatorSpy).toBeCalledWith(consentRevokeRequested)
        expect(mojaloopClientSpy).toBeCalledWith(
          consentRevokeRequested.consentId,
          consentRevokeRequested.party.partyIdInfo.fspId
        )
      })

      it('Should throw an error if Validator returns false', async () => {
        validatorSpy.mockReturnValueOnce(false)

        await consentsHandler.onUpdate(server, consentRevokeRequested)

        expect(validatorSpy).toBeCalledWith(consentRevokeRequested)
        expect(mojaloopClientSpy).toBeCalledWith(
          consentRevokeRequested.consentId,
          consentRevokeRequested.party.partyIdInfo.fspId
        )
      })

      it('Should log an error if mojaloop client throws error', async () => {
        mojaloopClientSpy.mockImplementation(() => {
          throw new Error('Client not connected')
        })
        
        await consentsHandler.onUpdate(server, consentRevokeRequested)

        expect(validatorSpy).toBeCalledWith(consentRevokeRequested)
        expect(mojaloopClientSpy).toBeCalledWith(
          consentRevokeRequested.consentId,
          consentRevokeRequested.party.partyIdInfo.fspId
        )
        expect()
      })
    })
  })
})
