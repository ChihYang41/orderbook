import ArrowIcon from '@/components/ArrowIcon';
import useLastPrice from '@/components/OrderBook/hooks/useLastPrice';

const LatestPrice = () => {
  const { lastPrice, direction } = useLastPrice('BTCPFC');

  const directionStyles = {
    up: {
      background: 'rgba(16, 186, 104, 0.12)',
      textClass: 'text-[#00b15d]',
    },
    down: {
      background: 'rgba(255, 90, 90, 0.12)',
      textClass: 'text-[#FF5B5A]',
    },
    neutral: {
      background: 'rgba(134, 152, 170, 0.12)',
      textClass: 'text-[#F0F4F8]',
    },
  } as const;

  const { background, textClass } = directionStyles[direction];

  return (
    <div
      className={`flex items-center justify-center my-2 font-bold text-lg transition-colors duration-300 px-3 py-2 rounded ${textClass}`}
      style={{ backgroundColor: background }}
    >
      <span>{lastPrice ? lastPrice.toLocaleString() : '-'}</span>
      {lastPrice && direction !== 'neutral' && (
        <ArrowIcon className="ml-1" direction={direction} color={textClass} size={18} />
      )}
    </div>
  );
};

export default LatestPrice;
