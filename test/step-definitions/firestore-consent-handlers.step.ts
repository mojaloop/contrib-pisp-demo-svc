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
import Config from '~/lib/config'
import PispDemoServer from '~/server'
import { onCreate, onUpdate } from '~/server/handlers/firestore/consents'
import * as validator from '~/server/handlers/firestore/consents.validator'
import { logger } from '~/shared/logger'
import { PartyIdType } from '~/shared/ml-thirdparty-client/models/core'
import { consentRepository } from '~/repositories/consent'
import { Consent, ConsentStatus } from '~/models/consent'

// Mock firebase to prevent opening the connection
jest.mock('~/lib/firebase')

// Mock Mojaloop calls
const mockGetParties = jest.fn()
const mockPutConsentRequests = jest.fn()
const mockPostConsentRequests = jest.fn()
const mockPostGenerateChallengeForConsent = jest.fn()
const mockPutConsentId = jest.fn()
const mockPostRevokeConsent = jest.fn()
jest.mock('~/shared/ml-thirdparty-client', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getParties: mockGetParties,
      putConsentRequests: mockPutConsentRequests,
      postConsentRequests: mockPostConsentRequests,
      postGenerateChallengeForConsent: mockPostGenerateChallengeForConsent,
      putConsentId: mockPutConsentId,
      postRevokeConsent: mockPostRevokeConsent,
    }
  })
})

// Mock validator functions
const mockIsValidPartyLookup = jest.spyOn(validator, 'isValidPartyLookup')
const mockIsValidAuthentication = jest.spyOn(validator, 'isValidAuthentication')
const mockIsValidConsentRequest = jest.spyOn(validator, 'isValidConsentRequest')
const mockIsValidSignedChallenge = jest.spyOn(
  validator,
  'isValidSignedChallenge'
)
const mockIsValidGenerateChallengeOrRevokeConsent = jest.spyOn(
  validator,
  'isValidGenerateChallengeOrRevokeConsent'
)

// Mock consent repo functions
const mockUpdateConsentById = jest.spyOn(consentRepository, 'updateConsentById')
mockUpdateConsentById.mockResolvedValue()

// Mock logger
const mockLoggerError = jest.spyOn(logger, 'error')
mockLoggerError.mockReturnValue()

const featurePath = path.join(
  __dirname,
  '../features/firestore-consent-handlers.feature'
)
const feature = loadFeature(featurePath)

defineFeature(feature, (test): void => {
  let server: StateServer
  let consent: Consent

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

  const whenTheConsentUpdatedHasXStatus = (when: DefineStepFunction) => {
    when(
      /^the Consent that has been updated has (.*) status$/,
      async (status: string): Promise<void> => {
        if (status === 'undefined') {
          consent = {
            id: '1234',
          }
        } else {
          consent = {
            id: '1234',
            consentId: '1234',
            consentRequestId: 'consent_request_id',
            participantId: 'sfsfdf23',
            initiatorId: 'pispa',
            status: status as ConsentStatus,
            party: {
              partyIdInfo: {
                partyIdType: PartyIdType.MSISDN,
                partyIdentifier: 'party_id',
                fspId: 'dfsp_a',
              },
            },
            scopes: [
              {
                accountId: '3423',
                actions: ['acc.getMoney', 'acc.sendMoney'],
              },
              {
                accountId: '232345',
                actions: ['acc.accessSaving'],
              },
            ],
            authUri: 'auth_uri',
            authChannels: ['OTP', 'WEB'],
            authToken: '123456',
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
        }
        await onUpdate(server, consent)
      }
    )
  }
  test('Create Consent With Existing Status', ({ given, when, then }): void => {
    givenThePispDemoServer(given)

    when(
      'I create a Consent with an existing status',
      async (): Promise<void> => {
        consent = {
          id: '1234',
          status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
        }
        await onCreate(server, consent)
      }
    )

    then('the server should do nothing', (): void => {
      expect(mockUpdateConsentById).not.toBeCalled()
    })
  })

  test('Create New Consent', ({ given, when, then }): void => {
    givenThePispDemoServer(given)

    when(
      'a new Consent is created',
      async (): Promise<void> => {
        consent = {
          id: '1234',
        }
        await onCreate(server, consent)
      }
    )

    then(
      'the server should assign a consentRequestId and a new status in the consent repository',
      (): void => {
        expect(mockUpdateConsentById).toBeCalledTimes(1)
        expect(mockUpdateConsentById).toBeCalledWith(consent.id, {
          consentRequestId: expect.any(String),
          status: ConsentStatus.PENDING_PARTY_LOOKUP,
        })
      }
    )
  })
  test('Update Consent With <Status> Status', ({ given, when, then }): void => {
    givenThePispDemoServer(given)

    whenTheConsentUpdatedHasXStatus(when)

    then(/^the server should (.*) on Mojaloop$/, (action: string): void => {
      switch (action) {
        case 'log an error': {
          expect(mockLoggerError).toBeCalledTimes(1)
          expect(mockLoggerError).toBeCalledWith(
            'Invalid consent, undefined status.'
          )
          break
        }
        case 'initiate party lookup': {
          expect(mockIsValidPartyLookup).toBeCalledTimes(1)
          expect(mockIsValidPartyLookup).toBeCalledWith(consent)
          expect(mockGetParties).toBeCalledTimes(1)
          expect(mockGetParties).toBeCalledWith(
            consent.party!.partyIdInfo.partyIdType,
            consent.party!.partyIdInfo.partyIdentifier
          )
          break
        }
        case 'initiate consent request': {
          expect(mockIsValidConsentRequest).toBeCalledTimes(1)
          expect(mockIsValidConsentRequest).toBeCalledWith(consent)
          expect(mockPostConsentRequests).toBeCalledTimes(1)
          expect(mockPostConsentRequests).toBeCalledWith(
            {
              initiatorId: consent.initiatorId!,
              scopes: consent.scopes!,
              authChannels: consent.authChannels!,
              id: consent.id,
              callbackUri: expect.any(String),
            },
            consent.party!.partyIdInfo.fspId!
          )
          break
        }
        case 'initiate authentication': {
          expect(mockIsValidAuthentication).toBeCalledTimes(1)
          expect(mockIsValidAuthentication).toBeCalledWith(consent)
          expect(mockPutConsentRequests).toBeCalledTimes(1)
          expect(mockPutConsentRequests).toBeCalledWith(
            consent.id,
            {
              initiatorId: consent.initiatorId!,
              authChannels: consent.authChannels!,
              scopes: consent.scopes!,
              authUri: consent.authUri!,
              callbackUri: expect.any(String),
              authToken: consent.authToken!,
            },
            consent.party!.partyIdInfo.fspId!
          )
          break
        }
        case 'initiate challenge generation': {
          expect(mockIsValidGenerateChallengeOrRevokeConsent).toBeCalledTimes(1)
          expect(mockIsValidGenerateChallengeOrRevokeConsent).toBeCalledWith(
            consent
          )
          expect(mockPostGenerateChallengeForConsent).toBeCalledTimes(1)
          expect(mockPostGenerateChallengeForConsent).toBeCalledWith(
            consent.consentId!,
            consent.party!.partyIdInfo.fspId!
          )
          break
        }
        case 'handle signed challenge': {
          expect(mockIsValidSignedChallenge).toBeCalledTimes(1)
          expect(mockIsValidSignedChallenge).toBeCalledWith(consent)
          expect(mockPutConsentId).toBeCalledTimes(1)
          expect(mockPutConsentId).toBeCalledWith(
            consent.consentId!,
            {
              requestId: consent.id,
              initiatorId: consent.initiatorId!,
              participantId: consent.participantId!,
              scopes: consent.scopes!,
              credential: consent.credential!,
            },
            consent.party!.partyIdInfo.fspId!
          )
          break
        }
        case 'initiate revocation for consent': {
          expect(mockIsValidGenerateChallengeOrRevokeConsent).toBeCalledTimes(1)
          expect(mockIsValidGenerateChallengeOrRevokeConsent).toBeCalledWith(
            consent
          )
          expect(mockPostRevokeConsent).toBeCalledTimes(1)
          expect(mockPostRevokeConsent).toBeCalledWith(
            consent.consentId!,
            consent.party!.partyIdInfo.fspId!
          )
          break
        }
      }
    })
  })
})
