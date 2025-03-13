/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")

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
 - Abhimanyu Kapur <abhi.kapur09@gmail.com>
*****/

/* istanbul ignore file */

import firebase from '~/lib/firebase'
import { logger } from '~/shared/logger'
import { Participant } from '~/shared/ml-thirdparty-client/models/core'

export interface IParticipantRepository {
  /**
   * Replace existing participants list with new list.
   *
   * @param data   Documents that are about to be added.
   */
  replace(data: Participant[]): Promise<void>
}

export class FirebaseParticipantRepository implements IParticipantRepository {
  async replace(data: Participant[]): Promise<void> {
    try {
      const collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> = firebase
        .firestore()
        .collection('participants')

      const response = await collectionRef.get()
      // Create a batch to perform all of the updates using a single request.
      // Firebase will also execute the updates atomically according to the
      // API specification.
      const batch = firebase.firestore().batch()

      const batchSize = response.size
      if (batchSize > 0) {
        // If previous participants list exists, delete it

        // Iterate through all matching documents add them to the processing batch.
        response.docs.forEach((doc) => {
          batch.delete(doc.ref)
        })
      }
      // Iterate through received participants list and add them to the processing batch.
      data.forEach((participant: Participant) => {
        batch.set(collectionRef.doc(), participant)
      })

      // Commit the updates.
      await batch.commit()
    } catch (error) {
      logger.error(error)
    }
  }
}

export const participantRepository: IParticipantRepository = new FirebaseParticipantRepository()
