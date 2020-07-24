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

import { Request, ResponseToolkit } from '@hapi/hapi'
import { Handler, Context } from 'openapi-backend'

import { logger } from '~/shared/logger'
import { PartiesTypeIDPutRequest } from '~/shared/ml-thirdparty-client/models/openapi'

import firebase from '~/lib/firebase'
import { Status } from '~/lib/firebase/models/transactions'

/**
 * Handles callback from Mojaloop that specifies detailed info about a requested party.
 * 
 * @param context   an object that contains detailed information about the incoming request.
 * @param request   original request object as defined by the hapi library.
 * @param h         original request toolkit as defined by the hapi libary.
 */
export const put: Handler = async (context: Context, request: Request, h: ResponseToolkit) => {
  // Log information about the incoming request
  logger.logRequest(context, request, h)

  // Retrieve the data that have been validated by the openapi-backend library.
  let body = context.request.body as PartiesTypeIDPutRequest
  let partyIdType = context.request.params.Type
  let partyIdentifier = context.request.params.ID

  // Find all matching documents in Firebase that are waiting for the result of
  // party lookup with the specified type and identifier. The execution of this 
  // function is expected to run asynchronously, so the server could quickly 
  // give a response to Mojaloop.
  firebase.firestore()
    .collection('transactions')
    .where("payee.partyIdInfo.partyIdType", "==", partyIdType)
    .where("payee.partyIdInfo.partyIdentifier", "==", partyIdentifier)
    .where("status", "==", Status.PENDING_PARTY_LOOKUP)
    .get()
    .then((response) => {
      // Create a batch to perform all of the updates using a single request.
      // Firebase will also execute the updates atomically according to the 
      // API specification.
      let batch = firebase.firestore().batch()

      // Iterate through all matching documents add them to the processing batch.
      response.docs.forEach((doc) => {
        batch.set(
          // Put a reference to the document.
          firebase.firestore().collection('transactions').doc(doc.id),
          // Specify the updated fields and their new values.
          {
            payee: body.party,
            status: Status.PENDING_PAYEE_CONFIRMATION,
          },
          // Merge with all the existing fields in the transaction document,
          // including the nested ones.
          { merge: true },
        )
      })

      // Commit the updates.
      batch.commit()
    }).catch((err) => {
      logger.error(err)
    })

  // Return "200 OK" as defined by the Mojaloop API for successful request.
  return h.response().code(200)
}
