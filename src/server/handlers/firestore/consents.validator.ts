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

import { Consent } from '~/models/consent'

/**
 * Checks whether a consent document has all the necessary fields to perform
 * a party lookup.
 *
 * @param consent the object representation of a consent that is stored
 *                    on Firebase.
 */
export const isValidPartyLookup = (consent: Consent): boolean => {
  return !!(
    consent?.party?.partyIdInfo?.partyIdType &&
    consent.party.partyIdInfo.partyIdentifier &&
    consent.participantId
  )
}

/**
 * Checks whether a consent document has all the necessary fields to be
 * processed as an authenticated consent request.
 *
 * @param consent the object representation of a consent that is stored
 *                    on Firebase.
 */
export const isValidAuthentication = (consent: Consent): boolean => {
  return !!(
    consent?.party?.partyIdInfo?.fspId &&
    consent.consentRequestId &&
    consent.initiatorId &&
    consent.authChannels &&
    consent.authToken
    // TODO: if the channel is WEB, then we must also have an authtoken
    // this method of validation is rather bad
    // I mean, we are validating that data we wrote elsewhere is valid
    // why not make sure we can't write invalid data?
  )
}

/**
 * Checks whether a consent document has all the necessary fields to be
 * processed as a consent request.
 *
 * @param consent the object representation of a consent that is stored
 *                    on Firebase.
 */
export const isValidConsentRequest = (consent: Consent): boolean => {
  return !!(
    consent?.party?.partyIdInfo?.fspId &&
    consent.authChannels &&
    consent.scopes &&
    consent.initiatorId &&
    consent.consentRequestId
  )
}

/**
 * Checks whether a consent document has all the necessary fields to be
 * processed as a signed consent request.
 *
 * @param consent the object representation of a consent that is stored
 *                    on Firebase.
 */
export const isValidSignedChallenge = (consent: Consent): boolean => {
  return !!(
    consent?.party?.partyIdInfo?.fspId &&
    consent.credential &&
    consent.credential.status === 'PENDING' &&
    consent.scopes &&
    consent.consentRequestId
  )
}

/**
 * Checks whether a consent document has all the necessary fields to be
 * processed as revoke consent request or a request to generate challenge for a consent.
 *
 * @param consent the object representation of a consent that is stored
 *                    on Firebase.
 */
export const isValidGenerateChallengeOrRevokeConsent = (
  consent: Consent
): boolean => {
  return !!(consent?.party?.partyIdInfo?.fspId && consent.consentId)
}
