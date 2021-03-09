import firebase from '~/lib/firebase'
import { DemoAccount } from '~/models/demoAccount'

export interface IAccountRepository {
  insert(data: DemoAccount): Promise<string>
}

export class FirebaseAccountRepository implements IAccountRepository {
  // TD: Lewis hacky to get some tests working
  async insert(data: DemoAccount): Promise<string> {
    const ref = await firebase.firestore().collection('accounts').doc()
    // Make sure we set the id correctly
    data.id = ref.id
    await ref.set(data)
    return (data.id as unknown) as string
  }
}
export const accountRepository: IAccountRepository = new FirebaseAccountRepository()
