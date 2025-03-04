import { LP_wallet_keypair, LP_wallet_private_key, tokens } from "../settings"
import { createTokenWithMetadata } from "../src/createTokenPinata"
import { logToFile, mainMenuWaiting, outputBalance, saveDataToFile, sleep, tokenLaunchWaiting } from "../src/utils"
import { PoolInfo, UserToken } from '../src/types'
import {
  getWalletTokenAccount,
} from "../src/get_balance";

type WalletTokenAccounts = Awaited<ReturnType<typeof getWalletTokenAccount>>

const execute = async (token: UserToken) => {
  let params: PoolInfo
  try {
      params = {
        mint: null,
        marketId: null,
        poolId: null,
        mainKp: LP_wallet_private_key,
        poolKeys: null,
        removed: false
      }

    await outputBalance(LP_wallet_keypair.publicKey)

    // create token
    logToFile("\n***************************************************************\n")
    let tokenCreationFailed = 0
    while (true) {
      if (tokenCreationFailed > 5) {
        logToFile("Token creation is failed in repetition, Terminate the process")
        return
      }
      const mintResult = await createTokenWithMetadata(token)
      if (!mintResult) {
        logToFile("Token creation error, trying again")
        tokenCreationFailed++
      } else {
        const { amount, mint } = mintResult
        params.mint = mint
        await outputBalance(LP_wallet_keypair.publicKey)
        await sleep(5000)
        saveDataToFile(params)
        break
      }
    }

  } catch (error) {
    logToFile(`Error happened in one of the token flow ${error}`)
  }
}

export const create_token = async () => {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    logToFile(`Token is to be created`)
    await execute(token)
    await sleep(5000)
    logToFile("One token creating process is ended, and go for next step")
    tokenLaunchWaiting()
  }
}
