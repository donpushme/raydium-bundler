import { logToFile, mainMenuWaiting, prepareBundleWaiting, sleep } from "../src/utils"
import { getWalletTokenAccount } from "../src/get_balance";
import { extendLutSimulate } from "../src/extendLutSimulate";

type WalletTokenAccounts = Awaited<ReturnType<typeof getWalletTokenAccount>>

const execute = async () => {
  try {
    await extendLutSimulate()
  } catch (error) {
    console.log("Error happened in one of the token flow", error)
  }
}

export const simulate = async () => {
    logToFile("Creating Pool and Bundle Buy Simulation and Extending Lookuptable Process Started...")
    await execute()
}
