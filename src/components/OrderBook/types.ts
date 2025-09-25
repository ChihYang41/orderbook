export type Order = {
  price: number;
  size: number;
  cumulative: number;
  cumulativePercentage: number;
  isNew?: boolean;
  sizeChange?: 'increase' | 'decrease';
};

export type OrderSide = 'bid' | 'ask';
