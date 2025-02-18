import { ConnectWalletButton } from '@components/ConnectWalletButton'
import { InfoList } from '@components/InfoList'
import { InfoListItem } from '@components/InfoList'
import {
  EstimatedApproveAndDepositGasItem,
  EstimatedDepositGasItem
} from '@components/InfoList/EstimatedGasItem'
import { PrizePoolNetworkAPRItem } from '@components/InfoList/PrizePoolNetworkAPRItem'
import { TwabRewardsAprItem } from '@components/InfoList/TwabRewardsAprItem'
import { TxReceiptItem } from '@components/InfoList/TxReceiptItem'
import { UpdatedPrizePoolNetworkOddsListItem } from '@components/InfoList/UpdatedPrizePoolNetworkOddsListItem'
import { UpdatedPrizePoolNetworkOddsListItemBar } from '@components/InfoList/UpdatedPrizePoolNetworkOddsListItemBar'
import { UpdatedPrizePoolOddsListItem } from '@components/InfoList/UpdatedPrizePoolOddsListItem'
import { UpdatedPrizePoolOddsListItemBar } from '@components/InfoList/UpdatedPrizePoolOddsListItemBar'
import { DepositAmountInput } from '@components/Input/DepositAmountInput'
import { TxButton } from '@components/Input/TxButton'
import { EstimateAction } from '@constants/odds'
import { BigNumber } from '@ethersproject/bignumber'
import { usePrizePoolBySelectedChainId } from '@hooks/v4/PrizePool/usePrizePoolBySelectedChainId'
import { useUsersDepositAllowance } from '@hooks/v4/PrizePool/useUsersDepositAllowance'
import { useUsersPrizePoolOdds } from '@hooks/v4/PrizePool/useUsersPrizePoolOdds'
import { Amount, TokenWithBalance } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import {
  useIsWalletConnected,
  Transaction,
  TransactionState,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { FieldValues, UseFormReturn } from 'react-hook-form'

export const DEPOSIT_QUANTITY_KEY = 'amountToDeposit'

interface DepositFormProps {
  form: UseFormReturn<FieldValues, object>
  prizePool: PrizePool
  isPrizePoolTokensFetched: boolean
  isUsersBalancesFetched: boolean
  approveTx: Transaction
  depositTx: Transaction
  token: TokenWithBalance
  ticket: TokenWithBalance
  amountToDeposit: Amount
  openModal: () => void
}

export const DepositForm = (props: DepositFormProps) => {
  const { form, prizePool, depositTx, amountToDeposit, token, openModal } = props

  const isWalletConnected = useIsWalletConnected()
  const { data: depositAllowance } = useUsersDepositAllowance(prizePool)

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty }
  } = form

  const router = useRouter()

  const setReviewDeposit = (values) => {
    const { query, pathname } = router
    const quantity = values[DEPOSIT_QUANTITY_KEY]
    query[DEPOSIT_QUANTITY_KEY] = quantity
    router.replace({ pathname, query }, null, { scroll: false })
    openModal()
  }

  return (
    <>
      <form onSubmit={handleSubmit(setReviewDeposit)} className='w-full'>
        <div className='w-full mx-auto'>
          <DepositAmountInput
            prizePool={prizePool}
            className=''
            form={form}
            inputKey={DEPOSIT_QUANTITY_KEY}
          />
        </div>

        <DepositInfoBox
          prizePool={prizePool}
          chainId={prizePool.chainId}
          className='mt-3'
          depositTx={depositTx}
          depositAllowance={depositAllowance}
          errorMessages={
            isDirty && !!errors
              ? Object.values(errors).map((e) => (typeof e.message === 'string' ? e.message : null))
              : null
          }
          labelClassName='text-accent-1'
          valueClassName='text-inverse'
          amountToDeposit={amountToDeposit}
        />

        <DepositBottomButton
          className='mt-4 w-full'
          disabled={(!isValid && isDirty) || depositTx?.state === TransactionState.pending}
          depositTx={depositTx}
          isWalletConnected={isWalletConnected}
          chainId={prizePool.chainId}
          amountToDeposit={amountToDeposit}
        />
      </form>
    </>
  )
}

interface DepositBottomButtonProps {
  className?: string
  disabled: boolean
  isWalletConnected: boolean
  chainId: number
  depositTx: Transaction
  amountToDeposit: Amount
}

export const DepositBottomButton = (props: DepositBottomButtonProps) => {
  const { isWalletConnected } = props

  if (!isWalletConnected) {
    return <ConnectWalletButton {...props} />
  }

  return <DepositButton {...props} />
}

const DepositButton = (props: DepositBottomButtonProps) => {
  const { className, chainId, depositTx, disabled, amountToDeposit } = props
  const { t } = useTranslation()

  const amountUnformatted = amountToDeposit?.amountUnformatted

  let label
  if (amountUnformatted?.isZero()) {
    label = t('enterAnAmountToDeposit')
  } else {
    label = t('reviewDeposit')
  }

  return (
    <TxButton
      className={className}
      state={depositTx?.state}
      status={depositTx?.status}
      type='submit'
      chainId={chainId}
    >
      {label}
    </TxButton>
  )
}

export const DepositInfoBox: React.FC<{
  prizePool: PrizePool
  amountToDeposit: Amount
  className?: string
  bgClassName?: string
  depositTx: Transaction
  chainId: number
  depositAllowance?: BigNumber
  labelClassName?: string
  valueClassName?: string
  errorMessages?: string[]
}> = (props) => {
  const {
    prizePool,
    amountToDeposit,
    chainId,
    bgClassName,
    className,
    valueClassName,
    labelClassName,
    depositTx,
    errorMessages
  } = props

  const [isAdvanced, setIsAdvanced] = useState(false)

  const { t } = useTranslation()
  const isError =
    errorMessages && errorMessages.length > 0 && depositTx?.state !== TransactionState.pending
  const messages = errorMessages?.map((message) => (
    <span key={`err-${message}`} className='text-pt-red-light'>
      {message}
    </span>
  ))

  if (depositTx?.state === TransactionState.pending) {
    return (
      <InfoList bgClassName={bgClassName} className={className}>
        <TxReceiptItem
          depositTx={depositTx}
          chainId={chainId}
          labelClassName={labelClassName}
          valueClassName={valueClassName}
        />
      </InfoList>
    )
  }

  return (
    <div
      className={classNames(className, 'relative rounded-lg pl-4 pr-2 py-2', {
        'bg-pt-purple-lighter dark:bg-pt-purple-dark': isError,
        [bgClassName]: !isError
      })}
    >
      <div className={classNames('flex space-x-1 w-full items-center')}>
        <ul className='w-full'>
          {isAdvanced && (
            <>
              <UpdatedPrizePoolOddsListItemBar
                prizePool={prizePool}
                action={EstimateAction.deposit}
                amount={amountToDeposit}
              />
            </>
          )}
          <UpdatedPrizePoolOddsListItem
            prizePool={prizePool}
            action={EstimateAction.deposit}
            amount={amountToDeposit}
            labelClassName={labelClassName}
            valueClassName={valueClassName}
            nullState={'-'}
            className='w-full'
          />
          <TwabRewardsAprItem labelClassName={labelClassName} valueClassName={valueClassName} />
          {isAdvanced && (
            <>
              <UpdatedPrizePoolNetworkOddsListItem
                amount={amountToDeposit}
                action={EstimateAction.deposit}
                prizePool={prizePool}
                labelClassName={labelClassName}
                valueClassName={valueClassName}
                nullState={'-'}
              />
              <PrizePoolNetworkAPRItem
                labelClassName={labelClassName}
                valueClassName={valueClassName}
              />
            </>
          )}

          {isError && (
            <div className='mt-2'>
              <InfoListItem
                label={t('issues', 'Issues')}
                value={<div>{messages}</div>}
                labelClassName={labelClassName}
                valueClassName={valueClassName}
              />
            </div>
          )}
        </ul>

        <button
          className='flex justify-center w-7'
          type='button'
          onClick={() => setIsAdvanced(!isAdvanced)}
        >
          <FeatherIcon
            icon={isAdvanced ? 'chevron-up' : 'chevron-down'}
            className='w-3 h-3 xs:w-5 xs:h-5 opacity-50 hover:opacity-100 transition'
          />
        </button>
      </div>
    </div>
  )
}

DepositInfoBox.defaultProps = {
  bgClassName: 'bg-tertiary'
}
