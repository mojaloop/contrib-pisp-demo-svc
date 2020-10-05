/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 --------------
 ******/

import { program } from 'commander'
import axios from 'axios'
import packageInfo from '../package.json'

const { Enum } = require('@mojaloop/central-services-shared')
const EndPoints = Enum.EndPoints

interface RegistrationValue {
  targetServiceId: string
  type: string
  endpointPath: string
}

const registrationValues: Array<RegistrationValue> = [
  // PUT /participants
  {
    targetServiceId: 'central-ledger',
    type: EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_PARTICIPANT_PUT,
    endpointPath: '/participants',
  },
  // PUT /parties/{Type}/{ID}
  {
    targetServiceId: 'central-ledger',
    type: EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_PARTIES_PUT,
    endpointPath: '/parties/{{partyIdType}}/{{partyIdentifier}}',
  },
  // PUT /parties/{Type}/{ID}/error
  {
    targetServiceId: 'central-ledger',
    type: EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR,
    endpointPath: EndPoints.FspEndpointTemplates.PARTIES_PUT_ERROR,
  },
  // PUT /consentRequests/{ID}
  {
    targetServiceId: 'central-ledger',
    type: EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PUT,
    endpointPath: EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_PUT,
  },
  // PUT /consentRequests/{ID}/error
  {
    targetServiceId: 'central-ledger',
    type: EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_REQUEST_PUT_ERROR,
    endpointPath: EndPoints.FspEndpointTemplates.TP_CONSENT_REQUEST_PUT_ERROR,
  },
  // POST /consents
  {
    targetServiceId: 'central-ledger',
    type: EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_POST,
    endpointPath: EndPoints.FspEndpointTemplates.TP_CONSENT_POST,
  },
  // PUT /consents/{ID}
  {
    targetServiceId: 'central-ledger',
    type: EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT,
    endpointPath: EndPoints.FspEndpointTemplates.TP_CONSENT_PUT,
  },
  // PUT /consents/{ID}/error
  {
    targetServiceId: 'central-ledger',
    type: EndPoints.FspEndpointTypes.TP_CB_URL_CONSENT_PUT_ERROR,
    endpointPath: EndPoints.FspEndpointTemplates.TP_CONSENT_PUT_ERROR,
  },
  // POST /authorizations
  {
    targetServiceId: 'central-ledger',
    type: 'FSPIOP_CALLBACK_URL_TRX_REQ_SERVICE',
    endpointPath: EndPoints.FspEndpointTemplates.TP_AUTHORIZATIONS_POST,
  },
  // PUT /transfers/{ID}
  {
    targetServiceId: 'central-ledger',
    type: EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_TRANSFER_PUT,
    endpointPath: '/transfers/{{transferId}}',
  },
  // PUT /transfers/{ID}/error
  {
    targetServiceId: 'central-ledger',
    type: 'FSPIOP_CALLBACK_URL_TRANSFER_PUT_ERROR',
    endpointPath: '/transfers/{{transferId}}/error',
  }
]

program.version(packageInfo.version)

program.requiredOption(
  '-h, --host',
  'Host name for the pisp, which includes the transport protocol. \
  The host name will be appended with the endpoint paths that are \
  specified on the Mojaloop OpenAPI specification. For example,   \
  if the host is "https://example.com" and there is an endpoint   \
  with path "/participants", then it means the PISP needs to serve\
  the following endpoint: "https://example.com/participants".',
  // example value to avoid being considered as boolean
  'https://pisp-demo-server.local',
)

program.requiredOption(
  '-p, --participant-id',
  'Participant ID of the PISP that is registered in Mojaloop.',
  // example value to avoid being considered as boolean
  'pisp',
)

const requiredServiceIds = Array.from(
  // Get unique list of services that are needed to the the url
  // registation.
  new Set(registrationValues.map((value) => value.targetServiceId))
)

requiredServiceIds.forEach((serviceId) => {
  program.requiredOption(
    '--ml-' + serviceId,
    'Host name of the ' + serviceId + ' service in Mojaloop. \
    The value should also include the transport protocol.    \
    PISP endpoints that are related to the service will be   \
    registered by sending the registration object to the     \
    given address. Example: "https://central-ledger.local".',
    // example value to avoid being considered as boolean
    'https://' + serviceId + '.local',
  )
})

program.parse(process.argv)

// Replaces dash separated string to camel case.
// This function is needed as the commander library changes
// the command line argument into a camel case variable. 
// For example, to get the value of '--ml-central-ledger'
// argument, we need to access it as `program.mlCentralLedger`.
function toCamelCase(str: string) {
  return str.toLowerCase().replace(/-(.)/g, (_, group) => {
    return group.toUpperCase();
  })
}

registrationValues.forEach(async (value) => {
  // Compute variable name after being altered by the commander library
  const variableName = toCamelCase('ml-' + value.targetServiceId)

  // Target URL in Mojaloop
  const targetUrl = `${program[variableName]}/participants/${program.participantId}/endpoints`

  // Endpoint of the PISP that serves the callback from Mojaloop.
  const pispEndpoint = program.host + value.endpointPath

  // TODO: update with the format for Mojaloop request when 
  // everything is much clearer.
  try {
    await axios.post(targetUrl, {
      type: value.type,
      value: pispEndpoint,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (err) {
    console.log('Error when registering url type: ' + value.type)
  }
})
