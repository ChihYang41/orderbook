# BTSE Order Book

A real-time order book viewer for the BTSE BTCPFC perpetual futures contract, built with React 19, TypeScript, Vite, and Tailwind CSS.

## Overview

The app subscribes to the official BTSE WebSocket APIs to stream both incremental order book updates and the latest trade price. Incoming snapshots and deltas are merged in the browser to keep the UI in sync with the exchange, while visual cues highlight price direction, new levels, and size changes.

## Getting Started

### Prerequisites

- Node.js 20 or newer.
- [`pnpm`](https://pnpm.io/) (lockfile included). Install it globally with `npm install -g pnpm` if needed.

### Installation

```bash
pnpm install
```

### Available Scripts

- `pnpm dev` – start the Vite development server with hot module replacement.
- `pnpm build` – type-check the project and produce a production build in `dist/`.
- `pnpm preview` – preview the production build locally.
- `pnpm lint` – run ESLint across the codebase.
- `pnpm format` / `pnpm format:check` – format or verify formatting via Prettier for key source files.

## Project Structure

- `src/components/OrderBook/OrderBook.tsx` – main order book container that stitches the tables and price ticker together.
- `src/components/OrderBook/hooks/useOrderBook.ts` – manages order book state, applies snapshots/deltas, and enforces the eight-level cap.
- `src/components/OrderBook/hooks/useLastPrice.ts` – consumes the trade history WebSocket feed and tracks price direction.
- `src/components/OrderBook/QuoteTable.tsx` & `OrderRow.tsx` – render the ask/bid tables with cumulative totals, depth bars, and animations.
- `src/hooks/useWebsocket.ts` – generic hook providing resilient WebSocket subscriptions with auto-reconnect and manual resubscribe support.
- `docs/SPEC.md` – reference specification for UI colors, animations, and behaviour.

## Customisation

- To visualise a different market, adjust the symbol passed to `useOrderBook` and `useLastPrice` (currently `BTCPFC`).
- Styling tokens and animation definitions live in `src/index.css` and can be tweaked to match alternative themes.
