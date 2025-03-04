import { ComputeBudgetProgram, Keypair, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js"
import {
    DEVNET_PROGRAM_ID,
    jsonInfo2PoolKeys,
    Liquidity,
    MAINNET_PROGRAM_ID,
    MARKET_STATE_LAYOUT_V3, LiquidityPoolKeys,
} from "@raydium-io/raydium-sdk"
import { getAssociatedTokenAddress, getMint, NATIVE_MINT, unpackMint } from "@solana/spl-token";
import bs58 from "bs58"
import { logToFile, mainMenuWaiting, outputBalance, readBundlerWallets, readJson, sellBuyWaiting, sleep } from "../src/utils"
import {
    connection,
    cluster,
} from "../config";
import {
    bundlerWalletName,
    bundleWalletNum,
    Bundler_provider_wallet_keypair,
    LP_wallet_keypair
} from "../settings"

import { executeVersionedTx } from "../src/execute";
import { rl } from "../menu/menu";

const programId = cluster == "devnet" ? DEVNET_PROGRAM_ID : MAINNET_PROGRAM_ID

export async function manual_each_sell() {
    const wallets = readBundlerWallets(bundlerWalletName)
    const data = readJson()

    const walletKPs = wallets.map((wallet: string) => Keypair.fromSecretKey(bs58.decode(wallet)));

    logToFile(`Main Wallet Address: ${LP_wallet_keypair.publicKey.toString()}`);
    logToFile(`Bundler Wallet Address: ${Bundler_provider_wallet_keypair.publicKey.toString()}`);

    let totalTokenBalance = 0
    const baseMint = new PublicKey(data.mint!)

    for (let i = 0; i < bundleWalletNum; i++) {
        const baseAta = await getAssociatedTokenAddress(baseMint, walletKPs[i].publicKey)
        const tokenBalance = (await connection.getTokenAccountBalance(baseAta)).value.uiAmount
        if (tokenBalance) totalTokenBalance = totalTokenBalance + tokenBalance
    }
    logToFile(`Total Token Balance: ${totalTokenBalance}`)
    logToFile("Please input the numbers of bundler wallets to sell.")

    let params: any = {
        mint: data.mint ? new PublicKey(data.mint) : null,
        marketId: data.marketId ? new PublicKey(data.marketId) : null,
        poolId: data.poolId ? new PublicKey(data.poolId) : null,
        mainKp: data.mainKp,
        poolKeys: data.poolKeys,
        removed: data.removed
    }

    rl.question("\t[Number of bundler wallets] - (if you want to go back, press c and press enter) : ", async (answer: string) => {

        if (answer == 'c') {
            sellBuyWaiting()
            return
        }

        const numberStrings = answer.split(/\s+/); // This regex handles multiple spaces between numbers
        const numbers = numberStrings.map(numStr => Number(numStr)).filter(num => !isNaN(num));
        const selectedBundlerWallets: Keypair[] = numbers.map(index => walletKPs[index - 1]);

        rl.question("\t[Percentage of wallet to Sell] - (if you want to go back, press c and press enter) : ", async (answer: string) => {
        
            if (answer == 'c') {
                manual_each_sell()
                return
            }

            const percent = Number(answer)
    
            if (!params.marketId) {
                logToFile("Market Id is not set.");
                sellBuyWaiting();
            } else {
                const marketBufferInfo = await connection.getAccountInfo(params.marketId);
                if (!marketBufferInfo) return;
                const {
                    baseMint,
                    quoteMint,
                    baseLotSize,
                    quoteLotSize,
                    baseVault: marketBaseVault,
                    quoteVault: marketQuoteVault,
                    bids: marketBids,
                    asks: marketAsks,
                    eventQueue: marketEventQueue
                } = MARKET_STATE_LAYOUT_V3.decode(marketBufferInfo.data);
    
                const accountInfo_base = await connection.getAccountInfo(baseMint);
                if (!accountInfo_base) return;
                const baseTokenProgramId = accountInfo_base.owner;
                const baseDecimals = unpackMint(
                    baseMint,
                    accountInfo_base,
                    baseTokenProgramId
                ).decimals;
    
                const accountInfo_quote = await connection.getAccountInfo(quoteMint);
                if (!accountInfo_quote) return;
                const quoteTokenProgramId = accountInfo_quote.owner;
                const quoteDecimals = unpackMint(
                    quoteMint,
                    accountInfo_quote,
                    quoteTokenProgramId
                ).decimals;
    
                const associatedPoolKeys = await Liquidity.getAssociatedPoolKeys({
                    version: 4,
                    marketVersion: 3,
                    baseMint,
                    quoteMint,
                    baseDecimals,
                    quoteDecimals,
                    marketId: params.marketId,
                    programId: programId.AmmV4,
                    marketProgramId: programId.OPENBOOK_MARKET,
                });
                params.poolId = associatedPoolKeys.id
                params.poolKeys = associatedPoolKeys
    
                const targetPoolInfo = {
                    id: associatedPoolKeys.id.toString(),
                    baseMint: associatedPoolKeys.baseMint.toString(),
                    quoteMint: associatedPoolKeys.quoteMint.toString(),
                    lpMint: associatedPoolKeys.lpMint.toString(),
                    baseDecimals: associatedPoolKeys.baseDecimals,
                    quoteDecimals: associatedPoolKeys.quoteDecimals,
                    lpDecimals: associatedPoolKeys.lpDecimals,
                    version: 4,
                    programId: associatedPoolKeys.programId.toString(),
                    authority: associatedPoolKeys.authority.toString(),
                    openOrders: associatedPoolKeys.openOrders.toString(),
                    targetOrders: associatedPoolKeys.targetOrders.toString(),
                    baseVault: associatedPoolKeys.baseVault.toString(),
                    quoteVault: associatedPoolKeys.quoteVault.toString(),
                    withdrawQueue: associatedPoolKeys.withdrawQueue.toString(),
                    lpVault: associatedPoolKeys.lpVault.toString(),
                    marketVersion: 3,
                    marketProgramId: associatedPoolKeys.marketProgramId.toString(),
                    marketId: associatedPoolKeys.marketId.toString(),
                    marketAuthority: associatedPoolKeys.marketAuthority.toString(),
                    marketBaseVault: marketBaseVault.toString(),
                    marketQuoteVault: marketQuoteVault.toString(),
                    marketBids: marketBids.toString(),
                    marketAsks: marketAsks.toString(),
                    marketEventQueue: marketEventQueue.toString(),
                    lookupTableAccount: PublicKey.default.toString(),
                };
    
                const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys;
    
                logToFile("\n -------- Now getting swap instructions --------");
    
                const baseInfo = await getMint(connection, baseMint)
                if (baseInfo == null) {
                    return null
                }
    
                for (let i = 0; i < selectedBundlerWallets.length; i++) {
    
                    logToFile(`\nProcessing bundler ${i + 1} ...`)
    
                    const txs: TransactionInstruction[] = [];
                    const ixs: TransactionInstruction[] = [
                        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 744_452 }),
                        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_183_504 })
                    ]
    
                    const quoteAta = await getAssociatedTokenAddress(NATIVE_MINT, selectedBundlerWallets[i].publicKey)
                    const baseAta = await getAssociatedTokenAddress(baseMint, selectedBundlerWallets[i].publicKey)
                    const tokenAmount = (await connection.getTokenAccountBalance(baseAta)).value
                    const tokenBalance = tokenAmount.uiAmount
                    const tokenDecimal = tokenAmount.decimals
                    const sellAmount = Math.floor(tokenBalance! * 10 ** tokenDecimal) * percent / 100
    
                    logToFile(`Sell amount from this wallet: ${sellAmount}, ${percent}% of balance`)
    
                    const keypair = selectedBundlerWallets[i]
    
                    if (tokenBalance) {
                        const { innerTransaction: innerBuyIx } = Liquidity.makeSwapFixedInInstruction(
                            {
                                poolKeys: poolKeys,
                                userKeys: {
                                    tokenAccountIn: baseAta,
                                    tokenAccountOut: quoteAta,
                                    owner: keypair.publicKey,
                                },
                                amountIn: sellAmount.toString(),
                                minAmountOut: 0,
                            },
                            poolKeys.version,
                        );
                        ixs.push(...innerBuyIx.instructions)
                    }
    
                    const buyRecentBlockhash = (await connection.getLatestBlockhash().catch(async () => {
                        return await connection.getLatestBlockhash().catch(getLatestBlockhashError => {
                            console.log({ getLatestBlockhashError })
                            return null
                        })
                    }))?.blockhash;
                    if (!buyRecentBlockhash) return { Err: "Failed to prepare transaction" }
                    const swapVersionedTransaction = new VersionedTransaction(
                        new TransactionMessage({
                            payerKey: selectedBundlerWallets[i].publicKey,
                            recentBlockhash: buyRecentBlockhash,
                            instructions: ixs,
                        }).compileToV0Message()
                    );
                    logToFile(`Transaction size with address lookuptable: ${swapVersionedTransaction.serialize().length}bytes`);
    
                    swapVersionedTransaction.sign([keypair])
    
                    logToFile("-------- swap coin instructions [DONE] ---------")
    
                    console.log((await connection.simulateTransaction(swapVersionedTransaction)))
    
                    const buySig = await executeVersionedTx(swapVersionedTransaction)
                    const tokenBuyTx = buySig ? `https://solscan.io/tx/${buySig}${cluster == "devnet" ? "?cluster=devnet" : ""}` : ''
                    logToFile(`Token sold: ${tokenBuyTx}`)
                }
    
                await outputBalance(LP_wallet_keypair.publicKey)
                await outputBalance(Bundler_provider_wallet_keypair.publicKey)
                // swap ix end ------------------------------------------------------------
    
                await sleep(5000)
    
                totalTokenBalance = 0
    
                for (let i = 0; i < bundleWalletNum; i++) {
                    const baseAta = await getAssociatedTokenAddress(baseMint, walletKPs[i].publicKey)
                    const tokenBalance = (await connection.getTokenAccountBalance(baseAta)).value.uiAmount
                    if (tokenBalance) totalTokenBalance = totalTokenBalance + tokenBalance
                }
                logToFile(`Total Token Balance after each sell: ${totalTokenBalance}`)
    
                sellBuyWaiting()
            }
        })

    })
}