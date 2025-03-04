import { Keypair } from "@solana/web3.js";
import { logToFile, saveBundlerWalletsToFile, tokenLaunchWaiting } from "../src/utils";
import { bundleWalletNum, distNum, distWalletNum, holderWalletName } from "../settings"
import { screen_clear } from "../menu/menu";
import base58 from "bs58";

export const holder_create = async () => {
  screen_clear()
  logToFile("creating holder wallets")

  const distWallets = []
  try {
    for (let i = 0; i < distWalletNum; i++) {
      const kp = Keypair.generate()
      distWallets.push(base58.encode(kp.secretKey))
    }
    saveBundlerWalletsToFile(
      distWallets, holderWalletName
    )
    for (let i = 0; i < bundleWalletNum; i++) {
      logToFile(`Bundler ${i + 1} => `)
      for(let j = 0; j < distNum; j++) {
        logToFile(`  Holder ${j + 1}: ${distWallets[i * distNum + j]}`)
      }
    }
  } catch (err) { }

  tokenLaunchWaiting()
}
