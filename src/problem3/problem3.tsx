/*
Reviewing the Code:

Type Safety Issues:

blockchain parameter in getPriority is typed as any
Missing interface properties (blockchain isn't defined in WalletBalance)

Performance Issues:

Inconsistent memoization: sortedBalances is memoized but formattedBalances and rows aren't
prices is in dependency array of useMemo but not used in the filtered/sorted calculation
Multiple iterations over the data (filter, sort, two separate maps)


Logic Issues:

Filter logic appears incorrect (returning true when balance <= 0)
Undefined variable lhsPriority in filter function
Sort comparison could be simplified
Unnecessary spread operator in Props destructuring


Anti-patterns:

Using index as key in map iteration
Mixing of concerns (formatting, sorting, and rendering logic)
Magic numbers in priority values
Switch statement could be replaced with object lookup
Not using TypeScript enums for blockchain types

*/

//Refractor codes

// Types and Enums
enum Blockchain {
  Osmosis = 'Osmosis',
  Ethereum = 'Ethereum',
  Arbitrum = 'Arbitrum',
  Zilliqa = 'Zilliqa',
  Neo = 'Neo'
}

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

// Constants
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  [Blockchain.Osmosis]: 100,
  [Blockchain.Ethereum]: 50,
  [Blockchain.Arbitrum]: 30,
  [Blockchain.Zilliqa]: 20,
  [Blockchain.Neo]: 20
};

// Helper functions
const getPriority = (blockchain: Blockchain): number => 
  BLOCKCHAIN_PRIORITY[blockchain] ?? -99;

const formatBalance = (balance: WalletBalance, price: number): FormattedWalletBalance => ({
  ...balance,
  formatted: balance.amount.toFixed(),
  usdValue: price * balance.amount
});

// Component
const WalletPage: React.FC<Props> = ({ ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs, rhs) => 
        getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
      )
      .map(balance => formatBalance(balance, prices[balance.currency]));
  }, [balances, prices]);

  return (
    <div {...rest}>
      {formattedBalances.map((balance) => (
        <WalletRow 
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};

export default WalletPage;
