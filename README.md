# Dust

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/) [![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/) [![Prettier](https://img.shields.io/badge/Code%20Style-Prettier-green.svg)](https://github.com/prettier/prettier) [![ESLint](https://img.shields.io/badge/Code%20Style-ESLint-blueviolet)](https://eslint.org/) [![imports](https://img.shields.io/badge/%20imports-unused-red)](https://github.com/sweeetio/eslint-plugin-unused-imports) [![Vitest](https://img.shields.io/badge/Test-Vitest-brightgreen)](https://vitest.dev/)

> **The fastest way to sell multiple tokens across EVM chains.**

> 🚨 **Important**: The official project URL is [https://dustoff.fun](https://dustoff.fun). Do not trust other clones — they may be scams!

**Dust** is a lightweight Next.js-based dApp designed to streamline multi-token sales across EVM-compatible chains. It supports up to six tokens in one transaction, filters burn-only assets, and routes transactions using ODOS and The Graph, with token data fetched via Blockscout APIs.

## Table of contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Linting](#linting)
- [Contributing](#contributing)
- [Feedback](#feedback)
- [License](#license)
- [Support this project](#support-this-project)

## Features

- 🔄 **Sell up to 6 tokens simultaneously** — batch sales for efficiency and lower gas fees _(more tokens coming soon)_
- 🌙 **Direct Lite Mode** — clean UI optimized for speed and low-cost operations
- 🔎 **Smart token filtering** — separates sellable tokens from burn-only ones _(burn feature coming soon)_
- 🔗 **Multi-chain EVM support** — compatible with major EVM networks out of the box
- 🧠 **Subgraph integration** — fast, spam-resistant token pair indexing using The Graph
- 📦 **ODOS aggregator support** — get the best prices via quote and route optimization
- 🔍 **Blockscout API integration** — real-time token metadata, balances, and contract info
- ⚙️ **Developer-focused** — TypeScript-first, modular architecture, linting, and formatting built-in

## Project Structure

To run the project locally:

### 1. Clone and configure

```bash
cp .env.example .env
# then edit `.env` to provide necessary values
```

### 2. Install dependencies

```bash
bun install
```

### 3. Start the dev server

```bash
bun run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

Dust uses **Vitest** for testing core logic and components.

To run tests:

```bash
bun run test
```

All test files are named using the `.test.ts` convention.

## Linting

Ensure code quality by running:

```bash
bun run lint
```

To fix common issues automatically:

```bash
bun run lint --fix
```

## Contributing

We welcome contributions! Here’s how to get started:

1. Fork the repository
2. Create a branch:

   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/my-bug
   ```

3. Make and commit your changes
4. Push to your fork:

   ```bash
   git push origin feature/my-feature
   ```

5. Open a pull request with a clear description

> ✅ Before submitting, run `bun run lint` and `bun run test` to ensure everything passes.

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

## Feedback

We would love to hear your thoughts, suggestions, and any issues you encounter while using **Dust**

> 📢 Send your feedback via our official Telegram support group: https://t.me/+0j9GpMQpGsU5MWQy

Your feedback helps us improve!

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Support this project

If you find this project useful, consider donating:

- EVM chains: `0xdeval.eth`
- TON: `UQBbNb-uvZw-kTzwXmflzMOLG8y38y9YtXiiE4MJAKuFxf71`
- Solana: `6i554tryeKSktWCyKqyRwYnaGcByaNp4zs7pifHoTmj9`
- Bitcoin: `bc1pc75tm7a5khf5cfnww80grl3lzpqwjcy8v7a65rkzq4aafyvrkw8sxspltj`
