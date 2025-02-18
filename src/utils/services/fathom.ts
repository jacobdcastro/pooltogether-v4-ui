export enum FathomEvent {
  'approveDeposit' = 'YHCCMXBB',
  'deposit' = 'TPW7LFIM',
  'withdrawal' = '3JYMDT8G',
  'prizeClaim' = 'EVLWAG9O',
  'prizeCheck' = 'PWDABZ16',
  'buyCoinbasePay' = 'CJAJK6TF'
}

export const logEvent = (event: FathomEvent, value: number = 1) => {
  if (window['fathom']) {
    try {
      window['fathom'].trackGoal(event, value)
    } catch (e) {}
  }
}
