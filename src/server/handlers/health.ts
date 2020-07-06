/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 --------------
 ******/

import { Request, ResponseToolkit } from '@hapi/hapi'
import { Handler, Context } from 'openapi-backend'

import { HealthCheck, HealthResponseCode, HealthCheckResult, ServiceStatus } from '../../shared/health'
import Config from '~/shared/config'
import { logger } from '~/shared/logger'

const pakcageInfo = {
  name: Config.get('package.name'),
  version: Config.get('package.version')
}

const healthCheck = new HealthCheck(pakcageInfo, [])

/**
 * Operations on /health
 */

export const get: Handler = async (context: Context, request: Request, h: ResponseToolkit) => {
  logger.logRequest(context, request, h)
  let healthCheckResult: HealthCheckResult | null = null;
  try {
    healthCheckResult = await healthCheck.getHealth()
  } catch (err) {
    logger.error(err.message)
  }

  if (healthCheckResult == null || healthCheckResult.status == ServiceStatus.Down) {
    logger.logRequest(context, request, h)
    return h.response({}).code(HealthResponseCode.GatewayTimeout)
  } else {
    return h.response(healthCheckResult).code(HealthResponseCode.Success)
  }
}
