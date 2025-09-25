import { useEffect, useState } from 'react';
import type { OrderSide } from '@/components/OrderBook/types';

const FLASH_DURATION = 500;

type Props = {
  price: number;
  size: number;
  cumulative: number;
  progressPercent: number;
  baseTextColor: string;
  backgroundColor: string;
  side: OrderSide;
  isNew?: boolean;
  sizeChange?: 'increase' | 'decrease';
};

const OrderRow = ({
  price,
  size,
  cumulative,
  progressPercent,
  baseTextColor,
  backgroundColor,
  side,
  isNew,
  sizeChange,
}: Props) => {
  const [rowHighlight, setRowHighlight] = useState('');
  const [sizeHighlight, setSizeHighlight] = useState('');

  useEffect(() => {
    if (!isNew) return;
    const highlightClass = side === 'bid' ? 'animate-flash-green' : 'animate-flash-red';
    setRowHighlight(highlightClass);
    const timer = setTimeout(() => setRowHighlight(''), FLASH_DURATION);
    return () => clearTimeout(timer);
  }, [isNew, side]);

  useEffect(() => {
    if (!sizeChange) {
      setSizeHighlight('');
      return;
    }
    const highlightClass = sizeChange === 'increase' ? 'animate-flash-green' : 'animate-flash-red';
    setSizeHighlight(highlightClass);
    const timer = setTimeout(() => setSizeHighlight(''), FLASH_DURATION);
    return () => clearTimeout(timer);
  }, [sizeChange, size]);

  return (
    <tr className={`${baseTextColor} hover:bg-[#1E3059] ${rowHighlight}`}>
      <td className="text-left truncate relative align-middle">{price.toLocaleString()}</td>
      <td className={`text-right truncate align-middle ${sizeHighlight}`}>
        {size.toLocaleString()}
      </td>
      <td className="text-right truncate relative align-middle">
        <div
          className="absolute inset-y-0 right-0"
          style={{
            width: `${progressPercent}%`,
            backgroundColor,
          }}
        />
        <span className="relative">{cumulative.toLocaleString()}</span>
      </td>
    </tr>
  );
};

export default OrderRow;
