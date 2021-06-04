/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import SDKStandardComponents from '@mojaloop/sdk-standard-components'
import { logger } from '~/shared/logger'
import { MissingConsentFieldsError, InvalidConsentStatusError } from '~/models/errors'

// Mock firebase to prevent server from listening to the changes.
jest.mock('~/lib/firebase')

// Mock uuid to consistently return the provided value.
jest.mock('uuid', () => ({
  v4: jest.fn().mockImplementation(() => '12345'),
}))

// Mock logger to prevent handlers from logging incoming request
jest.mock('~/shared/logger', () => ({
  logger: {
    error: jest.fn().mockImplementation(),
  },
}))

const documentId = '111'

// TODO - LD Skipped for demo purposes
describe.skip('Handlers for consent documents in Firebase', () => {
  let server: StateServer
  // let loggerErrorSpy: jest.SpyInstance

  beforeAll(async () => {
    server = await createServer(config)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // loggerErrorSpy = jest.spyOn(logger, 'error')
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('OnCreate', () => {
    // Set spies
    const consentRepositorySpy = jest.spyOn(
      consentRepository,
      'updateConsentById'
    )

    it('Should log an error and return, if status field exists', async () => {
      const consentWithStatus = {
        id: '111',
        consentId: 'acv',
        userId: 'bob123',
        status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
      }

      await consentsHandler.onCreate(server, consentWithStatus)

      expect(consentRepositorySpy).not.toBeCalled()
    })

    it('Should set status and consentRequestId for new consent', () => {
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
    it('Should log an error and return, if status field is missing', async () => {
      const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation()
      const consentNoStatus = {
        id: '111',
        consentId: 'acv',
        userId: 'bob123',
      }

      await consentsHandler.onUpdate(server, consentNoStatus)

      expect(loggerErrorSpy).toBeCalledWith(
        'Invalid consent, undefined status.'
      )
    })

    it('Should throw a InvalidConsentStatusErrro, if status field does not match any ConsentStatus enum', async () => {
      const consentInvalidStatus = {
        id: '111',
        status: 'invalid' as ConsentStatus,
        consentId: 'acv',
        userId: 'bob123',
      }

      expect(
        consentsHandler.onUpdate(server, consentInvalidStatus)
      ).rejects.toThrow(
        new InvalidConsentStatusError(
          consentInvalidStatus.status,
          consentInvalidStatus.id
        )
      )
    })

    describe('Party Lookup', () => {
      // Mocked Methods
      let mojaloopClientSpy: jest.SpyInstance

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

      beforeAll(() => {
        mojaloopClientSpy = jest
          .spyOn(server.app.mojaloopClient, 'getParties')
          .mockImplementation()
      })

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
        ).rejects.toThrow(new MissingConsentFieldsError(consentPartyLookup))

        expect(validatorSpy).toBeCalledWith(consentPartyLookup)
        expect(mojaloopClientSpy).not.toBeCalled()
      })

      it('Should log an error if mojaloop client throws error', async () => {
        const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation()
        mojaloopClientSpy.mockImplementationOnce(() => {
          throw Error('Client not connected')
        })

        await consentsHandler.onUpdate(server, consentPartyLookup)

        expect(validatorSpy).toBeCalledWith(consentPartyLookup)
        expect(mojaloopClientSpy).toBeCalledWith(PartyIdType.OPAQUE, 'bob1234')
        expect(loggerErrorSpy).toBeCalledWith(new Error('Client not connected'))
      })
    })

    // TODO - LD Tech debt...
    describe.skip('Authentication', () => {
      let mojaloopClientSpy: jest.SpyInstance

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
        initiatorId: consentAuthentication.initiatorId!,
        scopes: consentAuthentication.scopes!,
        authChannels: consentAuthentication.authChannels!,
        callbackUri: config.get('mojaloop').pispCallbackUri,
        authToken: consentAuthentication.authToken!,
        authUri: consentAuthentication.authUri!,
      }

      // TODO: LD Tech debt
      // beforeAll(() => {
      //   mojaloopClientSpy = jest
      //     .spyOn(server.app.mojaloopClient, 'putConsentRequests')
      //     .mockImplementation()
      // })

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
        ).rejects.toThrow(new MissingConsentFieldsError(consentAuthentication))

        expect(validatorSpy).toBeCalledWith(consentAuthentication)
        expect(mojaloopClientSpy).not.toBeCalled()
      })

      it('Should log an error if mojaloop client throws error', async () => {
        const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation()
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
        expect(loggerErrorSpy).toBeCalledWith(new Error('Client not connected'))
      })
    })

    describe('Consent Request', () => {
      let mojaloopClientSpy: jest.SpyInstance

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
        initiatorId: consentConsentRequest.initiatorId!,
        id: consentConsentRequest.id,
        scopes: consentConsentRequest.scopes!,
        authChannels: consentConsentRequest.authChannels!,
        callbackUri: config.get('mojaloop').pispCallbackUri,
      }

      beforeAll(() => {
        mojaloopClientSpy = jest
          .spyOn(server.app.mojaloopClient, 'postConsentRequests')
          .mockImplementation()
      })

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
        ).rejects.toThrow(new MissingConsentFieldsError(consentConsentRequest))

        expect(validatorSpy).toBeCalledWith(consentConsentRequest)
        expect(mojaloopClientSpy).not.toBeCalled()
      })

      it('Should log an error if mojaloop client throws error', async () => {
        const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation()
        mojaloopClientSpy.mockImplementation(() => {
          throw new Error('Client not connected')
        })

        await consentsHandler.onUpdate(server, consentConsentRequest)

        expect(mojaloopClientSpy).toBeCalledWith(
          consentRequest,
          consentConsentRequest.party?.partyIdInfo.fspId
        )
        expect(validatorSpy).toBeCalledWith(consentConsentRequest)
        expect(loggerErrorSpy).toBeCalledWith(new Error('Client not connected'))
      })
    })

    describe.skip('Challenge Generation Request', () => {
      // Mocked Methods
      let mojaloopClientSpy: jest.SpyInstance

      const validatorSpy = jest
        .spyOn(Validator, 'isValidGenerateChallengeOrRevokeConsent')
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
        status: ConsentStatus.CONSENT_GRANTED,
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

       // TODO: LD Tech debt
      // beforeAll(() => {
      //   mojaloopClientSpy = jest
      //     .spyOn(server.app.mojaloopClient, 'postGenerateChallengeForConsent')
      //     .mockImplementation()
      // })

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

        await expect(
          consentsHandler.onUpdate(server, consentGenerateChallenge)
        ).rejects.toThrow(
          new MissingConsentFieldsError(consentGenerateChallenge)
        )

        expect(validatorSpy).toBeCalledWith(consentGenerateChallenge)
        expect(mojaloopClientSpy).not.toBeCalled()
      })

      it('Should log an error if mojaloop client throws error', async () => {
        const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation()
        mojaloopClientSpy.mockImplementation(() => {
          throw new Error('Client not connected')
        })

        await consentsHandler.onUpdate(server, consentGenerateChallenge)

        expect(validatorSpy).toBeCalledWith(consentGenerateChallenge)
        expect(mojaloopClientSpy).toBeCalledWith(
          consentGenerateChallenge.consentId,
          consentGenerateChallenge.party?.partyIdInfo.fspId
        )
        expect(loggerErrorSpy).toBeCalledWith(new Error('Client not connected'))
      })
    })

    describe('Signed Challenge', () => {
      let mojaloopClientSpy: jest.SpyInstance

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
        status: ConsentStatus.ACTIVE,
        credential: {
          credentialType: 'FIDO' as const,
          status: 'VERIFIED' as const,
          payload: {
            id: 'ooX6LjPwYU0rFhDa8VgoWXrLvOfbyVBBs1_EcpvXZ0wqJBbXQYCNQx-rFrL2Hk2YEEY_AHnVeQ7nSv6wDr_e-A',
            rawId: Uint8Array.from([162, 133, 250, 46, 51, 240, 97, 77, 43, 22, 16, 218, 241, 88, 40, 89, 122, 203, 188, 231, 219, 201, 80, 65, 179, 95, 196, 114, 155, 215, 103, 76, 42, 36, 22, 215, 65, 128, 141, 67, 31, 171, 22, 178, 246, 30, 77, 152, 16, 70, 63, 0, 121, 213, 121, 14, 231, 74, 254, 176, 14, 191, 222, 248]),
            response: {
              attestationObject: Uint8Array.from([163, 99, 102, 109, 116, 102, 112, 97, 99, 107, 101, 100, 103, 97, 116, 116, 83, 116, 109, 116, 163, 99, 97, 108, 103, 38, 99, 115, 105, 103, 88, 71, 48, 69, 2, 33, 0, 193, 203, 134, 57, 180, 61, 102, 242, 245, 96, 27, 140, 83, 17, 241, 180, 171, 44, 138, 234, 70, 43, 192, 117, 40, 54, 165, 185, 51, 87, 30, 31, 2, 32, 114, 220, 38, 119, 123, 4, 98, 8, 48, 249, 135, 170, 189, 210, 162, 95, 62, 85, 71, 238, 126, 241, 143, 121, 82, 118, 193, 125, 72, 183, 35, 134, 99, 120, 53, 99, 129, 89, 2, 193, 48, 130, 2, 189, 48, 130, 1, 165, 160, 3, 2, 1, 2, 2, 4, 11, 5, 205, 83, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 11, 5, 0, 48, 46, 49, 44, 48, 42, 6, 3, 85, 4, 3, 19, 35, 89, 117, 98, 105, 99, 111, 32, 85, 50, 70, 32, 82, 111, 111, 116, 32, 67, 65, 32, 83, 101, 114, 105, 97, 108, 32, 52, 53, 55, 50, 48, 48, 54, 51, 49, 48, 32, 23, 13, 49, 52, 48, 56, 48, 49, 48, 48, 48, 48, 48, 48, 90, 24, 15, 50, 48, 53, 48, 48, 57, 48, 52, 48, 48, 48, 48, 48, 48, 90, 48, 110, 49, 11, 48, 9, 6, 3, 85, 4, 6, 19, 2, 83, 69, 49, 18, 48, 16, 6, 3, 85, 4, 10, 12, 9, 89, 117, 98, 105, 99, 111, 32, 65, 66, 49, 34, 48, 32, 6, 3, 85, 4, 11, 12, 25, 65, 117, 116, 104, 101, 110, 116, 105, 99, 97, 116, 111, 114, 32, 65, 116, 116, 101, 115, 116, 97, 116, 105, 111, 110, 49, 39, 48, 37, 6, 3, 85, 4, 3, 12, 30, 89, 117, 98, 105, 99, 111, 32, 85, 50, 70, 32, 69, 69, 32, 83, 101, 114, 105, 97, 108, 32, 49, 56, 52, 57, 50, 57, 54, 49, 57, 48, 89, 48, 19, 6, 7, 42, 134, 72, 206, 61, 2, 1, 6, 8, 42, 134, 72, 206, 61, 3, 1, 7, 3, 66, 0, 4, 33, 26, 111, 177, 181, 137, 37, 203, 10, 193, 24, 95, 124, 42, 227, 168, 180, 136, 16, 20, 121, 177, 30, 255, 245, 85, 224, 125, 151, 81, 189, 43, 23, 106, 37, 45, 238, 89, 236, 227, 133, 153, 32, 91, 179, 234, 40, 191, 143, 215, 252, 125, 167, 92, 5, 66, 114, 174, 72, 88, 229, 145, 252, 90, 163, 108, 48, 106, 48, 34, 6, 9, 43, 6, 1, 4, 1, 130, 196, 10, 2, 4, 21, 49, 46, 51, 46, 54, 46, 49, 46, 52, 46, 49, 46, 52, 49, 52, 56, 50, 46, 49, 46, 49, 48, 19, 6, 11, 43, 6, 1, 4, 1, 130, 229, 28, 2, 1, 1, 4, 4, 3, 2, 4, 48, 48, 33, 6, 11, 43, 6, 1, 4, 1, 130, 229, 28, 1, 1, 4, 4, 18, 4, 16, 20, 154, 32, 33, 142, 246, 65, 51, 150, 184, 129, 248, 213, 183, 241, 245, 48, 12, 6, 3, 85, 29, 19, 1, 1, 255, 4, 2, 48, 0, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 11, 5, 0, 3, 130, 1, 1, 0, 62, 254, 163, 223, 61, 42, 224, 114, 87, 143, 126, 4, 208, 221, 90, 75, 104, 219, 1, 175, 232, 99, 46, 24, 180, 224, 184, 115, 67, 24, 145, 25, 108, 24, 75, 235, 193, 213, 51, 162, 61, 119, 139, 177, 4, 8, 193, 185, 170, 65, 78, 117, 118, 133, 91, 9, 54, 151, 24, 179, 72, 175, 92, 239, 108, 176, 48, 134, 114, 214, 31, 184, 189, 155, 134, 161, 10, 166, 130, 206, 140, 45, 78, 240, 144, 237, 80, 84, 24, 254, 83, 212, 206, 30, 98, 122, 40, 243, 114, 3, 9, 88, 208, 143, 250, 89, 27, 196, 24, 128, 225, 142, 138, 12, 237, 26, 133, 128, 127, 144, 150, 113, 65, 122, 11, 69, 50, 21, 179, 141, 193, 71, 42, 36, 73, 118, 64, 180, 232, 107, 254, 196, 241, 84, 99, 155, 133, 184, 232, 128, 20, 150, 54, 36, 56, 53, 89, 1, 43, 252, 135, 124, 11, 68, 236, 125, 167, 148, 210, 6, 84, 178, 154, 220, 29, 186, 92, 80, 123, 240, 202, 109, 243, 82, 188, 205, 222, 116, 13, 46, 167, 225, 8, 36, 162, 206, 57, 79, 144, 77, 29, 153, 65, 94, 58, 124, 69, 181, 254, 40, 122, 155, 203, 220, 105, 142, 139, 220, 213, 180, 121, 138, 92, 237, 53, 222, 138, 53, 9, 2, 10, 20, 183, 38, 191, 191, 57, 167, 68, 7, 156, 185, 143, 91, 157, 202, 9, 183, 195, 235, 188, 189, 162, 175, 105, 3, 104, 97, 117, 116, 104, 68, 97, 116, 97, 88, 196, 73, 150, 13, 229, 136, 14, 140, 104, 116, 52, 23, 15, 100, 118, 96, 91, 143, 228, 174, 185, 162, 134, 50, 199, 153, 92, 243, 186, 131, 29, 151, 99, 65, 0, 0, 0, 4, 20, 154, 32, 33, 142, 246, 65, 51, 150, 184, 129, 248, 213, 183, 241, 245, 0, 64, 162, 133, 250, 46, 51, 240, 97, 77, 43, 22, 16, 218, 241, 88, 40, 89, 122, 203, 188, 231, 219, 201, 80, 65, 179, 95, 196, 114, 155, 215, 103, 76, 42, 36, 22, 215, 65, 128, 141, 67, 31, 171, 22, 178, 246, 30, 77, 152, 16, 70, 63, 0, 121, 213, 121, 14, 231, 74, 254, 176, 14, 191, 222, 248, 165, 1, 2, 3, 38, 32, 1, 33, 88, 32, 36, 35, 188, 28, 126, 126, 236, 185, 97, 7, 15, 131, 125, 3, 8, 216, 52, 120, 168, 14, 38, 85, 242, 133, 251, 63, 89, 88, 108, 249, 99, 31, 34, 88, 32, 119, 199, 72, 241, 178, 48, 8, 123, 128, 222, 104, 239, 126, 242, 17, 80, 21, 182, 40, 161, 95, 22, 185, 131, 241, 34, 200, 175, 64, 55, 15, 232]),
              clientDataJSON: Uint8Array.from([123, 34, 116, 121, 112, 101, 34, 58, 34, 119, 101, 98, 97, 117, 116, 104, 110, 46, 99, 114, 101, 97, 116, 101, 34, 44, 34, 99, 104, 97, 108, 108, 101, 110, 103, 101, 34, 58, 34, 78, 65, 66, 109, 65, 71, 85, 65, 77, 65, 66, 109, 65, 68, 77, 65, 89, 81, 66, 106, 65, 68, 81, 65, 89, 81, 66, 107, 65, 68, 107, 65, 79, 65, 65, 49, 65, 68, 89, 65, 79, 81, 65, 53, 65, 71, 81, 65, 79, 65, 65, 122, 65, 71, 77, 65, 89, 119, 66, 105, 65, 68, 89, 65, 77, 103, 65, 53, 65, 68, 77, 65, 89, 119, 65, 48, 65, 68, 107, 65, 77, 65, 65, 48, 65, 71, 73, 65, 77, 119, 66, 106, 65, 68, 85, 65, 77, 103, 65, 53, 65, 68, 99, 65, 79, 65, 66, 106, 65, 68, 73, 65, 89, 103, 65, 53, 65, 71, 81, 65, 77, 119, 65, 122, 65, 68, 77, 65, 77, 65, 66, 107, 65, 71, 85, 65, 90, 81, 65, 52, 65, 71, 73, 65, 77, 81, 65, 52, 65, 71, 81, 65, 89, 119, 65, 121, 65, 68, 107, 65, 78, 65, 66, 107, 65, 68, 103, 65, 89, 81, 65, 34, 44, 34, 111, 114, 105, 103, 105, 110, 34, 58, 34, 104, 116, 116, 112, 58, 47, 47, 108, 111, 99, 97, 108, 104, 111, 115, 116, 58, 53, 48, 48, 48, 34, 44, 34, 99, 114, 111, 115, 115, 79, 114, 105, 103, 105, 110, 34, 58, 102, 97, 108, 115, 101, 125]),
            }
          }
        }
      }

      beforeAll(() => {
        mojaloopClientSpy = jest
          .spyOn(server.app.mojaloopClient, 'putConsentId')
          .mockImplementation()
      })

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
        validatorSpy.mockReturnValueOnce(false)

        await expect(
          consentsHandler.onUpdate(server, consentVerifiedChallenge)
        ).rejects.toThrow(
          new MissingConsentFieldsError(consentVerifiedChallenge)
        )

        expect(validatorSpy).toBeCalledWith(consentVerifiedChallenge)
        expect(mojaloopClientSpy).not.toBeCalled()
      })

      it('Should log an error if mojaloop client throws error', async () => {
        const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation()
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
        expect(loggerErrorSpy).toBeCalledWith(new Error('Client not connected'))
      })
    })

    describe.skip('Request to Revoke Consent ', () => {
      // Mocked Methods
      let mojaloopClientSpy: jest.SpyInstance

      const validatorSpy = jest
        .spyOn(Validator, 'isValidGenerateChallengeOrRevokeConsent')
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
       // TODO: LD Tech debt
      // beforeAll(() => {
      //   mojaloopClientSpy = jest
      //     .spyOn(server.app.mojaloopClient, 'postRevokeConsent')
      //     .mockImplementation()
      // })

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

        await expect(
          consentsHandler.onUpdate(server, consentRevokeRequested)
        ).rejects.toThrow(new MissingConsentFieldsError(consentRevokeRequested))

        expect(validatorSpy).toBeCalledWith(consentRevokeRequested)
        expect(mojaloopClientSpy).not.toBeCalled()
      })

      it('Should log an error if mojaloop client throws error', async () => {
        const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation()
        mojaloopClientSpy.mockImplementation(() => {
          throw new Error('Client not connected')
        })

        await consentsHandler.onUpdate(server, consentRevokeRequested)

        expect(validatorSpy).toBeCalledWith(consentRevokeRequested)
        expect(mojaloopClientSpy).toBeCalledWith(
          consentRevokeRequested.consentId,
          consentRevokeRequested.party.partyIdInfo.fspId
        )
        expect(loggerErrorSpy).toBeCalledWith(new Error('Client not connected'))
      })
    })
  })
})
