import firebase from '~/lib/firebase'
import { DemoAccount } from '~/models/demoAccount'
import { logger } from '~/shared/logger'

export interface IAccountRepository {
  insert(data: DemoAccount): Promise<string>
  deleteForUser(userId: string): Promise<void>
}

export class FirebaseAccountRepository implements IAccountRepository {
  async insert(data: DemoAccount): Promise<string> {
    const ref = await firebase.firestore().collection('accounts').doc()
    // Make sure we set the id correctly
    data.id = ref.id
    await ref.set(data)
    return (data.id as unknown) as string
  }

  async deleteForUser(userId: string): Promise<void> {
    try {
      const response = await firebase.firestore()
      .collection('accounts')
      .where('userId', '==', userId)
      .get()
      
      // Create a batch to perform all of the updates using a single request.
      // Firebase will also execute the updates atomically according to the
      // API specification.
      const batch = firebase.firestore().batch()
      
      // Iterate through all matching documents add them to the processing batch.
      response.docs.forEach((doc) => {
        batch.delete(
          firebase.firestore().collection('accounts').doc(doc.id),
          )
        })
        
      // Commit the updates.
      await batch.commit()
    } catch (err) {
      logger.error(err)
    }
  }
}

export const accountRepository: IAccountRepository = new FirebaseAccountRepository()
