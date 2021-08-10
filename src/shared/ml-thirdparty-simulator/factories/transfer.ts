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

import * as faker from 'faker'

import {
  AuthorizationsPutIdRequest,
  TransferIDPutRequest,
} from '~/shared/ml-thirdparty-client/models/openapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'


import { TransferState } from '~/shared/ml-thirdparty-client/models/core'

export class TransferFactory {
  /**
   * Creates a `PUT /transfers/{ID}` request body that is normally sent
   * by Mojaloop as a callback to inform about the transfer result.
   *
   * @param _               transaction request id of the corresponsing authorization.
   * @param __              an authorization object as defined by the Mojaloop API.
   * @param transactionId   transaction id to be associated with the transfer object.
   */
  public static createTransferIdPutRequest(
    _: string,
    __: AuthorizationsPutIdRequest,
    transactionId: string
  ): TransferIDPutRequest {
    return {
      transactionId,
      fulfilment: faker.random.alphaNumeric(43),
      completedTimestamp: faker.date.recent().toISOString(),
      transferState: TransferState.COMMITTED,
    }
  }

  /**
   * Creates a `PATCH /thirdpartyRequests/transactions/{ID}` request body that is normally sent
   * by Mojaloop as a callback to inform about the transfer result.
   *
   * @param _               transaction request id of the corresponsing authorization.
   * @param __              an authorization object as defined by the Mojaloop API.
   * @param transactionId   transaction id to be associated with the transfer object.
   */
  public static createTransactionRequestPatchRequest(
    transactionId: string
  ): tpAPI.Schemas.ThirdpartyRequestsTransactionsIDPatchResponse {
    return {
      transactionId,
      transactionRequestState: 'ACCEPTED',
      transactionState: 'COMPLETED'
    }
  }
}
