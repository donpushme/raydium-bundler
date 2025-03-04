import readline from "readline"
import { logToFile } from "../src/utils";

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

export const screen_clear = () => {
    console.clear();
}

export const main_menu_display = () => {
    logToFile('\t[1] - Token Launch');
    logToFile('\t[2] - Token Holders');
    logToFile('\t[3] - Token Sell & Buy');
    logToFile('\t[4] - Gather Sol from bundler wallets');
    logToFile('\t[5] - Balance of bundlers and holders');
    logToFile('\t[6] - Exit');
}

export const token_launch_display = () => {
    logToFile('\t[1] - Pre simulate before everything');
    logToFile('\t[2] - Create Token');
    logToFile('\t[3] - Security checks');
    logToFile('\t[4] - Create Market');
    logToFile('\t[5] - Prepare for Bundle');
    logToFile('\t[6] - Create holder wallets');
    logToFile('\t[7] - Create Pool And BundleBuy');
    logToFile('\t[8] - Burn LP token');
    logToFile('\t[9] - Back');
    logToFile('\t[10] - Exit');
}

export const token_holders_display = () => {
    logToFile('\t[1] - Distribute Token to HolderWallets');
    logToFile('\t[2] - Gather selected Token to BundlerWallets');
    logToFile('\t[3] - Gather all Token to BundlerWallets');
    logToFile('\t[4] - Back');
    logToFile('\t[5] - Exit');
}

export const token_sell_buy_display = () => {
    logToFile('\t[1] - Sell tokens partially');
    logToFile('\t[2] - Sell tokens from each Bundler');
    logToFile('\t[3] - Rebuy tokens partially');
    logToFile('\t[4] - Remove liquidity')
    logToFile('\t[5] - Back');
    logToFile('\t[6] - Exit');
}

export const gather_display = () => {
    logToFile('\t[1] - Gather Sol from all bundler wallets');
    logToFile('\t[2] - Gather Wsol from one bundler wallet');
    logToFile('\t[3] - Distribute Sol to bundler wallets');
    logToFile('\t[4] - Back');
    logToFile('\t[5] - Exit');
}

export const balances_display = () => {
    logToFile('\t[1] - Show sol & token balances of bundlers')
    logToFile('\t[2] - Show sol & token balances of holders')
    logToFile('\t[3] - Back');
    logToFile('\t[4] - Exit');
}

export const security_checks_display = () => {
    logToFile('\t[1] - Remove Mint Authority');
    logToFile('\t[2] - Freeze Authority');
    logToFile('\t[3] - Back');
    logToFile('\t[4] - Exit');
}

export const prepare_bundle_display = () => {
    logToFile('\t[1] - Wallet Create');
    logToFile('\t[2] - Create AssociatedTokenAccounts');
    logToFile('\t[3] - Create LUT');
    logToFile('\t[4] - Extend and Simulate tx size');
    logToFile('\t[5] - Back');
    logToFile('\t[6] - Exit');
}