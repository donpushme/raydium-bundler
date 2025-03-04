import { ComputeBudgetProgram, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { balanceCheckWaiting, logToFile, mainMenuWaiting, outputBalance, readBundlerWallets, readHolderWallets, readJson, saveBundlerWalletsToFile, sleep } from "../src/utils";
import { cluster, connection, mainnetRpc } from "../config";
import { Bundler_provider_wallet_keypair, bundlerWalletName, bundleWalletNum, distNum, holderWalletName, LP_wallet_keypair, tokens } from "../settings"
import bs58 from 'bs58'
import { screen_clear } from "../menu/menu";
import { execute } from "../src/legacy";
import { createCloseAccountInstruction, getAssociatedTokenAddress, NATIVE_MINT } from "@solana/spl-token";
import { WSOL } from "@raydium-io/raydium-sdk";

const walletNum = bundleWalletNum

export const show_holders = async () => {
    screen_clear()

    const holderWallets: string[] = readHolderWallets(holderWalletName)
    const bundlerWallets: string[] = readBundlerWallets(bundlerWalletName)
    const totalSupply = tokens[0].uiAmount

    // const holderWallets = totalSubWallets.filter((wallet: string, i) => i % (distNum + 1) !== 0)
    const data = readJson()
    const baseMint = new PublicKey(data.mint!)

    try {
        let totalBundlerTokenBalance = 0
        for (let i = 0; i < holderWallets.length; i++) {
            const kp = Keypair.fromSecretKey(bs58.decode(holderWallets[i]))
            const solBal = (await connection.getBalance(kp.publicKey)) / LAMPORTS_PER_SOL
            try {
                const tokenAta = await getAssociatedTokenAddress(baseMint, kp.publicKey)
                // const wsolAta = await getAssociatedTokenAddress(new PublicKey(WSOL.mint), kp.publicKey)
                const tokenBal = (await connection.getTokenAccountBalance(tokenAta)).value.uiAmount
                totalBundlerTokenBalance += tokenBal!
                // const wsolBal = await (await connection.getTokenAccountBalance(wsolAta)).value.uiAmount
                logToFile(`  Balance of holder${(i) % distNum + 1} ${kp.publicKey.toBase58()} -> Sol: ${solBal}sol, Token: ${Math.round(Number(tokenBal))}  ${tokens[0].symbol}, ${tokenBal! * 100 / tokens[0].uiAmount}%`)
            } catch (err) {
                logToFile(`  Balance of holder${(i) % distNum + 1} ${kp.publicKey.toBase58()} -> Sol: ${solBal}sol`)
            }
            
            if((i) % distNum == (distNum - 1)) {
                try {
                    const bundler = Keypair.fromSecretKey(bs58.decode(bundlerWallets[i / distNum]))
                    const bundlerAta = await getAssociatedTokenAddress(baseMint, bundler.publicKey)
                    const bundlerBalance = await (await connection.getTokenAccountBalance(bundlerAta)).value.uiAmount
                    totalBundlerTokenBalance += bundlerBalance!
                    logToFile(`Bundler ${Math.floor(i / distNum) + 1} => ${totalBundlerTokenBalance * 100 / totalSupply}%`)
                } catch (error) {
                    logToFile(`Bundler ${Math.floor(i / distNum) + 1} => ${totalBundlerTokenBalance * 100 / totalSupply}%`)
                }
                totalBundlerTokenBalance = 0
            }
        }
    } catch (err) {
        logToFile("Fail to get the balance of holder wallets. Please retry...")
        balanceCheckWaiting()
    }

    await outputBalance(LP_wallet_keypair.publicKey)
    await outputBalance(Bundler_provider_wallet_keypair.publicKey)
    balanceCheckWaiting()
}
