import OrderRow from '@/components/OrderBook/OrderRow';
import type { Order, OrderSide } from '@/components/OrderBook/types';

const SIDE_STYLES: Record<OrderSide, { textClass: string; backgroundColor: string }> = {
  ask: {
    textClass: 'text-[#FF5B5A]',
    backgroundColor: 'rgba(255, 90, 90, 0.12)',
  },
  bid: {
    textClass: 'text-[#00b15d]',
    backgroundColor: 'rgba(16, 186, 104, 0.12)',
  },
};

type QuoteTableProps = {
  orders: Order[];
  side: OrderSide;
  showHeader?: boolean;
};

const QuoteTable = ({ orders, side, showHeader = false }: QuoteTableProps) => {
  const { textClass, backgroundColor } = SIDE_STYLES[side];

  return (
    <div className="grid grid-cols-1 gap-2">
      <table className="w-full text-sm text-[#8698aa] table-fixed border-spacing-0">
        {showHeader && (
          <thead>
            <tr className="text-xs">
              <th className="text-left w-1/3 truncate">Price (USD)</th>
              <th className="text-right w-1/3 truncate">Size</th>
              <th className="text-right w-1/3 truncate">Total</th>
            </tr>
          </thead>
        )}
        <tbody>
          {orders.map(({ price, size, cumulative, cumulativePercentage, isNew, sizeChange }) => (
            <OrderRow
              key={price}
              price={price}
              size={size}
              cumulative={cumulative}
              progressPercent={cumulativePercentage}
              baseTextColor={textClass}
              backgroundColor={backgroundColor}
              side={side}
              isNew={isNew}
              sizeChange={sizeChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuoteTable;
