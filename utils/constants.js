export const addresses = {
  56: {
    JOSS_TOKEN_ADDRESS: "0x691119ce673697788E8eeb3A8FCFFae384D1D8F3",
    MASTER_CHEF_ADDRESS: "0xF438f5187E9BC10b7aA4A379ee5B750240088E1a",
    GRAVE_ADDRESS: "0xbeB1e767a3Cf5D9f5A034C6Abc49344374C528c7",
    LP_ADDRESSES: [
      {
        poolID: 0,
        contractAddress: "0xac109C8025F272414fd9e2faA805a583708A017f",
        name: "DOGE-WBNB Cake-LP",
        allocPoint: 100
      }
    ]
  }
};
const SERVER_DOMAIN = "doge-grave-worker.vercel.app";
export const PIN_URL = `${SERVER_DOMAIN}/create`;
export const UNPIN_URL = `${SERVER_DOMAIN}/unpin`;
export const HASH_METADATA = `${SERVER_DOMAIN}/hashMetadata`;
export const PINLIST_URL = `${SERVER_DOMAIN}/pinList/`;

export const MAINNET_ID = 1;
export const BINANCE_SMART_CHAIN_ID = 56;
export const HARDHAT_ID = 31337;
export const UINT256_MAX =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
