import mocksdk from '~/lib/firebase/__mocks__'
import { transactionRepository } from '~/repositories/transaction'
import { Status } from '~/models/transaction'

jest.mock('~/lib/firebase', () => {
  return mocksdk
})

mocksdk.firestore().autoFlush()

const collectionRef = mocksdk.firestore().collection('transactions')

collectionRef
  .doc('234')
  .set({ transactionId: '1', status: Status.PENDING_PARTY_LOOKUP })

collectionRef.add({
  transactionId: '2',
  status: Status.PENDING_PARTY_LOOKUP,
  amount: {
    amount: '5000',
    currency: 'USD',
  },
})

collectionRef.add({
  transactionId: '3',
  status: Status.PENDING_PARTY_LOOKUP,
  amount: {
    amount: '5000',
    currency: 'USD',
  },
})
// data is logged

it('should UpdateById and return void promise  ', () => {
  expect(
    transactionRepository.updateById('234', {
      transactionId: '231212',
    })
  ).resolves.toBeUndefined()

  expect(
    mocksdk.firestore().collection('transactions').doc('234').get()
  ).resolves.toEqual({
    transactionId: '231212',
    status: Status.PENDING_PARTY_LOOKUP,
  })
})

it('should update by given set of conditions and return void promise  ', () => {
  const conditions = {
    status: Status.PENDING_PARTY_LOOKUP,
    amount: {
      amount: '5000',
      currency: 'USD',
    },
  }

  expect(
    transactionRepository.update(conditions, {
      status: Status.SUCCESS,
    })
  ).resolves.toBeUndefined()

  expect(
    mocksdk.firestore().collection('transactions').get()
  ).resolves.toStrictEqual([
    {
      transactionId: '3',
      status: Status.SUCCESS,
      amount: {
        amount: '5000',
        currency: 'USD',
      },
    },
    {
      transactionId: '3',
      status: Status.SUCCESS,
      amount: {
        amount: '5000',
        currency: 'USD',
      },
    },
  ])
})
