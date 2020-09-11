// import { Status } from '~/models/transaction'
import { transactionRepository } from '~/repositories/transaction'

describe('party lookup', () => {
  it('starts the transaction and does a party lookup', async () => {
    // Arrange
    const transaction = {
      payee: {
        partyIdInfo: {
          partyIdType: 'MSISDN',
          partyIdentifier: 'IN1231231255'
        }
      },
      // Lewis user - taken from firebase
      userId: 'VQLEyvz9zYVucLbjJMErpwSFCVD2',
    }

    // Act
    const transactionId = await transactionRepository.insert(transaction)
    console.log('created new doc with id', transactionId)
    console.log(`make sure to set this: export TRANSACTION_ID=${transactionId}`)

    // Assert
  })
})

describe.only('payment confirmation', () => {
  it('confirms payment to payee', async () => {
    // Arrange
    const transactionId = process.env.TRANSACTION_ID!
    const transaction = {
      consentId: '555',
      sourceAccountId: 'bob.fspA',
      amount: { currency: 'USD', amount: '31' }
    }

    // Act
    await transactionRepository.updateById(transactionId, transaction)


    // Assert
  })
})
