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
 - Name Surname <name.surname@gatesfoundation.com>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 --------------
 ******/

/* eslint-disable @typescript-eslint/no-explicit-any */

import firebase from '~/lib/firebase'
import { Consent } from '~/models/consent'
import { logger } from '~/shared/logger'

export interface IConsentRepository {
  /**
   * Retrieves a consent document based on its consent ID.
   *
   * @param id    Consent ID of the document that needs to be retrieved.
   */
  getByConsentId(id: string): Promise<Consent>
}

export class FirebaseConsentRepository implements IConsentRepository {
  async getByConsentId(id: string): Promise<Consent> {
    return new Promise((resolve, reject) => {
      firebase
        .firestore()
        .collection('consents')
        .where('consentId', '==', id)
        .get()
        .then((response) => {
          if (response.empty) {
            return reject(new Error('Consent not found'))
          } else {
            return resolve(response.docs[0].data() as Consent)
          }
        })
        .catch((err) => {
          logger.error(err)
        })
    })
  }
}

export const consentRepository: IConsentRepository = new FirebaseConsentRepository()
