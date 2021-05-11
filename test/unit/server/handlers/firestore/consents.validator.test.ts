/* eslint-disable @typescript-eslint/ban-ts-comment */
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

import * as Validator from '~/server/handlers/firestore/consents.validator'
import { ConsentStatus } from '~/models/consent'
import {
  PartyIdType,
  Currency,
} from '~/shared/ml-thirdparty-client/models/core'
import SDKStandardComponents from '@mojaloop/sdk-standard-components'

const id = '111'
const consentId = 'abc123'
const userId = 'bob123'
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
const party = {
  partyIdInfo: {
    partyIdType: PartyIdType.OPAQUE,
    partyIdentifier: 'bob1234',
  },
}
const partyWithFSPId = {
  partyIdInfo: {
    partyIdType: PartyIdType.MSISDN,
    partyIdentifier: '+1-222-222-2222',
    fspId: 'fspb',
  },
}
const consentRequestId = '12345'
const authChannels: SDKStandardComponents.TAuthChannel[] = ['WEB']
const accounts = [
  { id: 'bob.aaaaa.fspb', currency: Currency.SGD },
  { id: 'bob.bbbbb.fspb', currency: Currency.USD },
]
const initiatorId = 'pispa'
const authUri = 'http//auth.com'
const authToken = '<secret>'
const participantId = 'pispb'
const credential = {
  id: '9876',
  credentialType: 'FIDO' as const,
  status: 'VERIFIED' as const,
  challenge: {
    payload: 'string_representing_challenge_payload',
    signature: 'string_representing_challenge_signature',
  },
  payload: 'string_representing_credential_payload',
}

describe('Validators for different consents used in requests', () => {
  describe('isValidPartyLookup', () => {
    it.skip('Should return true if all necessary fields are present', () => {
      expect(
        Validator.isValidPartyLookup({
          id,
          userId,
          party,
          status: ConsentStatus.PENDING_PARTY_LOOKUP,
        })
      ).toBe(true)
    })

    it('Should return false if party, partyIdInfo, partyIdType and/or partyIdentifier is not present', () => {
      expect(
        Validator.isValidPartyLookup({
          id,
          userId,
          status: ConsentStatus.PENDING_PARTY_LOOKUP,
        })
      ).toBe(false)

      expect(
        Validator.isValidPartyLookup({
          id,
          userId,
          // @ts-ignore
          party: {},
          status: ConsentStatus.PENDING_PARTY_LOOKUP,
        })
      ).toBe(false)

      expect(
        Validator.isValidPartyLookup({
          id,
          userId,
          party: {
            // @ts-ignore
            partyIdInfo: {},
          },
          status: ConsentStatus.PENDING_PARTY_LOOKUP,
        })
      ).toBe(false)

      expect(
        Validator.isValidPartyLookup({
          id,
          userId,
          party: {
            // @ts-ignore
            partyIdInfo: {
              partyIdentifier: 'bob1234',
            },
          },
          status: ConsentStatus.PENDING_PARTY_LOOKUP,
        })
      ).toBe(false)

      expect(
        Validator.isValidPartyLookup({
          id,
          userId,
          party: {
            // @ts-ignore
            partyIdInfo: {
              partyIdType: PartyIdType.OPAQUE,
            },
          },
          status: ConsentStatus.PENDING_PARTY_LOOKUP,
        })
      ).toBe(false)
    })
  })

  describe('isValidConsentRequest', () => {
    it('Should return true if all necessary fields are present', () => {
      expect(
        Validator.isValidConsentRequest({
          id,
          userId,
          initiatorId,
          party: partyWithFSPId,
          scopes,
          authUri,
          consentRequestId,
          authChannels,
          accounts,
          status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
        })
      ).toBe(true)
    })

    it('Should return false if party or partyIdInfo or fspId is not present', () => {
      expect(
        Validator.isValidConsentRequest({
          id,
          initiatorId,
          authUri,
          userId,
          party,
          scopes,
          consentRequestId,
          authChannels,
          accounts,
          status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
        })
      ).toBe(false)

      expect(
        Validator.isValidConsentRequest({
          id,
          initiatorId,
          userId,
          scopes,
          authUri,
          consentRequestId,
          authChannels,
          accounts,
          // @ts-ignore
          party: {},
          status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
        })
      ).toBe(false)

      expect(
        Validator.isValidConsentRequest({
          id,
          userId,
          initiatorId,
          scopes,
          authUri,
          consentRequestId,
          authChannels,
          accounts,
          party: {
            // @ts-ignore
            partyIdInfo: {},
          },
          status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
        })
      ).toBe(false)
    })

    it('Should return false if authChannels is not present', () => {
      expect(
        Validator.isValidConsentRequest({
          id,
          initiatorId,
          userId,
          authUri,
          party: partyWithFSPId,
          scopes,
          consentRequestId,
          accounts,
          status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
        })
      ).toBe(false)
    })

    it('Should return false if scopes are not present', () => {
      expect(
        Validator.isValidConsentRequest({
          id,
          userId,
          authUri,
          initiatorId,
          party: partyWithFSPId,
          authChannels,
          consentRequestId,
          accounts,
          status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
        })
      ).toBe(false)
    })

    it('Should return false if initiator ID is not present', () => {
      expect(
        Validator.isValidConsentRequest({
          id,
          userId,
          authUri,
          scopes,
          party: partyWithFSPId,
          authChannels,
          consentRequestId,
          accounts,
          status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
        })
      ).toBe(false)
    })

    it('Should return false if authURI is not present', () => {
      expect(
        Validator.isValidConsentRequest({
          id,
          userId,
          scopes,
          party: partyWithFSPId,
          authChannels,
          consentRequestId,
          accounts,
          status: ConsentStatus.PENDING_PARTY_CONFIRMATION,
        })
      ).toBe(false)
    })
  })

  describe('isValidAuthentication', () => {
    it('Should return true if all necessary fields are present', () => {
      expect(
        Validator.isValidAuthentication({
          id,
          userId,
          consentId,
          initiatorId,
          party: partyWithFSPId,
          scopes,
          authToken,
          consentRequestId,
          authChannels,
          accounts,
          status: ConsentStatus.AUTHENTICATION_REQUIRED,
        })
      ).toBe(true)
    })

    it('Should return false if party or partyIdInfo or fspId is not present', () => {
      expect(
        Validator.isValidAuthentication({
          id,
          initiatorId,
          authUri,
          consentId,
          authToken,
          userId,
          party,
          scopes,
          consentRequestId,
          authChannels,
          accounts,
          status: ConsentStatus.AUTHENTICATION_REQUIRED,
        })
      ).toBe(false)

      expect(
        Validator.isValidAuthentication({
          id,
          initiatorId,
          userId,
          scopes,
          authUri,
          consentRequestId,
          authChannels,
          accounts,
          // @ts-ignore
          party: {},
          status: ConsentStatus.AUTHENTICATION_REQUIRED,
        })
      ).toBe(false)

      expect(
        Validator.isValidConsentRequest({
          id,
          userId,
          initiatorId,
          scopes,
          consentId,
          authToken,
          authUri,
          consentRequestId,
          authChannels,
          accounts,
          party: {
            // @ts-ignore
            partyIdInfo: {},
          },
          status: ConsentStatus.AUTHENTICATION_REQUIRED,
        })
      ).toBe(false)
    })

    it('Should return false if authChannels is not present', () => {
      expect(
        Validator.isValidAuthentication({
          id,
          initiatorId,
          userId,
          consentId,
          authToken,
          party: partyWithFSPId,
          scopes,
          consentRequestId,
          accounts,
          status: ConsentStatus.AUTHENTICATION_REQUIRED,
        })
      ).toBe(false)
    })

    it('Should return false if auth token are not present', () => {
      expect(
        Validator.isValidAuthentication({
          id,
          userId,
          authUri,
          consentId,
          initiatorId,
          party: partyWithFSPId,
          authChannels,
          consentRequestId,
          accounts,
          status: ConsentStatus.AUTHENTICATION_REQUIRED,
        })
      ).toBe(false)
    })

    // TODO - LD disabled for demo
    it.skip('Should return false if consent ID is not present', () => {
      expect(
        Validator.isValidAuthentication({
          id,
          userId,
          scopes,
          authToken,
          initiatorId,
          party: partyWithFSPId,
          authChannels,
          consentRequestId,
          accounts,
          status: ConsentStatus.AUTHENTICATION_REQUIRED,
        })
      ).toBe(false)
    })

    it('Should return false if initiator ID is not present', () => {
      expect(
        Validator.isValidAuthentication({
          id,
          userId,
          scopes,
          authToken,
          consentId,
          party: partyWithFSPId,
          authChannels,
          consentRequestId,
          accounts,
          status: ConsentStatus.AUTHENTICATION_REQUIRED,
        })
      ).toBe(false)
    })
  })

  describe('isValidChallengeGeneration', () => {
    it('Should return true if all necessary fields are present', () => {
      expect(
        Validator.isValidGenerateChallengeOrRevokeConsent({
          id,
          consentId,
          party: partyWithFSPId,
          status: ConsentStatus.CONSENT_GRANTED,
          scopes,
          consentRequestId,
          authChannels,
          accounts,
        })
      ).toBe(true)
    })

    it('Should return false if party or partyIdInfo or fspId is not present', () => {
      expect(
        Validator.isValidGenerateChallengeOrRevokeConsent({
          id,
          initiatorId,
          consentId,
          userId,
          party,
          scopes,
          consentRequestId,
          authChannels,
          accounts,
          status: ConsentStatus.CONSENT_GRANTED,
        })
      ).toBe(false)

      expect(
        Validator.isValidGenerateChallengeOrRevokeConsent({
          id,
          initiatorId,
          consentId,
          userId,
          scopes,
          consentRequestId,
          authChannels,
          accounts,
          // @ts-ignore
          party: {},
          status: ConsentStatus.CONSENT_GRANTED,
        })
      ).toBe(false)

      expect(
        Validator.isValidGenerateChallengeOrRevokeConsent({
          id,
          userId,
          initiatorId,
          scopes,
          consentId,
          consentRequestId,
          authChannels,
          accounts,
          party: {
            // @ts-ignore
            partyIdInfo: {},
          },
          status: ConsentStatus.CONSENT_GRANTED,
        })
      ).toBe(false)
    })

    it('Should return false if consent ID is not present', () => {
      expect(
        Validator.isValidGenerateChallengeOrRevokeConsent({
          id,
          userId,
          initiatorId,
          party: partyWithFSPId,
          status: ConsentStatus.CONSENT_GRANTED,
        })
      ).toBe(false)
    })
  })

  describe('isValidSignedChallenge', () => {
    // TODO - LD skipped for demo purposes
    it.skip('Should return true if all necessary fields are present', () => {
      expect(
        Validator.isValidSignedChallenge({
          id,
          consentId,
          initiatorId,
          party: partyWithFSPId,
          scopes,
          participantId,
          credential,
          status: ConsentStatus.CHALLENGE_GENERATED,
        })
      ).toBe(true)
    })

    it('Should return false if party or partyIdInfo or fspId is not present', () => {
      expect(
        Validator.isValidSignedChallenge({
          id,
          initiatorId,
          authUri,
          consentId,
          credential,
          participantId,
          authToken,
          userId,
          party,
          scopes,
          consentRequestId,
          status: ConsentStatus.CHALLENGE_GENERATED,
        })
      ).toBe(false)

      expect(
        Validator.isValidSignedChallenge({
          id,
          initiatorId,
          userId,
          scopes,
          credential,
          participantId,
          consentRequestId,
          authChannels,
          accounts,
          // @ts-ignore
          party: {},
          status: ConsentStatus.CHALLENGE_GENERATED,
        })
      ).toBe(false)

      expect(
        Validator.isValidSignedChallenge({
          id,
          userId,
          initiatorId,
          scopes,
          consentId,
          credential,
          participantId,
          consentRequestId,
          authChannels,
          accounts,
          party: {
            // @ts-ignore
            partyIdInfo: {},
          },
          status: ConsentStatus.CHALLENGE_GENERATED,
        })
      ).toBe(false)
    })

    it('Should return false if credential is not present', () => {
      expect(
        Validator.isValidSignedChallenge({
          id,
          initiatorId,
          userId,
          consentId,
          participantId,
          party: partyWithFSPId,
          scopes,
          consentRequestId,
          accounts,
          status: ConsentStatus.CHALLENGE_GENERATED,
        })
      ).toBe(false)
    })

    it('Should return false if initiator ID is not present', () => {
      expect(
        Validator.isValidSignedChallenge({
          id,
          userId,
          authUri,
          scopes,
          party: partyWithFSPId,
          authChannels,
          consentRequestId,
          accounts,
          status: ConsentStatus.CHALLENGE_GENERATED,
        })
      ).toBe(false)
    })

    it('Should return false if participant ID is not present', () => {
      expect(
        Validator.isValidAuthentication({
          id,
          userId,
          scopes,
          authToken,
          credential,
          initiatorId,
          party: partyWithFSPId,
          consentRequestId,
          status: ConsentStatus.AUTHENTICATION_REQUIRED,
        })
      ).toBe(false)
    })
  })

  describe('isValidRevokeConsent', () => {
    it('Should return true if all necessary fields are present', () => {
      expect(
        Validator.isValidGenerateChallengeOrRevokeConsent({
          id,
          userId,
          consentId,
          initiatorId,
          party: partyWithFSPId,
          status: ConsentStatus.REVOKE_REQUESTED,
        })
      ).toBe(true)
    })

    it('Should return false if party or partyIdInfo or fspId is not present', () => {
      expect(
        Validator.isValidGenerateChallengeOrRevokeConsent({
          id,
          initiatorId,
          consentId,
          userId,
          party,
          scopes,
          consentRequestId,
          authChannels,
          accounts,
          status: ConsentStatus.REVOKE_REQUESTED,
        })
      ).toBe(false)

      expect(
        Validator.isValidGenerateChallengeOrRevokeConsent({
          id,
          initiatorId,
          consentId,
          userId,
          scopes,
          consentRequestId,
          authChannels,
          accounts,
          // @ts-ignore
          party: {},
          status: ConsentStatus.REVOKE_REQUESTED,
        })
      ).toBe(false)

      expect(
        Validator.isValidConsentRequest({
          id,
          userId,
          initiatorId,
          scopes,
          consentId,
          consentRequestId,
          authChannels,
          accounts,
          party: {
            // @ts-ignore
            partyIdInfo: {},
          },
          status: ConsentStatus.REVOKE_REQUESTED,
        })
      ).toBe(false)
    })

    it('Should return false if consent ID is not present', () => {
      expect(
        Validator.isValidGenerateChallengeOrRevokeConsent({
          id,
          userId,
          initiatorId,
          party: partyWithFSPId,
          status: ConsentStatus.REVOKE_REQUESTED,
        })
      ).toBe(false)
    })
  })
})
