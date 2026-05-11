const fs = require('fs');
const os = require('os');
const path = require('path');
const { Connection, Keypair, clusterApiUrl } = require('@solana/web3.js');
const { Metaplex, keypairIdentity, mockStorage } = require('@metaplex-foundation/js');
const { TokenStandard } = require('@metaplex-foundation/mpl-token-metadata');
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

async function main() {
  const payer = loadKeypair();
  const connection = getConnection();

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(mockStorage());

  const metadata = {
    name: 'MPL Core Programmable NFT',
    symbol: 'MPLNFT',
    description: 'A programmable NFT created using Metaplex JS and MPL Core.',
    image: 'https://placekitten.com/512/512',
    attributes: [
      { trait_type: 'Category', value: 'Assignment Demo' },
      { trait_type: 'Plugin', value: 'Programmable NFT' }
    ]
  };

  console.log('Uploading metadata...');
  const { uri } = await metaplex.nfts().uploadMetadata(metadata);
  console.log('Metadata URI:', uri);

  console.log('Minting programmable NFT...');
  const { nft, mintAddress, metadataAddress, tokenAddress } = await metaplex.nfts().create({
    uri,
    name: metadata.name,
    symbol: metadata.symbol,
    sellerFeeBasisPoints: 500,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    tokenOwner: payer.publicKey,
    isMutable: true,
    primarySaleHappened: false
  });

  console.log('NFT mint address:', mintAddress.toBase58());
  console.log('NFT metadata address:', metadataAddress.toBase58());
  console.log('NFT token account:', tokenAddress.toBase58());
  console.log('Programmable NFT created successfully.');
  console.log('NFT address:', nft.address.toBase58());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
