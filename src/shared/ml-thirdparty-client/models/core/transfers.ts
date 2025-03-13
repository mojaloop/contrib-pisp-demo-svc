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

/**
 * Below are the allowed values for the enumeration.
 */
export enum TransferState {
  /**
   * Next ledger has received the transfer.
   */
  RECEIVED = 'RECEIVED',

  /**
   * Next ledger has reserved the transfer.
   */
  RESERVED = 'RESERVED',

  /**
   * Next ledger has successfully performed the transfer.
   */
  COMMITTED = 'COMMITTED',

  /**
   * Next ledger has aborted the transfer due to a rejection or failure to perform the transfer.
   */
  ABORTED = 'ABORTED',
}
