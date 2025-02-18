import { ModalInfoList } from '@components/InfoList'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import { Amount } from '@pooltogether/hooks'
import {
  SquareLink,
  SquareButton,
  SquareButtonTheme,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import {
  formatBlockExplorerTxUrl,
  Transaction,
  TransactionState
} from '@pooltogether/wallet-connection'
import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface V3ModalApproveGateProps {
  className?: string
  amountToDeposit?: Amount
  chainId: number
  approveTx: Transaction
  sendApproveTx: () => void
}

export const V3ModalApproveGate = (props: V3ModalApproveGateProps) => {
  const { className, chainId, approveTx, sendApproveTx, amountToDeposit } = props

  const { t } = useTranslation()

  if (approveTx?.state === TransactionState.pending) {
    const blockExplorerUrl = formatBlockExplorerTxUrl(approveTx.response?.hash, chainId)

    return (
      <div className={classNames(className, 'flex flex-col')}>
        <ThemedClipSpinner className='mx-auto mb-8' sizeClassName='w-10 h-10' />
        <div className='text-inverse opacity-60'>
          <p className='mb-4 text-center mx-8'>
            {t(
              'onceYourApprovalTxHasFinished',
              'Once your approval transaction has finished successfully you can deposit.'
            )}
          </p>
        </div>
        <SquareLink
          href={blockExplorerUrl}
          className='w-full mt-6'
          theme={SquareButtonTheme.tealOutline}
          target='_blank'
        >
          {t('viewReceipt', 'View receipt')}
        </SquareLink>
      </div>
    )
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className='mx-4 text-inverse opacity-60'>
        <p className='mb-4'>
          {t(
            'prizePoolContractsRequireApprovals',
            `PoolTogether's Prize Pool contracts require you to send an approval transaction before depositing.`
          )}
        </p>
        <p className='mb-4'>{t('thisIsOncePerNetwork', 'This is necessary once per network.')}</p>
        <p className='mb-10'>
          {t('forMoreInfoOnApprovals', `For more info on approvals see:`)}{' '}
          <a
            target='_blank'
            className='underline'
            href='https://docs.pooltogether.com/pooltogether/using-pooltogether'
            rel='noreferrer'
          >
            {t('howToDeposit', 'How to deposit')}
          </a>
          .
        </p>
      </div>
      <ModalInfoList className='mb-2'>
        <EstimatedDepositGasItems chainId={chainId} showApprove />
      </ModalInfoList>
      <div className='mb-6'>
        <DepositLowAmountWarning chainId={chainId} amountToDeposit={amountToDeposit} />
      </div>
      <SquareButton className='w-full' onClick={sendApproveTx}>
        {t('confirmApproval', 'Confirm approval')}
      </SquareButton>
    </div>
  )
}
