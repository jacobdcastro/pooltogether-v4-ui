import { unionProbabilities } from '@utils/unionProbabilities'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { EstimateAction } from '../../../constants/odds'
import { useAllUsersPrizePoolOdds } from '../PrizePool/useAllUsersPrizePoolOdds'
import { usePrizePoolNetwork } from './usePrizePoolNetwork'

/**
 * Calculates the users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useUsersPrizePoolNetworkOdds = (
  usersAddress: string,
  actions: {
    [prizePoolId: string]: {
      action: EstimateAction
      actionAmountUnformatted: BigNumber
    }
  } = {}
) => {
  const prizePoolNetwork = usePrizePoolNetwork()
  const queryResults = useAllUsersPrizePoolOdds(usersAddress, actions)
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)

  return useQuery(
    [
      'useUsersPrizePoolNetworkOdds',
      prizePoolNetwork?.id(),
      usersAddress,
      queryResults.map((queryResult) => queryResult.data?.odds).join('-'),
      Object.keys(actions)?.join('-'),
      Object.values(actions)
        ?.map(({ action, actionAmountUnformatted }) => action + actionAmountUnformatted?.toString())
        .join('-')
    ],
    () => {
      const odds = unionProbabilities(...queryResults.map((queryResult) => queryResult.data.odds))
      const oneOverOdds = 1 / odds

      return {
        prizePoolNetworkId: prizePoolNetwork.id(),
        usersAddress,
        odds,
        oneOverOdds
      }
    },
    { enabled: isFetched }
  )
}
