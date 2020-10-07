const exampleScopeArray = [
    {
        accountId: 'testId',
        actions: ['withdraw', 'viewbalance']
    },
    {
        accountId: 'testId2',
        actions: ['viewbalance']
    }
]

export const putConsentRequestsByIdBody = {
    initiatorId: '1234',
    authChannels: ['web', 'OTP'],
    scopes: exampleScopeArray,
    callbackUri: 'pisp://callback',
    authUri: 'www.auth.com'
}

export const putConsentsByIdBody = {
    requestId: '1234',
    initiatorId: '1234',
    participantId: '5678',
    scopes: exampleScopeArray,
    credential: {
        id: 'credId',
        credentialType: 'FIDO',
        status: 'VERIFIED',
        challenge: {
            payload: 'payload_str',
            signature: 'signature_str',
        },
        payload: 'credential_str',
    }
}