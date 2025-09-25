import { useRef, useState } from 'react';
import useWebSocket from '@/hooks/useWebsocket';

type TradeData = {
  data: {
    price: number;
    side: 'BUY' | 'SELL';
  }[];
};

const useLastPrice = (symbol: string) => {
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const previousPriceRef = useRef<number | null>(null);

  useWebSocket<TradeData>(
    `wss://ws.btse.com/ws/futures`,
    `tradeHistoryApi:${symbol}`,
    ({ data }) => {
      if (!data || !data.length) return;
      const { price } = data[0];

      const previousPrice = previousPriceRef.current;
      let nextDirection: 'up' | 'down' | 'neutral' = 'neutral';
      if (typeof previousPrice === 'number') {
        if (price > previousPrice) nextDirection = 'up';
        else if (price < previousPrice) nextDirection = 'down';
      }

      setLastPrice(price);
      setDirection(nextDirection);
      previousPriceRef.current = price;
    }
  );

  return { lastPrice, direction };
};

export default useLastPrice;
