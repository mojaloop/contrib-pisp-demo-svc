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

export interface PackageInfo {
  name: string
  version: string
}

export enum ServiceName {
  Datastore,
  MojaloopAdapter,
}

export enum ServiceStatus {
  Ok = 'OK',
  Down = 'DOWN',
}

export interface ServiceHealth {
  name: ServiceName
  status: ServiceStatus
}

export type ServiceChecker = () => Promise<ServiceHealth>

export interface HealthCheckResult {
  version: string
  status: ServiceStatus
  uptime: number
  startTime: string
}

export enum HealthResponseCode {
  Success = 200,
  GatewayTimeout = 502,
}

export class HealthCheck {
  private packageInfo: PackageInfo
  private serviceCheckers: ServiceChecker[]

  constructor(packageInfo: PackageInfo, serviceCheckers: ServiceChecker[]) {
    this.packageInfo = packageInfo
    this.serviceCheckers = serviceCheckers
    this.getHealth.bind(this)
  }

  async getHealth(): Promise<HealthCheckResult> {
    const uptime = process.uptime()
    const startTimeDate = new Date(Date.now() - uptime)
    const startTime = startTimeDate.toISOString()
    const version = this.packageInfo.version

    let isHealthy: boolean
    try {
      const serviceHealths = await Promise.all(
        this.serviceCheckers.map((s) => s())
      )
      isHealthy = serviceHealths.every((s) => s.status === ServiceStatus.Ok)
    } catch {
      isHealthy = false
    }

    return {
      version,
      status: isHealthy ? ServiceStatus.Ok : ServiceStatus.Down,
      uptime,
      startTime,
    }
  }
}
