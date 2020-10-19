import { transactionRepository } from '~/repositories/transaction'

const sleep = (timeMs: number) => new Promise((resolve) => setTimeout(resolve, timeMs))
jest.setTimeout(10000)

let transactionId: string;

describe('01. party lookup', () => {
  it('starts the transaction and does a party lookup', async () => {
    console.log('starting: 01. party lookup')
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
    transactionId = await transactionRepository.insert(transaction)
    console.log(`if running manually, make sure to set this: export TRANSACTION_ID=${transactionId}`)
    await(sleep(3000))

    // Assert
    // TODO! - query the object and confirm it's state
  })
})

describe('02. payment confirmation', () => {
  it('confirms payment to payee', async () => {
    console.log('starting: 02. payment confirmation')
    // Arrange
    if (!transactionId) {
      transactionId = process.env.TRANSACTION_ID!
    }
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
    await (sleep(3000))
    // TODO! - query the object and confirm it's state
  })
})

describe('03. payment confirmation', () => {
  it('confirms payment to payee', async () => {
    console.log('starting: 03. payment confirmation')
    // Arrange
    if (!transactionId) {
      transactionId = process.env.TRANSACTION_ID!
    }
    const transaction = {
      responseType: 'AUTHORIZED',
      authentication: { type: 'U2F', value: (new Date()).toISOString() },
    }

    // Act
    await transactionRepository.updateById(transactionId, transaction)

    // Assert
    // TODO! - query the object and confirm it's state
  })
})

