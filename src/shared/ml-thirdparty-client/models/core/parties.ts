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
 --------------
 ******/

import { Currency } from './transactions'

/**
 * Data model for the complex type Account.
 */
export interface Account {
  /**
   * Optional Account Nickname to identify the account to the user
   */
  accountNickname?: string,


  /**
   * Address of the bank account.
   */
  id: string

  /**
   * Currency of the bank account.
   */
  currency: Currency
}

/**
 * Data model for the complex type Party.
 */
export interface Party {
  /**
   * Party Id type, id, sub ID or type, and FSP Id.
   */
  partyIdInfo: PartyIdInfo

  /**
   * Used in the context of Payee Information, where the Payee happens
   * to be a merchant accepting merchant payments.
   */
  merchantClassificationCode?: string

  /**
   * Display name of the Party, could be a real name or a nick name.
   */
  name?: string

  /**
   * Personal information used to verify identity of Party such as
   * first, middle, last name and date of birth.
   */
  personalInfo?: PartyPersonalInfo
}

/**
 * Data model for the complex type PartyComplexName.
 */
export interface PartyComplexName {
  /**
   * First name of the Party (Name Type).
   */
  firstName?: string

  /**
   * Middle name of the Party (Name Type).
   */
  middleName?: string

  /**
   * Last name of the Party (Name Type).
   */
  lastName?: string
}

/**
 * The allowed values for the enumeration of party identifier type.
 */
export enum PartyIdType {
  // TODO: Confirm other possible uses for OPAQUE and 
  //       fill out docstring
  /**
   * Type for Consent Requests
   */
  OPAQUE = 'OPAQUE',

  /**
   * An MSISDN (Mobile Station International Subscriber Directory Number,
   * that is, the phone number) is used as reference to a participant.
   * The MSISDN identifier should be in international format according to
   * the [ITU-T E.164 standard](https://www.itu.int/rec/T-REC-E.164/en).
   * Optionally, the MSISDN may be prefixed by a single plus sign,
   * indicating the international prefix.
   */
  MSISDN = 'MSISDN',

  /**
   * An email is used as reference to a participant.
   * The format of the email should be according to the informational
   * [RFC 3696](https://tools.ietf.org/html/rfc3696).
   */
  EMAIL = 'EMAIL',

  /**
   * A personal identifier is used as reference to a participant. Examples
   * of personal identification are passport number, birth certificate number,
   * and national registration number. The identifier number is added in the
   * PartyIdentifier element. The personal identifier type is added in the
   *  PartySubIdOrType element. to a participant.
   */
  PERSONAL_ID = 'PERSONAL_ID',

  /**
   * A specific Business (for example, an organization or a company) is used
   * as reference to a participant. The BUSINESS identifier can be in any format.
   * To make a transaction connected to a specific username or bill number in a
   * Business, the PartySubIdOrType element should be used.
   */
  BUSINESS = 'BUSINESS',

  /**
   * A specific device (for example, a POS or ATM) ID connected to a specific
   * business or organization is used as reference to a Party. For referencing
   * a specific device under a specific business or organization, use the
   * PartySubIdOrType element.
   */
  DEVICE = 'DEVICE',

  /**
   * A bank account number or FSP account ID should be used as reference to
   * a participant. The ACCOUNT_ID identifier can be in any format, as formats
   * can greatly differ depending on country and FSP.
   */
  ACCOUNT_ID = 'ACCOUNT_ID',

  /**
   * A bank account number or FSP account ID is used as reference to a participant.
   * The IBAN identifier can consist of up to 34 alphanumeric characters and
   * should be entered without whitespace.
   */
  IBAN = 'IBAN',

  /**
   * An alias is used as reference to a participant. The alias should be created
   * in the FSP as an alternative reference to an account owner. Another example
   * of an alias is a username in the FSP system. The ALIAS identifier can be in
   * any format. It is also possible to use the PartySubIdOrType element for
   * identifying an account under an Alias defined by the PartyIdentifier.
   */
  ALIAS = 'ALIAS',
}

/**
 * Data model for the complex type PartyIdInfo.
 */
export interface PartyIdInfo {
  /**
   * Type of the identifier.
   */
  partyIdType: PartyIdType

  /**
   * An identifier for the Party.
   */
  partyIdentifier: string

  /**
   * A sub-identifier or sub-type for the Party.
   */
  partySubIdOrType?: string

  /**
   * FSP ID.
   */
  fspId?: string
}

/**
 * Data model for the complex type PartyPersonalInfo.
 */
export interface PartyPersonalInfo {
  /**
   * First, middle and last name for the Party.
   */
  complexName?: PartyComplexName

  /**
   * Date of birth for the Party.
   */
  dateOfBirth?: string
}
