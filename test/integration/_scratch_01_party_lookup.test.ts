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
