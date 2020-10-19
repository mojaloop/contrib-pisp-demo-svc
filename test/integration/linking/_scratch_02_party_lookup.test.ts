import { ConsentStatus } from '~/models/consent';
import { consentRepository } from '~/repositories/consent'

const sleep = (timeMs: number) => new Promise((resolve) => setTimeout(resolve, timeMs))
jest.setTimeout(1000 * 15)

let consentCollectionId: string;

describe('01. consent party lookup', () => {
  it('gets the Payer party information', async () => {
    // Arrange
    console.log('starting: 01. consent party lookup')


    // Create the start of the consent process
    // remember we are mocking out the device here
    const initConsent = {
      party: {
        partyIdInfo: {
          partyIdType: 'OPAQUE',
          partyIdentifier: '02e28448-3c05-4059-b5f7-d518d0a2d8ea',
          fspId: 'fspb'
        }
      },

      // Lewis user - taken from firebase
      userId: 'VQLEyvz9zYVucLbjJMErpwSFCVD2',
    }

    // Act
    consentCollectionId = await consentRepository.insert(initConsent)
    // const transactionId = await transactionRepository.insert(transaction)
    console.log('created new doc with id', consentCollectionId)
    console.log(`make sure to set this: export CONSENT_COLLECTION_ID=${consentCollectionId}`)
    await (sleep(5000))
    // Assert
    // TODO: how can we verify that this kicked off a get parties call?

  })
})

describe('02. party confirmation', () => {
  it('gets the Payer party information', async () => {
    console.log('starting: 02. party confirmation')

    // Arrange
    if (!consentCollectionId) {
      consentCollectionId = process.env.CONSENT_COLLECTION_ID!
    }

    // Create the start of the consent process
    // remember we are mocking out the device here
    const consent = {
      status: ConsentStatus.PARTY_CONFIRMED,
      authChannels: ['WEB', 'OTP'],
      accounts: [{
        'address': "dfspa.alice.1234",
        'currency': "USD",
        'description': "savings",
      }],
      scopes: [{
        accountId: 'dfspa.alice.1234',
        actions: ['accounts.transfer']
      }],
      initiatorId: 'pisp'
    }

    // Act
    await consentRepository.updateConsentById(consentCollectionId, consent)
    // const transactionId = await transactionRepository.insert(transaction)

    // Assert
    await (sleep(5000))
    // TODO: how can we verify that this kicked off a get parties call?

  })
})

describe('03. user authentication', () => {
  it('sends the auth result to the switch', async () => {
    console.log('starting: 03. user authentication')

    // Arrange
    if (!consentCollectionId) {
      consentCollectionId = process.env.CONSENT_COLLECTION_ID!
    }

    // Create the start of the consent process
    // remember we are mocking out the device here
    const consent = {
      status: ConsentStatus.AUTHENTICATION_COMPLETE,
      authToken: '1234567890'
    }

    // Act
    await consentRepository.updateConsentById(consentCollectionId, consent)
    // const transactionId = await transactionRepository.insert(transaction)

    // Assert
    await (sleep(5000))
    // TODO: how can we verify that this kicked off a get parties call?

  })
})
