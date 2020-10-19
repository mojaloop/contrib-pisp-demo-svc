import { consentRepository } from '~/repositories/consent'

describe('consent party lookup', () => {
  it('get the Payer party information', async () => {
    // Arrange

    // Create the start of the consent process
    // remember we are mocking out the device here
    const initConsent = {
      // payee: {
      //   partyIdInfo: {
      //     partyIdType: 'MSISDN',
      //     partyIdentifier: 'IN1231231255'
      //   }
      // },
      party: {
        partyIdInfo: {
          partyIdType: 'OPAQUE',
          partyIdentifier: 'customid',
          fspId: 'fspb'
        }
      },

      // Lewis user - taken from firebase
      userId: 'VQLEyvz9zYVucLbjJMErpwSFCVD2',
    }

    // Act
    const consentCollectionId = await consentRepository.insert(initConsent)
    // const transactionId = await transactionRepository.insert(transaction)
    console.log('created new doc with id', consentCollectionId)
    console.log(`make sure to set this: export CONSENT_COLLECTION_ID=${consentCollectionId}`)

    // Assert
    // TODO: how can we verify that this kicked off a get parties call?
  })
})
