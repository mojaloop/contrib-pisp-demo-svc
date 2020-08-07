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

import { AuthenticationType, Money, Quote } from '../core'

export interface AuthorizationsPostRequest {
  /**
   * This value is a valid authentication type from the enumeration 
   * AuthenticationType (OTP or QR Code or U2F).
   */
  authenticationType: AuthenticationType

  /**
   * RetriesLeft is the number of retries left before the financial transaction 
   * is rejected. It must be expressed in the form of the data type Integer. 
   * retriesLeft=1 means that this is the last retry before the financial 
   * transaction is rejected.
   */
  retriesLeft: string

  /**
   * This is the transaction amount that will be withdrawn from the Payer’s account.
   */
  amount: Money

  /**
   * Common ID (decided by the Payer FSP) between the FSPs for the future transaction 
   * object. The actual transaction will be created as part of a successful transfer 
   * process.
   */
  transactionId: string

  /**
   * The transactionRequestID, received from the POST /transactionRequests service 
   * earlier in the process.
   */
  transactionRequestId: string

  /**
   * A quote object that contains more detailed information about the transaction.
   */
  quote: Quote
}
