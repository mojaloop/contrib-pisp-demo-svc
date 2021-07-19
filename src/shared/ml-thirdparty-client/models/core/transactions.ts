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
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import { ExtensionList } from './extension'

/**
 * Type of amount.
 */
export enum AmountType {
  /**
   * Amount the Payer would like to send, that is, the amount
   * that should be withdrawn from the Payer account including any fees.
   */
  SEND = 'SEND',

  /**
   * Amount the Payer would like the Payee to receive, that is, the amount
   * that should be sent to the receiver exclusive of any fees
   */
  RECEIVE = 'RECEIVE',
}

/**
 * The currency codes defined in
 * [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html)
 * as three-letter alphabetic codes are used as the standard naming
 * representation for currencies.
 *
 * The currency is temporarily trimmed to two options for prototype.
 */
export enum Currency {
  SGD = 'SGD',
  USD = 'USD',
  TZS = 'TZS',
  XXX = 'XXX'
}

/**
 * Data model for the complex type GeoCode.
 * Indicates the geographic location of a transaction initiation.
 */
export interface GeoCode {
  /**
   * Latitude of the Party.
   */
  latitude: string

  /**
   * Longitude of the Party.
   */
  longitude: string
}


/**
 * Quote of a transaction.
 */
export interface Quote {
  /**
   * The amount of money that the Payee FSP should receive.
   */
  transferAmount: tpAPI.Schemas.Money

  /**
   * The amount of Money that the Payee should receive in the end-to-end transaction.
   * In general, this value is equal to the transfer amount after being adjusted by
   * the commissions and fees that may be given by both Payer and Payee FSPs.
   *
   * Optional as the Payee FSP might not want to disclose any optional Payee fees.
   */
  payeeReceiveAmount?: tpAPI.Schemas.Money

  /**
   * Payee FSP’s part of the transaction fee.
   */
  payeeFspFee?: tpAPI.Schemas.Money

  /**
   * Transaction commission from the Payee FSP.
   */
  payeeFspComission?: tpAPI.Schemas.Money

  /**
   * Date and time until when the quotation is valid and can be honored when used
   * in the subsequent transaction.
   */
  expiration: string

  /**
   * Longitude and Latitude of the Payee. Can be used to detect fraud.
   */
  geoCode?: GeoCode

  /**
   * Information for recipient (transport layer information).
   */
  ilpPacket: string

  /**
   * Condition that must be attached to a transfer by the Payer.
   */
  condition: string

  /**
   * Optional extension, specific to deployment.
   */
  extensionList?: ExtensionList
}

/**
 * Data model for the complex type Refund.
 */
export interface Refund {
  /**
   * Reference to the original transaction ID that is requested to be refunded.
   */
  originalTransactionId: string

  /**
   * Free text indicating the reason for the refund.
   */
  refundReason?: string
}

/**
 * Type of a transaction.
 */
export interface TransactionType {
  /**
   * Deposit, withdrawal, refund, …
   */
  scenario: string

  /**
   * Possible sub-scenario, defined locally within the scheme.
   */
  subScenario?: string

  /**
   * Who is initiating the transaction - Payer or Payee.
   */
  initiator: string

  /**
   * Type of the transaction initiator - consumer, agent, business, etc.
   */
  initiatorType: string

  /**
   * Extra information specific to a refund scenario.
   * Should only be populated if scenario is REFUND.
   */
  refundInfo?: Refund

  /**
   * Balance of Payments code.
   */
  balanceOfPayments?: string
}
