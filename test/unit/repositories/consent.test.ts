/* eslint-disable @typescript-eslint/ban-ts-comment */
import mocksdk from '~/lib/mockFirebase'
import { consentRepository } from '~/repositories/consent'
import { Consent, ConsentStatus } from '~/models/consent'

// Swap out default empty mocks with the firebase-mock package mocksdk
jest.mock('~/lib/firebase', () => {
  return mocksdk
})

// Create mocked transaction data
const collectionRef = mocksdk.firestore().collection('consent')

const mockConsent: Consent = {
  id: '234',
  consentId: '234',
  status: ConsentStatus.PENDING_PARTY_LOOKUP,
  consentRequestId: 'test23',
}

describe('Tests for Consent repository', () => {
  beforeAll(() => {
    collectionRef.add(mockConsent)
  })
  it('should retrieve and return consent on getConsentById call', () => {
    expect(consentRepository.getByConsentId('234')).resolves.toStrictEqual(
      mockConsent
    )
    expect(
      mocksdk
        .firestore()
        .collection('consents')
        .where('consentId', '==', '234')
        .get()
        .then((response: unknown) => {
          // @ts-ignore
          return resolve(response as Consent)
        })
    ).toStrictEqual(mockConsent)
  })

  it('should throw and error if no consent found on getConsentById call', () => {
    expect(consentRepository.getByConsentId('404')).rejects.toThrowError(
      'Consent not found'
    )
  })
})
