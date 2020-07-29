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
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 --------------
 ******/

/**
 * Enumeration allowed for AuthenticationType.
 */
export enum AuthenticationType {
  /**
   * One-time password generated by the Payer FSP.
   */
  OTP = 'OTP',

  /**
   * QR code used as One Time Password.
   */
  QRCODE = 'QRCODE',

  /**
   * U2F challenge-response, where payer FSP verifies if the response 
   * provided by end-user device matches the previously registered key.
   */
  U2F = 'U2F',
}

export interface U2FPinValue {
  /**
   * U2F challenge-response.
   */
  pinValue: string

  /**
   * Sequential counter used for cloning detection. 
   * Present only for U2F authentication.
   */
  counter: number
}

/**
 * Contains the authentication value. The format depends on the authentication 
 * type used in the AuthenticationInfo complex type.
 * 
 * - U2FPinValue if the authentication type is U2F
 * - string if the authentication is type is QRCODE or OTP
 */
export type AuthenticationValue = U2FPinValue | string

/**
 * Data model for the complex type AuthenticationInfo.
 */
export interface AuthenticationInfo {
  /**
   * Type of authentication.
   */
  authentication: AuthenticationType

  /**
   * Authentication value.
   */
  authenticationValue: AuthenticationValue
}

export enum AuthenticationResponseType {
  /**
   * A party entered the authentication value.
   */
  ENTERED = 'ENTERED',

  /**
   * A party rejected the authentication.
   */
  REJECTED = 'REJECTED',
}
