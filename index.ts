import { logToFile, sleep } from "./src/utils"
import { balances_display, gather_display, main_menu_display, prepare_bundle_display, rl, screen_clear, security_checks_display, token_holders_display, token_launch_display, token_sell_buy_display } from "./menu/menu";
import { create_token } from "./layout/createToken";
import { create_market } from "./layout/createMarket";
import { bundle_pool_buy } from "./layout/poolBuy";
import { burn_lp } from "./src/burnLp";
import { manual_part_sell } from "./layout/manualPartSell";
import { wallet_create } from "./layout/walletCreate";
import { create_atas } from "./layout/createAta";
import { simulate } from "./layout/simulation";
import { sol_gather } from "./layout/solGather";
import { create_extend_lut } from "./layout/createLut";
import { remove_liquidity } from "./layout/removeLiquidity";
import { manual_rebuy } from "./layout/manualRebuy";
import { holder_distribute } from "./layout/holderDistribute";
import { holder_create } from "./layout/holderCreate";
import { holder_gather_all } from "./layout/holderGatherAll";
import { holder_gather_some } from "./layout/holderGatherSome";
import { show_bundlers } from "./layout/showBundlerBalance";
import { sol_distribute } from "./layout/solDistribute";
import { presimulate } from "./layout/preSimulate";
import { revokeMintAuthority } from "./src/revokeMintAuthority";
import { revokeFreezeAuthority } from "./src/revokeFreezeAuthority";
import { show_holders } from "./layout/showHolderBalance";
import { manual_each_sell } from "./layout/manualEachSell";
import { each_sol_gather } from "./layout/eachSolGather";
// import { sol_distribute } from "./layout/solDistribute";

export const init = () => {
  screen_clear();
  logToFile("Raydium Token Launchpad");

  main_menu_display();

  rl.question("\t[Main] - Choice: ", (answer: string) => {
    let choice = parseInt(answer);
    switch (choice) {
      case 1:
        token_launch()
        break;
      case 2:
        token_holders()
        break;
      case 3:
        sell_buy()
        break;
      case 4:
        gather();
        break;
      case 5:
        balances();
        break;
      case 6:
        process.exit(1);
      default:
        logToFile("\tInvalid choice!");
        sleep(1500);
        init();
        break;
    }
  })
}

export const token_launch = () => {
  screen_clear();
  logToFile("TOKEN LAUNCH")
  token_launch_display()

  rl.question("\t[Security Checks] - Choice: ", (answer: string) => {
    let choice = parseInt(answer);
    switch (choice) {
      case 1:
        presimulate();
        break;
      case 2:
        create_token();
        break;
      case 3:
        security_checks();
        break;
      case 4:
        create_market();
        break;
      case 5:
        prepare_bundle();
        break;
      case 6:
        holder_create()
        break;
      case 7:
        bundle_pool_buy();
        break;
      case 8:
        burn_lp();
        break;
      case 9:
        init();
        break;
      case 10:
        process.exit(1);
      default:
        logToFile("\tInvalid choice!");
        sleep(1500);
        token_launch();
        break;
    }
  })
}

export const token_holders = () => {
  screen_clear();
  logToFile("Token Holders")
  token_holders_display();

  rl.question("\t[Token Holders] - Choice: ", (answer: string) => {
    let choice = parseInt(answer);
    switch (choice) {
      case 1:
        holder_distribute()
        break;
      case 2:
        holder_gather_some()
        break;
      case 3:
        holder_gather_all()
        break;
      case 4:
        init();
        break;
      case 5:
        process.exit(1);
      default:
        logToFile("\tInvalid choice!");
        sleep(1500);
        token_holders();
        break;
    }
  })
}

export const sell_buy = () => {
  screen_clear();
  logToFile("Token Sell & Buy")
  token_sell_buy_display();

  rl.question("\t[Token Sell & Buy] - Choice: ", (answer: string) => {
    let choice = parseInt(answer);
    switch (choice) {
      case 1:
        manual_part_sell();
        break;
      case 2:
        manual_each_sell();
        break;
      case 3:
        manual_rebuy();
        break;
      case 4:
        remove_liquidity();
        break;
      case 5:
        init();
        break;
      case 6:
        process.exit(1);
      default:
        logToFile("\tInvalid choice!");
        sleep(1500);
        sell_buy();
        break;
    }
  })
}

export const gather = () => {
  screen_clear();
  logToFile("Gathering...")
  gather_display();

  rl.question("\t[Gather Options] - Choice: ", (answer: string) => {
    let choice = parseInt(answer);
    switch (choice) {
      case 1:
        sol_gather();
        break;
      case 2:
        each_sol_gather();
        break;
      case 3:
        sol_distribute();
        break;
      case 4:
        init();
        break;
      case 5:
        process.exit(1);
      default:
        logToFile("\tInvalid choice!");
        sleep(1500);
        gather();
        break;
    }
  })
}

export const balances = () => {
  screen_clear();
  logToFile("Balance Checks")
  balances_display();

  rl.question("\t[Balance Checks] - Choice: ", (answer: string) => {
    let choice = parseInt(answer);
    switch (choice) {
      case 1:
        show_bundlers();
        break;
      case 2:
        show_holders();
        break;
      case 3:
        init();
        break;
      case 4:
        process.exit(1);
      default:
        logToFile("\tInvalid choice!");
        sleep(1500);
        balances();
        break;
    }
  })
}

export const security_checks = () => {
  screen_clear();
  logToFile("Security Checks")
  security_checks_display();

  rl.question("\t[Security Checks] - Choice: ", (answer: string) => {
    let choice = parseInt(answer);
    switch (choice) {
      case 1:
        revokeMintAuthority();
        break;
      case 2:
        revokeFreezeAuthority();
        break;
      case 3:
        token_launch();
        break;
      case 4:
        process.exit(1);
      default:
        logToFile("\tInvalid choice!");
        sleep(1500);
        security_checks();
        break;
    }
  })
}

export const prepare_bundle = () => {
  screen_clear();
  logToFile("Security Checks")
  prepare_bundle_display();

  rl.question("\t[Security Checks] - Choice: ", (answer: string) => {
    let choice = parseInt(answer);
    switch (choice) {
      case 1:
        wallet_create();
        break;
      case 2:
        create_atas();
        break;
      case 3:
        create_extend_lut();
        break;
      case 4:
        simulate();
        break;
      case 5:
        token_launch();
        break;
      case 6:
        process.exit(1);
      default:
        logToFile("\tInvalid choice!");
        sleep(1500);
        prepare_bundle();
        break;
    }
  })
}

init()