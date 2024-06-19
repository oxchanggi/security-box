import {
  DirectSecp256k1HdWallet,
  DirectSecp256k1HdWalletOptions,
  DirectSecp256k1Wallet,
  OfflineDirectSigner,
} from '@cosmjs/proto-signing';
import { fromHex, toHex } from '@cosmjs/encoding';
import { Slip10, Slip10Curve, stringToPath } from '@cosmjs/crypto';

const DEFAULT_PATH = "m/44'/118'/0'/0/0"; // inj: "m/44'/60'/0'/0/0"
// can set number words 12 | 15 | 18 | 21 | 24
const NUMBER_WORDS = 12;

const DEFAULT_PREFIX = {
  cosmos: 'cosmos',
  celestia: 'celestia',
  injective: 'inj',
};

export async function createPrivateKey(prefix = DEFAULT_PREFIX.celestia) {
  const opt: DirectSecp256k1HdWalletOptions = {
    bip39Password: '',
    hdPaths: [stringToPath(DEFAULT_PATH)],
    prefix: DEFAULT_PREFIX.celestia,
  };

  const wallet: DirectSecp256k1HdWallet =
    await DirectSecp256k1HdWallet.generate(NUMBER_WORDS, opt);

  const seed = wallet['seed'];
  const { privkey } = Slip10.derivePath(
    Slip10Curve.Secp256k1,
    seed,
    stringToPath(DEFAULT_PATH),
  );
  return toHex(privkey);
}

export async function getSignerFromPrivateKey(
  privKey: string,
  prefix = DEFAULT_PREFIX.celestia,
): Promise<OfflineDirectSigner> {
  return DirectSecp256k1Wallet.fromKey(fromHex(privKey), prefix);
}
