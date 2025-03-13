/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")

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
*****/

import { ExtensionList, TransferState } from '../core';

export interface TransferIDPutRequest {
  /**
   * Common ID (decided by the Payer FSP) between the FSPs for the future transaction 
   * object. The actual transaction will be created as part of a successful transfer 
   * process.
   */
  transactionId: string

  /**
   * Fulfilment of the condition specified with the transaction. 
   * Mandatory if transfer has completed successfully.
   */
  fulfilment: string

  /**
   * Time and date when the transaction was completed.
   */
  completedTimestamp: string

  /**
   * State of the transfer.
   */
  transferState: TransferState

  /**
   * Optional extension, specific to deployment.
   */
  extensionList?: ExtensionList
}

// TODO: double check api format...
export interface TransferIDPatchRequest {
  /**
 * Common ID (decided by the Payer FSP) between the FSPs for the future transaction 
 * object. The actual transaction will be created as part of a successful transfer 
 * process.
 */
  transactionId: string

  /**
   * Time and date when the transaction was completed.
   */
  completedTimestamp: string

  /**
   * State of the transfer.
   */
  transferState: TransferState

  /**
   * Optional extension, specific to deployment.
   */
  extensionList?: ExtensionList
}