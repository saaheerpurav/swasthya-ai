export const REGIONS = [
  { code: 'KA_BLR', name: 'Bengaluru', state: 'Karnataka', stateCode: 'KA' },
  { code: 'KA_MYS', name: 'Mysuru', state: 'Karnataka', stateCode: 'KA' },
  { code: 'TN_CHE', name: 'Chennai', state: 'Tamil Nadu', stateCode: 'TN' },
  { code: 'TN_COI', name: 'Coimbatore', state: 'Tamil Nadu', stateCode: 'TN' },
  { code: 'AP_HYD', name: 'Hyderabad', state: 'Andhra Pradesh', stateCode: 'AP' },
  { code: 'AP_VJA', name: 'Vijayawada', state: 'Andhra Pradesh', stateCode: 'AP' },
  { code: 'TS_HYD', name: 'Hyderabad', state: 'Telangana', stateCode: 'TS' },
  { code: 'MH_MUM', name: 'Mumbai', state: 'Maharashtra', stateCode: 'MH' },
  { code: 'MH_PUN', name: 'Pune', state: 'Maharashtra', stateCode: 'MH' },
  { code: 'DL_DEL', name: 'Delhi', state: 'Delhi', stateCode: 'DL' },
  { code: 'UP_LKN', name: 'Lucknow', state: 'Uttar Pradesh', stateCode: 'UP' },
  { code: 'RJ_JAI', name: 'Jaipur', state: 'Rajasthan', stateCode: 'RJ' },
  { code: 'GJ_AMD', name: 'Ahmedabad', state: 'Gujarat', stateCode: 'GJ' },
  { code: 'WB_KOL', name: 'Kolkata', state: 'West Bengal', stateCode: 'WB' },
  { code: 'OR_BHU', name: 'Bhubaneswar', state: 'Odisha', stateCode: 'OR' },
] as const

export const STATE_REGIONS: Record<string, string[]> = {
  KA: ['KA_BLR', 'KA_MYS'],
  TN: ['TN_CHE', 'TN_COI'],
  AP: ['AP_HYD', 'AP_VJA'],
  TS: ['TS_HYD'],
  MH: ['MH_MUM', 'MH_PUN'],
  DL: ['DL_DEL'],
  UP: ['UP_LKN'],
  RJ: ['RJ_JAI'],
  GJ: ['GJ_AMD'],
  WB: ['WB_KOL'],
  OR: ['OR_BHU'],
}

