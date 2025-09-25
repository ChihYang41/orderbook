import { describe, expect, it } from 'vitest';
import { calculateCumulative } from '@/components/OrderBook/hooks/utils';
import {
  applyDelta,
  applySideDelta,
  applySnapshot,
  buildSnapshotSide,
  toNumericLevel,
} from '@/components/OrderBook/hooks/useOrderBook';

describe('toNumericLevel', () => {
  it('parses string price and size into numeric tuple', () => {
    expect(toNumericLevel(['100.5', '2.25'])).toEqual([100.5, 2.25]);
  });

  it('returns null when price or size are not finite numbers', () => {
    expect(toNumericLevel(['abc', '1'])).toBeNull();
    expect(toNumericLevel(['100', 'not-a-number'])).toBeNull();
  });
});

describe('calculateCumulative', () => {
  it('sorts bids descending, limits to eight entries, and computes totals', () => {
    const levels: Array<[number, number]> = [
      [100, 1],
      [101, 2],
      [99, 3],
      [102, 4],
      [98, 5],
      [97, 6],
      [96, 7],
      [95, 8],
      [94, 9],
    ];

    const result = calculateCumulative(levels, true);

    expect(result).toHaveLength(8);
    expect(result.map((order) => order.price)).toEqual([
      102, 101, 100, 99, 98, 97, 96, 95,
    ]);
    expect(result.map((order) => order.cumulative)).toEqual([
      4, 6, 7, 10, 15, 21, 28, 36,
    ]);
    expect(result[0].cumulativePercentage).toBeCloseTo((4 / 36) * 100, 5);
  });

  it('reverses asks for display and preserves metadata flags', () => {
    const levels: Array<[number, number]> = [
      [99, 1],
      [100, 2],
      [101, 3],
    ];
    const metadata = new Map<number, { isNew?: boolean; sizeChange?: 'increase' | 'decrease' }>([
      [101, { isNew: true }],
      [99, { sizeChange: 'decrease' }],
    ]);

    const result = calculateCumulative(levels, false, metadata);

    expect(result.map((order) => order.price)).toEqual([101, 100, 99]);
    expect(result.map((order) => order.cumulative)).toEqual([6, 3, 1]);
    expect(result[0].isNew).toBe(true);
    expect(result.at(-1)?.sizeChange).toBe('decrease');
  });

  it('returns empty array when no valid orders are provided', () => {
    const result = calculateCumulative([], true);
    expect(result).toEqual([]);
  });

  it('keeps metadata only for prices that exist in the result set', () => {
    const metadata = new Map<number, { isNew?: boolean; sizeChange?: 'increase' | 'decrease' }>([
      [101, { isNew: true }],
      [999, { sizeChange: 'increase' }],
    ]);
    const result = calculateCumulative(
      [
        [101, 2],
        [100, 3],
      ],
      true,
      metadata
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ price: 101, isNew: true });
    expect(result[1]).not.toHaveProperty('sizeChange');
  });
});

describe('snapshot and delta transforms', () => {
  it('builds snapshots from string levels', () => {
    const snapshot: Parameters<typeof applySnapshot>[0] = {
      type: 'snapshot',
      seqNum: 1,
      bids: [
        ['100', '1'],
        ['101', '2'],
      ],
      asks: [
        ['105', '3'],
        ['104', '4'],
      ],
    };

    const built = applySnapshot(snapshot);

    expect(built.bids.map((order) => order.price)).toEqual([101, 100]);
    expect(built.asks.map((order) => order.price)).toEqual([105, 104]);
  });

  it('handles delta updates with new, updated, and removed levels', () => {
    const baseBids = buildSnapshotSide(
      [
        ['101', '1'],
        ['100', '1'],
      ] as [string, string][],
      'bid'
    );
    const baseAsks = buildSnapshotSide(
      [
        ['102', '1'],
        ['103', '1'],
      ] as [string, string][],
      'ask'
    );

    const nextBids = applySideDelta(
      baseBids,
      [
        ['104', '2'],
        ['101', '3'],
        ['100', '0'],
      ] as [string, string][],
      'bid'
    );
    const nextAsks = applySideDelta(
      baseAsks,
      [
        ['103', '2'],
        ['105', '1'],
      ] as [string, string][],
      'ask'
    );

    expect(nextBids.map((order) => order.price)).toEqual([104, 101]);
    expect(nextBids[0].isNew).toBe(true);
    expect(nextBids[1].sizeChange).toBe('increase');

    expect(nextAsks.map((order) => order.price)).toEqual([105, 103, 102]);
    expect(nextAsks[0].isNew).toBe(true);
    expect(nextAsks[1].sizeChange).toBe('increase');
  });

  it('applies deltas to both sides', () => {
    const state = applySnapshot({
      type: 'snapshot',
      seqNum: 1,
      bids: [
        ['100', '2'],
        ['99', '1'],
      ] as [string, string][],
      asks: [
        ['101', '3'],
        ['102', '1'],
      ] as [string, string][],
    });

    const delta: Parameters<typeof applyDelta>[1] = {
      type: 'delta',
      seqNum: 2,
      prevSeqNum: 1,
      bids: [
        ['100', '3'],
        ['98', '1'],
      ],
      asks: [
        ['101', '0'],
        ['103', '4'],
      ],
    };

    const next = applyDelta(state, delta);

    expect(next.bids.map((order) => order.price)).toEqual([100, 99, 98]);
    expect(next.bids[0].sizeChange).toBe('increase');
    expect(next.asks.map((order) => order.price)).toEqual([103, 102]);
    expect(next.asks[0].isNew).toBe(true);
  });
});
