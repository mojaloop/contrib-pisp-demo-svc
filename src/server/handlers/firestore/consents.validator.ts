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
  if (
    consent?.party?.partyIdInfo &&
    consent.party.partyIdInfo.partyIdType &&
    consent.party.partyIdInfo.partyIdentifier
  ) {
    return true
  }
  return false
}

/**
 * Checks whether a consent document has all the necessary fields to be
 * processed as a consent request.
 *
 * @param consent the object representation of a consent that is stored
 *                    on Firebase.
 */
export const isValidAuthentication = (consent: Consent): boolean => {
  if (
    consent.consentRequestId &&
    consent.consentId &&
    consent.party &&
    consent.initiatorId &&
    consent.authChannels &&
    consent.authToken
  ) {
    return true
  }
  return false
}

/**
 * Checks whether a consent document has all the necessary fields to be
 * processed as a consent authorization.
 *
 * @param consent the object representation of a consent that is stored
 *                    on Firebase.
 */
export const isValidConsentRequest = (consent: Consent): boolean => {
  if (
    consent.authChannels &&
    consent.scopes &&
    consent.initiatorId &&
    consent.party
  ) {
    return true
  }
  return false
}

/**
 * Checks whether a consent document has all the necessary fields to be
 * processed as a consent authorization.
 *
 * @param consent the object representation of a consent that is stored
 *                    on Firebase.
 */
export const isValidChallengeGeneration = (consent: Consent): boolean => {
  if (consent.consentId && consent.party) {
    return true
  }
  return false
}

/**
 * Checks whether a consent document has all the necessary fields to be
 * processed as a consent authorization.
 *
 * @param consent the object representation of a consent that is stored
 *                    on Firebase.
 */
export const isValidSignedChallenge = (consent: Consent): boolean => {
  if (
    consent.credential &&
    consent.party &&
    consent.scopes &&
    consent.initiatorId
  ) {
    return true
  }
  return false
}
