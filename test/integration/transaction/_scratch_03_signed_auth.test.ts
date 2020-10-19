import { transactionRepository } from '~/repositories/transaction'

describe('payment confirmation', () => {
  it('confirms payment to payee', async () => {
    // Arrange
    const transactionId = process.env.TRANSACTION_ID!
    const transaction = {
      responseType: 'AUTHORIZED',
      authentication: { type: 'U2F', value: (new Date()).toISOString() },
    }

    // Act
    await transactionRepository.updateById(transactionId, transaction)


    // Assert
  })
})
