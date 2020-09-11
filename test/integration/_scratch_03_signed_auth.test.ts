import { transactionRepository } from '~/repositories/transaction'

describe('payment confirmation', () => {
  it('confirms payment to payee', async () => {
    // Arrange
    const transactionId = process.env.TRANSACTION_ID!
    const transaction = {
      responseType: 'AUTHORIZED',
      authentication: { type: 'U2F', value: 'unimplemented1234' },
    }

    // Act
    await transactionRepository.updateById(transactionId, transaction)


    // Assert
  })
})
