// import { transactionRepository } from '~/repositories/transaction'

import { participantRepository } from "~/repositories/participants"
import { Participant } from '~/shared/ml-thirdparty-client/models/core'

describe('get participants', () => {
  it('gets the list of available participants to link with', async () => {
    // Arrange
    console.log("TODO!")
    const participants: Array<Participant> = [
      { fspId: 'dfspa', name: 'DFSP A'},
      { fspId: 'dfspb', name: 'DFSP B'},
      { fspId: 'dfspb', name: 'DFSP C'}
    ]
    await participantRepository.replace(participants)
    // TODO: perform call, and upate participants repo...
    // const transaction = {
    //   payee: {
    //     partyIdInfo: {
    //       partyIdType: 'MSISDN',
    //       partyIdentifier: 'IN1231231255'
    //     }
    //   },
    //   // Lewis user - taken from firebase
    //   userId: 'VQLEyvz9zYVucLbjJMErpwSFCVD2',
    // }

    // // Act
    // const transactionId = await transactionRepository.insert(transaction)
    // console.log('created new doc with id', transactionId)
    // console.log(`make sure to set this: export TRANSACTION_ID=${transactionId}`)

    // Assert
  })
})
