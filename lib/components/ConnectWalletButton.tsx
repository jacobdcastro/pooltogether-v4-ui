import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { SquareButton } from '@pooltogether/react-components'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ConnectWalletButtonProps {
  className?: string
  postConnectCallback?: () => void
}

export const ConnectWalletButton = (props: ConnectWalletButtonProps) => {
  const { className, postConnectCallback } = props
  const { connectWallet } = useOnboard()
  const { t } = useTranslation()
  return (
    <SquareButton className={className} onClick={() => connectWallet(postConnectCallback)}>
      {t('connectWallet')}
    </SquareButton>
  )
}

ConnectWalletButton.defaultProps = {
  className: 'w-full',
  postConnectCallback: null
}
