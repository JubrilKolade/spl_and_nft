const fs = require('fs');
const os = require('os');
const path = require('path');
const { Connection, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');
const dotenv = require('dotenv');

dotenv.config();

const DEFAULT_KEYPAIR_PATH = path.join(os.homedir(), '.config', 'solana', 'id.json');

function loadKeypair(keypairPath = process.env.KEYPAIR_PATH || DEFAULT_KEYPAIR_PATH) {
  const raw = fs.readFileSync(keypairPath, 'utf-8');
  const secret = Uint8Array.from(JSON.parse(raw));
  return Keypair.fromSecretKey(secret);
}

function getConnection() {
  const cluster = process.env.SOLANA_CLUSTER || 'devnet';
  const endpoint = process.env.SOLANA_RPC_ENDPOINT || clusterApiUrl(cluster);
  return new Connection(endpoint, 'confirmed');
}

async function requestAirdropIfNeeded(connection, publicKey, minimumSol = 0.5) {
  const balance = await connection.getBalance(publicKey);
  if (balance < minimumSol * LAMPORTS_PER_SOL) {
    console.log(`Requesting airdrop for ${publicKey.toBase58()}...`);
    try {
      const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Airdrop completed.');
    } catch (error) {
      console.warn('Airdrop failed. Please fund your wallet manually if needed:', error.message || error);
    }
  }
}

async function main() {
  const payer = loadKeypair();
  const connection = getConnection();

  console.log('Using wallet:', payer.publicKey.toBase58());
  await requestAirdropIfNeeded(connection, payer.publicKey);

  const decimals = 9;
  const mint = await createMint(connection, payer, payer.publicKey, null, decimals);
  console.log('Created SPL token mint:', mint.toBase58());

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  const amount = BigInt(1_000_000_000); // 1 token with 9 decimals
  await mintTo(connection, payer, mint, tokenAccount.address, payer, amount);

  console.log('Minted to associated token account:', tokenAccount.address.toBase58());
  console.log('SPL token mint created successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
