# SPL and NFT Minting

This repository contains a simple Solana developer project for:

- Minting an SPL token on Solana.
- Minting a programmable NFT using Metaplex JS and MPL Core.
- Demonstrating a Metaplex core plugin via a programmable NFT token standard.

## Setup

1. Copy `.env.example` to `.env` if you want to configure a custom wallet path or RPC endpoint.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Ensure your wallet keypair exists at `~/.config/solana/id.json`, or set `KEYPAIR_PATH` in `.env`.

## Scripts

- `npm run mint:spl` — create a new SPL token mint, mint tokens to your wallet.
- `npm run mint:nft` — create a programmable NFT with Metaplex and MPL Core.

## Notes

- The NFT script uses a programmable NFT (`TokenStandard.ProgrammableNonFungible`) to demonstrate an MPL Core plugin / programmable asset flow.
- Metadata is uploaded with Metaplex `mockStorage` for demonstration in script form.
- If Devnet faucet airdrops fail, use a funded wallet or a different RPC endpoint.
- Use `SOLANA_CLUSTER=devnet` or set `SOLANA_RPC_ENDPOINT` for a different network.
