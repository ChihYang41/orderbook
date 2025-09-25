import LatestPrice from '@/components/OrderBook/LatestPrice';
import QuoteTable from '@/components/OrderBook/QuoteTable';
import useOrderBook from '@/components/OrderBook/hooks/useOrderBook';

const Empty = () => {
  return (
    <div className="flex flex-col items-center p-4 text-[#F0F4F8]">
      <div className="w-80 bg-[#131B29] p-4 rounded-md shadow-md">
        <h2 className="text-lg font-bold text-left">Order Book</h2>
        <div className="flex flex-col justify-center items-center h-40 text-[#8698aa]">
          <span>No Data Available</span>
          <span className="mt-2 text-lg font-bold">-</span>
          <span>No Data Available</span>
        </div>
      </div>
    </div>
  );
};

const OrderBook = () => {
  const { orderBook } = useOrderBook('BTCPFC');
  const { asks, bids } = orderBook;
  const isEmpty = asks.length === 0 && bids.length === 0;

  if (isEmpty) {
    return <Empty />;
  }

  return (
    <div className="flex flex-col items-center p-4 text-[#F0F4F8]">
      <div className="w-80 bg-[#131B29] p-4 rounded-md shadow-md">
        <h2 className="text-lg font-bold text-left">Order Book</h2>
        <QuoteTable orders={asks} side="ask" showHeader />
        <LatestPrice />
        <QuoteTable orders={bids} side="bid" />
      </div>
    </div>
  );
};

export default OrderBook;
