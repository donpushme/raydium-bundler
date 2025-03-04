import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { balanceCheckWaiting, logToFile, outputBalance, readBundlerWallets, readJson } from "../src/utils";
import { connection } from "../config";
import { Bundler_provider_wallet_keypair, bundlerWalletName, bundleWalletNum, LP_wallet_keypair, tokens } from "../settings"
import bs58 from 'bs58'
import { screen_clear } from "../menu/menu";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { WSOL } from "@raydium-io/raydium-sdk";

const walletNum = bundleWalletNum

export const show_bundlers = async () => {
    screen_clear()

    const bundlerWallets: string[] = readBundlerWallets(bundlerWalletName)
    const data = readJson()
    const baseMint = new PublicKey(data.mint!)

    try {
        for (let i = 0; i < bundlerWallets.length; i++) {
            const kp = Keypair.fromSecretKey(bs58.decode(bundlerWallets[i]))
            const solBal = (await connection.getBalance(kp.publicKey)) / LAMPORTS_PER_SOL
            try {
                const tokenAta = await getAssociatedTokenAddress(baseMint, kp.publicKey)
                const wsolAta = await getAssociatedTokenAddress(new PublicKey(WSOL.mint), kp.publicKey)
                const tokenBal = (await connection.getTokenAccountBalance(tokenAta)).value.uiAmount
                const wsolBal = await (await connection.getTokenAccountBalance(wsolAta)).value.uiAmount
                logToFile(`Balance of bundler${i + 1} ${kp.publicKey.toBase58()}=> Sol: ${solBal}sol, WSOL: ${wsolBal}wsol, Token: ${tokenBal}  ${tokens[0].symbol}, ${tokenBal! * 100 / tokens[0].uiAmount}%`)
            } catch (err) {
                logToFile(`Balance of bundler${i + 1} ${kp.publicKey.toBase58()}=> Sol: ${solBal}sol`)
            }
            
        }
    } catch (err) {
        logToFile("Fail to get the balance of bundler wallets. Please retry...")
        balanceCheckWaiting()
    }

    await outputBalance(LP_wallet_keypair.publicKey)
    await outputBalance(Bundler_provider_wallet_keypair.publicKey)
    balanceCheckWaiting()
}
