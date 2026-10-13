export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  accountNumber: string
  routingNumber: string
  swiftBic: string
  bankName: string
  balanceUSD: number
  balanceEUR: number
  balanceGBP: number
  balanceNGN: number
  withdrawalLimit: number // Default $50 as specified
  isVerified: boolean
  verificationStatus: "unverified" | "pending" | "verified"
  idDocumentType?: string
  idDocumentNumber?: string
  avatar: string
  createdDate: string
}

export interface Transaction {
  id: string
  userId: string
  type: "deposit" | "withdrawal" | "transfer_out" | "transfer_in" | "card_spend"
  amount: number
  currency: string
  title: string
  description: string
  recipientBank?: string
  recipientAccount?: string
  recipientName?: string
  timestamp: string
  status: "completed" | "pending" | "declined"
  reference: string
}

export interface BankCard {
  id: string
  cardNumber: string
  holderName: string
  expiry: string
  cvv: string
  type: "visa" | "mastercard"
  isFrozen: boolean
  dailyLimit: number
}

export interface CardOrder {
  id: string
  trackingNumber: string
  fullName: string
  address: string
  phone: string
  method: string
  timestamp: string
  status: string
}

export const INITIAL_USER: UserProfile = {
  id: "usr_wik_0982",
  name: "Alexander Vance",
  email: "alexander.vance@wikosafety.com",
  phone: "+1 (555) 234-8901",
  accountNumber: "8492019482",
  routingNumber: "021000021",
  swiftBic: "WIKOUSB33",
  bankName: "Wiko Safety Bank N.A.",
  balanceUSD: 14250.0,
  balanceEUR: 3200.0,
  balanceGBP: 1850.0,
  balanceNGN: 1450000.0,
  withdrawalLimit: 50.0, // $50 client withdrawal limit
  isVerified: true,
  verificationStatus: "verified",
  idDocumentType: "Passport",
  idDocumentNumber: "P89230184A",
  avatar: "AV",
  createdDate: "Jan 14, 2026",
}

export const INITIAL_CLIENTS: UserProfile[] = [
  INITIAL_USER,
  {
    id: "usr_wik_1145",
    name: "Sarah Jenkins",
    email: "s.jenkins@apexglobal.io",
    phone: "+1 (555) 489-3320",
    accountNumber: "9021849102",
    routingNumber: "021000021",
    swiftBic: "WIKOUSB33",
    bankName: "Wiko Safety Bank N.A.",
    balanceUSD: 8400.0,
    balanceEUR: 1200.0,
    balanceGBP: 890.0,
    balanceNGN: 520000.0,
    withdrawalLimit: 50.0,
    isVerified: true,
    verificationStatus: "verified",
    idDocumentType: "National ID",
    idDocumentNumber: "NID-992384",
    avatar: "SJ",
    createdDate: "Feb 03, 2026",
  },
  {
    id: "usr_wik_2089",
    name: "Marcus Sterling",
    email: "marcus.sterling@sterlingholdings.co",
    phone: "+44 20 7946 0912",
    accountNumber: "7741920844",
    routingNumber: "021000021",
    swiftBic: "WIKOUSB33",
    bankName: "Wiko Safety Bank N.A.",
    balanceUSD: 31200.0,
    balanceEUR: 14500.0,
    balanceGBP: 9800.0,
    balanceNGN: 0.0,
    withdrawalLimit: 50.0,
    isVerified: false,
    verificationStatus: "pending",
    idDocumentType: "Driver's License",
    idDocumentNumber: "DL-TX-492019",
    avatar: "MS",
    createdDate: "Mar 11, 2026",
  },
  {
    id: "usr_wik_3812",
    name: "David O. Adeleke",
    email: "david.adeleke@lagostech.ng",
    phone: "+234 803 123 4567",
    accountNumber: "6501938472",
    routingNumber: "021000021",
    swiftBic: "WIKOUSB33",
    bankName: "Wiko Safety Bank N.A.",
    balanceUSD: 4950.0,
    balanceEUR: 300.0,
    balanceGBP: 0.0,
    balanceNGN: 4850000.0,
    withdrawalLimit: 50.0,
    isVerified: false,
    verificationStatus: "unverified",
    avatar: "DA",
    createdDate: "Apr 02, 2026",
  },
]

export const INITIAL_CARDS: BankCard[] = [
  {
    id: "crd_1",
    cardNumber: "4532 8920 1840 9283",
    holderName: "ALEXANDER VANCE",
    expiry: "09/29",
    cvv: "839",
    type: "visa",
    isFrozen: false,
    dailyLimit: 2500,
  },
]

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_101",
    userId: "usr_wik_0982",
    type: "deposit",
    amount: 5000.0,
    currency: "USD",
    title: "Wire Deposit Received",
    description: "Federal Reserve Inbound Wire from Treasury Clearing",
    recipientBank: "JPMorgan Chase N.A.",
    timestamp: "Today, 11:42 AM",
    status: "completed",
    reference: "WIKO-FED-9812401",
  },
  {
    id: "tx_102",
    userId: "usr_wik_0982",
    type: "transfer_out",
    amount: 50.0,
    currency: "USD",
    title: "Transfer to Bank of America",
    description: "Wire Payout to Account ending in ••4920",
    recipientBank: "Bank of America, N.A.",
    recipientAccount: "482019284920",
    recipientName: "Eleanor Vance",
    timestamp: "Yesterday, 04:15 PM",
    status: "completed",
    reference: "WIKO-TRF-4491029",
  },
  {
    id: "tx_103",
    userId: "usr_wik_0982",
    type: "deposit",
    amount: 2500.0,
    currency: "USD",
    title: "ACH Payroll Direct Deposit",
    description: "Verified Employer Settlement Credit",
    timestamp: "Oct 08, 2026",
    status: "completed",
    reference: "WIKO-ACH-7729103",
  },
  {
    id: "tx_104",
    userId: "usr_wik_0982",
    type: "card_spend",
    amount: 38.5,
    currency: "USD",
    title: "AWS Cloud Infrastructure",
    description: "Visa Card contactless token transaction",
    timestamp: "Oct 06, 2026",
    status: "completed",
    reference: "WIKO-CRD-8820194",
  },
]

export const POPULAR_BANKS = [
  { id: "chase", name: "JPMorgan Chase Bank, N.A.", code: "CHASUS33", routing: "021000021" },
  { id: "bofa", name: "Bank of America, N.A.", code: "BOFAUS3N", routing: "026009593" },
  { id: "wells", name: "Wells Fargo Bank, N.A.", code: "WFBIUS6S", routing: "121000248" },
  { id: "citi", name: "Citibank, N.A.", code: "CITIUS33", routing: "021000089" },
  { id: "barclays", name: "Barclays Bank UK PLC", code: "BARCGB22", routing: "200000" },
  { id: "hsbc", name: "HSBC Bank International", code: "HBUKGB4B", routing: "400000" },
  { id: "gtb", name: "Guaranty Trust Bank (GTBank)", code: "GTBINGLA", routing: "058152062" },
  { id: "access", name: "Access Bank Plc", code: "ABNINLA", routing: "044150149" },
  { id: "zenith", name: "Zenith Bank PLC", code: "ZEIBNGLA", routing: "057150013" },
]

export const ADMIN_MASTER_PASSWORD = "WikoAdmin2026!"
