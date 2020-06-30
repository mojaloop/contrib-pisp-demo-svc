import { PartyIdInfo } from './parties'

export interface Payee {
  partyIdInfo: PartyIdInfo
}

export interface PersonalInfo {
  complexName: {
    firstName: string
    lastName: string
  }
}

export interface Payer {
  personalInfo: PersonalInfo
  partyIdInfo: PartyIdInfo
}

export enum AmountType {
  Send = 'SEND',
  Receive = 'RECEIVE',
}

export interface Amount {
  amount: number
  currency: string
}

export interface TransactionType {
  scenario: string
  initiator: string
  intiiatorType: string
}

export interface Quote {
  transferAmount: Amount
  payeeReceiveAmount: Amount
  payeeFspFee: Amount
  expiration: string
  ilpPacker: string
  condition: string
}
