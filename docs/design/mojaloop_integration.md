# Mojaloop Integration

Mojaloop is a Real Time Payment (RTP) system that fundamentally bridges the communication between
Financial Service Providers (FSPs) to perform financial transactions. With Mojaloop as an intermediary,
moving money between FSPs becomes simpler as each participant, in this case an FSP, only needs to 
conform to the Application Programming Interface (API) defined by Mojaloop in order to be able to 
communicate with other participants. Figure 1 shows a common problem with the traditional method 
to transfer money between FSPs where each participant typically defines their own set of API and
introduce a complex process of synchronization between each pair of FSPs. Meanwhile, as shown in
Figure 2, each participant could focus to ensure that it maintains a proper communication with 
Mojaloop to be able to talk with other participants in the RTP network.

![Figure 1](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/stevenwjy/pisp-demo-server/mojaloop-integration-docs/docs/assets/diagrams/mojaloop/fig-01-traditional-method.puml)

![Figure 2](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/stevenwjy/pisp-demo-server/mojaloop-integration-docs/docs/assets/diagrams/mojaloop/fig-02-mojaloop-rtp.puml)

As RTP system like Mojaloop grows in popularity, the use of third-party services who do not manage 
its own ledger but exist for the purpose of initiating transactions has also come into attention.
With mojaloop, a PISP also enjoys the benefit of the FSPs where it does not need to mantain multiple
APIs to communicate with each FSP but only a single API that follows Mojaloop's standard. Figure 3
shows how a PISP could simultaneously setup communication with multiple FSPs by integrating to the
Mojaloop's RTP network.

![Figure 3](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/stevenwjy/pisp-demo-server/mojaloop-integration-docs/docs/assets/diagrams/mojaloop/fig-03-pisp-mojaloop.puml)

In order to join a Mojaloop network, a PISP must complete the following steps:
1. [Certificate Registration](#certificate-registration)
2. [URL Registration](#url-registration)

In general, all of the signing, encryption, and other setup required to make requests to Mojaloop 
are expected to be handled by the [`sdk-standard-components`](https://github.com/mojaloop/sdk-standard-components)
libary. Hence, PISP demo server only needs to set the proper configuration such as path to the 
issued certificate, Mojaloop's URL, PISP identifier, transport scheme, and various other options
which could be found [here](https://github.com/mojaloop/sdk-standard-components/blob/master/src/lib/requests/baseRequests.js).

## Certificate Registration

In the Mojaloop's network for FSP Interoperability, every participant must be registered and have a
signed certificate by the centralized Certificate Authority (CA). According to the 
[PKI Best Practices](https://docs.mojaloop.io/mojaloop-specification/documents/PKI%20Best%20Practices.html),
the CA itself will have a self-signed root certificate for signing the participants' certificates. 
The certificates are important to protect the transport-level communication (TLS) and application-level
communication (JWS and JWE). All of the security protocols involved are for the purpose of ensuring
integrity and confidentiality between platforms. More information could be found in the 
[Mojaloop Specifications](https://docs.mojaloop.io/mojaloop-specification/).

PISP has to register its certificate manually, by telling the operator of Mojaloop the PISP's public
key and have it digitally signed by the centrallized CA.

## URL Registration

As Mojaloop's architecture follows the asynchronous request/response design pattern, PISP demo server 
also interacts with Mojaloop using that pattern to avoid long-running connections. When making a 
request to Mojaloop, it may take some time to receive the response as everything is considered to work 
asynchronously. Even though it takes only several seconds on average, we still need to prepare for the 
indefinite time characteristic of asynchronous messages. As a result, PISP demo server needs to register 
its URL so that Mojaloop knows where to make the callback once the reply is ready. For example, 
Mojaloop needs to know the endpoint of the PISP server that is ready to handle `PUT /parties/{Type}/{ID}` 
callback from Mojaloop following a previous request of `GET /parties/{Type}/{ID}` to perform a party lookup.

The following are the callback URLs that need to be registered by the PISP demo server:
- `PUT /participants`
- `PUT /parties/{Type}/{ID}`
- `PUT /parties/{Type}/{ID}/error`
- `PUT /consentRequests/{ID}`
- `PUT /consentRequests/{ID}/error`
- `POST /consents`
- `PUT /consents/{ID}`
- `PUT /consents/{ID}/error`
- `POST /authorizations`
- `PUT /transfers/{ID}`
- `PUT /transfers/{ID}/error`

For each callback endpoint, PISP demo server needs to register the URL to Mojaloop's switch by
sending a request with the following format:

```
  POST {HOST_URL}/participants/{PISP_IDENTIFIER}/endpoints

  Content-Type: application/json

  {
    "type": "{TYPE_ENUM}",
    "value": "{PISP_ENDPOINT}"
  }
```

- `HOST_URL`        : URL of the Mojaloop service for which the PISP wants to register its endpoint.
- `PISP_IDENTIFIER` : An identifier for the PISP that is registered in Mojaloop. This value is expected
                      to be decided when a PISP registers its certificate in Mojaloop and stay the same
                      over period. Example: `pisp`.
- `TYPE_ENUM`       : An enumeration type of the callback endpoint that is defined by Mojaloop.
- `PISP_ENDPOINT`   : The endpoint of the PISP that is ready to handle the callback. This may also contain
                      some wildcard for path parameters.

### `PUT /participants`

This endpoint is used by the PISP demo server in the linking process to obtain the list of FSPs that
are available in the Mojaloop network. Below are the values for some specific variables to register 
this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `FSIOP_CALLBACK_URL_PARTICIPANT_PUT`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. Example: `https://pisp-demo-server.local/participants`.

### `PUT /parties/{Type}/{ID}`

This endpoint is used by the PISP demo server in both the linking and transfer processes to perform 
a lookup and get information about a particular party. Below are the values for some specific variables 
to register this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `FSIOP_CALLBACK_URL_PARTIES_PUT`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. 
                    Example: `https://pisp-demo-server.local/parties/{{partyIdType}}/{{partyIdentifier}}`.

### `PUT /parties/{Type}/{ID}/error`

This endpoint is used by the PISP demo server in both the linking and transfer processes to receive error
information for party lookup operations, if any. Below are the values for some specific variables to register 
this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. 
                    Example: `https://pisp-demo-server.local/parties/{{partyIdType}}/{{partyIdentifier}}`.

### `PUT /consentRequests/{ID}`

This endpoint is used by the PISP demo server in the linking process to receive an authentication prompt
from FSPs. Below are the values for some specific variables to register this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `THIRDPARTY_CALLBACK_URL_CONSENT_REQUEST_PUT`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. 
                    Example: `https://pisp-demo-server.local/consentRequests/{{consentId}}`.

### `PUT /consentRequests/{ID}/error`

This endpoint is used by the PISP demo server in the linking process to receive error information for consent 
request operations, if any. Below are the values for some specific variables to register this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `THIRDPARTY_CALLBACK_URL_CONSENT_REQUEST_PUT_ERROR`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. 
                    Example: `https://pisp-demo-server.local/consentRequests/{{consentId}}/error`.

### `POST /consents`

This endpoint is used by the PISP demo server in the linking process to receive the result of a consent
request. Below are the values for some specific variables to register this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `THIRDPARTY_CALLBACK_URL_CONSENT_POST`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. Example: `https://pisp-demo-server.local/consents`.

### `PUT /consents/{ID}`

This endpoint is used by the PISP demo server in the linking process to get a challenge and the result
of FIDO registration. Below are the values for some specific variables to register this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `THIRDPARTY_CALLBACK_URL_CONSENT_PUT`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. 
                    Example: `https://pisp-demo-server.local/consents/{{consentId}}`.

### `PUT /consents/{ID}/error`

This endpoint is used by the PISP demo server in the linking process to get error information when
performing FIDO registration. Below are the values for some specific variables to register this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `THIRDPARTY_CALLBACK_URL_CONSENT_PUT_ERROR`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. 
                    Example: `https://pisp-demo-server.local/consents/{{consentId}}/error`.

### `POST /authorizations`

This endpoint is used by the PISP demo server in the transfer process to get an authorization prompt
for a transaction request. Below are the values for some specific variables to register this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. 
                    Example: `https://pisp-demo-server.local/authorizations`.

### `PUT /transfers/{ID}`

This endpoint is used by the PISP demo server in the transfer process to get the result of a transaction.
Below are the values for some specific variables to register this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `FSPIOP_CALLBACK_URL_TRANSFER_PUT`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. 
                    Example: `https://pisp-demo-server.local/transfers/{{transferId}}`.

### `PUT /transfers/{ID}/error`

This endpoint is used by the PISP demo server in the transfer process to get error information when trying
to perform a transaction. Below are the values for some specific variables to register this endpoint:

- `HOST_URL`      : URL of the central ledger service in Mojaloop. Example: `https://central-ledger.local`.
- `TYPE_ENUM`     : `FSPIOP_CALLBACK_URL_TRANSFER_PUT_ERROR`
- `PISP_ENDPOINT` : URL of the PISP endpoint that handles this callback. 
                    Example: `https://pisp-demo-server.local/transfers/{{transferId}}/error`.
