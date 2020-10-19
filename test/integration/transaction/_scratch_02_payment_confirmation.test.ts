import { transactionRepository } from '~/repositories/transaction'

describe('payment confirmation', () => {
  it('confirms payment to payee', async () => {
    // Arrange
    const transactionId = process.env.TRANSACTION_ID!
    const transaction = {
      consentId: 'e94b9110-f6c9-44cf-bdc0-895430f1ca9c',
      sourceAccountId: 'bob.fspA',
      amount: { currency: 'USD', amount: '33' },
      // We need to set this to match the testing toolkit - this overrides whatever value we set earlier
      transactionRequestId: '02e28448-3c05-4059-b5f7-d518d0a2d8ea',
    }

    // Act
    await transactionRepository.updateById(transactionId, transaction)


    // Assert
  })
})
