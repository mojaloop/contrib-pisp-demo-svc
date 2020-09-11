import { Status } from '~/models/transaction'
import { transactionRepository } from '~/repositories/transaction'


describe('party lookup', () => {

  it.only('starts the transaction and does a party lookup', async () => {
    // Arrange
    const transaction = {
      payee: {
        partyIdType: 'MSISDN',
        partyIdentifier: 'IN1231231234'
      },
      status: Status.PENDING_PARTY_LOOKUP,
      transactionRequestId: 'abcde-12345',
      // Lewis user - taken from firebase
      userId: 'VQLEyvz9zYVucLbjJMErpwSFCVD2',
    }

    // Act
    const doc = await transactionRepository.insert(transaction)
    console.log('created new doc', doc.id)

    // Assert
  })
})
