import { ethers } from "ethers";
import Vue from "vue";
import {
  addresses,
  BINANCE_SMART_CHAIN_ID,
  HASH_METADATA,
  UINT256_MAX
} from "../utils/constants";
import { abi as ierc20Abi } from "../utils/abi/IERC20.json";
import masterChefAbi from "../utils/abi/MasterChef.json";
import graveAbi from "../utils/abi/Grave.json";
import axios from "axios";

let provider;

const getMasterChef = async (signerOrProvider, chainId) => {
  const contractAddress = addresses[chainId].MASTER_CHEF_ADDRESS;
  return await new ethers.Contract(
    contractAddress,
    masterChefAbi,
    signerOrProvider
  );
};
const getJossContract = async (signerOrProvider, chainId) => {
  const contractAddress = addresses[chainId].JOSS_TOKEN_ADDRESS;
  return await new ethers.Contract(
    contractAddress,
    ierc20Abi,
    signerOrProvider
  );
};

const getGraveContract = async (signerOrProvider, chainId) => {
  const contractAddress = addresses[chainId].GRAVE_ADDRESS;
  return await new ethers.Contract(contractAddress, graveAbi, signerOrProvider);
};

export const state = () => ({
  loading: false,
  address: null,
  balance: "0",
  jossBalance: "0",
  lpBalanceArray: [],
  pendingJossArray: [],
  userInfoArray: [], // amount => stake LP amount, rewardDebt => claimed reward amount
  network: { chainId: 0 },
  connectError: "",
  isWalletConnected: false,
  graveCount: "0",
  graveArray: []
});

export const getters = {
  isConnectError: state => {
    return state.connectError.length > 0;
  },
  totalPendingJoss: state => {
    if (state.pendingJossArray.length === 0) {
      return "0";
    }
    let result = ethers.BigNumber.from(0);
    for (let i = 0; i < state.pendingJossArray.length; i++) {
      const pendingJoss = state.pendingJossArray[i];
      result = result.add(ethers.utils.parseEther(pendingJoss));
    }
    return ethers.utils.formatEther(result);
  }
};

export const mutations = {
  set(_state, payload) {
    Object.keys(payload).forEach(key => {
      Vue.set(_state, key, payload[key]);
    });
  },
  toggleLoading(state, isLoading) {
    state.loading = isLoading;
  }
};

export const actions = {
  init: async ({ commit, dispatch }) => {
    commit("set", { loading: true });

    if (typeof window.ethereum === "undefined") {
      commit("set", { connectError: "MetaMask required!" });
    } else {
      const ethereum = window["ethereum"];
      provider = new ethers.providers.Web3Provider(ethereum);
      await dispatch("getNetwork");
    }

    commit("set", { loading: false });
  },
  connect: async ({ state, commit, dispatch }) => {
    if (!provider) {
      commit("set", { connectError: "MetaMask required!" });
      return;
    }

    if (state.connectError === "Wrong network") {
      return;
    }

    const ethereum = window["ethereum"];
    await ethereum.request({ method: "eth_requestAccounts" });

    commit("set", { isWalletConnected: true });
    await dispatch("getAddress");
    await dispatch("fetchData");
  },
  fetchData: async ({ dispatch }) => {
    await dispatch("getETHBalance");
    await dispatch("getJossBalance");
    await dispatch("getPendingJossArray");
    await dispatch("getLpBalanceArray");
    await dispatch("getUserInfoArray");
    await dispatch("getGraves");
  },
  async getNetwork({ commit }) {
    const network = await provider.getNetwork();
    if (network.chainId !== BINANCE_SMART_CHAIN_ID) {
      commit("set", { connectError: "Wrong network" });
    } else {
      commit("set", { connectError: "" });
      commit("set", { network });
    }
  },
  async getAddress({ commit }) {
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    commit("set", { address });
  },
  async getETHBalance({ commit, state }) {
    const { address } = state;
    commit("set", {
      balance: ethers.utils.formatEther(await provider.getBalance(address))
    });
  },
  async getJossBalance({ commit, state }) {
    const { address, network } = state;
    const jossContract = await getJossContract(provider, network.chainId);
    const jossBalance = ethers.utils.formatEther(
      await jossContract.balanceOf(address)
    );
    commit("set", { jossBalance });
  },
  async getPendingJossArray({ commit, state }) {
    const { address, network } = state;
    const masterChef = await getMasterChef(provider, network.chainId);
    const pendingJossArray = [];
    const LP_ADDRESSES = addresses[state.network.chainId].LP_ADDRESSES;
    for (let i = 0; i < LP_ADDRESSES.length; i++) {
      const { poolID } = LP_ADDRESSES[i];
      const pendingJoss = ethers.utils.formatEther(
        await masterChef.pendingJoss(poolID, address)
      );
      pendingJossArray.push(pendingJoss);
    }
    commit("set", { pendingJossArray });
  },
  async getLpBalanceArray({ commit, state }) {
    const lpBalanceArray = [];
    const LP_ADDRESSES = addresses[state.network.chainId].LP_ADDRESSES;
    for (let i = 0; i < LP_ADDRESSES.length; i++) {
      const { name, contractAddress } = LP_ADDRESSES[i];
      const lpContract = await new ethers.Contract(
        contractAddress,
        ierc20Abi,
        provider
      );
      const balance = ethers.utils.formatEther(
        await lpContract.balanceOf(state.address)
      );
      lpBalanceArray.push({
        balance,
        name
      });
    }
    commit("set", { lpBalanceArray });
  },
  async getGraves({ commit, state }) {
    const grave = await getGraveContract(provider, state.network.chainId);
    const graveCount = (await grave.balanceOf(state.address)).toString();
    commit("set", { graveCount });
    const graveArray = [];
    for (let i = 0; i < graveCount; i++) {
      const tokenId = await grave.tokenByIndex(i);
      const tokenURI = await grave.tokenURI(tokenId);
      graveArray.push({
        tokenURI,
        tokenId
      });
    }
    commit("set", { graveArray });
  },
  async stakeLP({ state, dispatch }, { poolID, depositAmount, isApproveMax }) {
    const signer = provider.getSigner();
    const lpAddress =
      addresses[state.network.chainId]["LP_ADDRESSES"][poolID][
        "contractAddress"
      ];
    const lp = await new ethers.Contract(lpAddress, ierc20Abi, signer);
    const masterChef = await getMasterChef(signer, state.network.chainId);
    try {
      console.log("1", depositAmount);
      const amount = ethers.utils.parseEther(depositAmount);
      console.log("2", amount);
      await lp.approve(
        masterChef.address,
        isApproveMax ? ethers.utils.parseUnits(UINT256_MAX, "wei") : amount
      );
      const tx = await masterChef.deposit(poolID, amount);
      await tx.wait();
      await dispatch("getLpBalanceArray");
      await dispatch("getPendingJossArray");
      await dispatch("getUserInfoArray");
    } catch (error) {
      console.log(error);
    }
  },
  async unstakeLP({ state, dispatch }, { poolID, withdrawAmount }) {
    const signer = provider.getSigner();
    const masterChef = await getMasterChef(signer, state.network.chainId);

    try {
      const tx = await masterChef.withdraw(
        poolID,
        ethers.utils.parseEther(withdrawAmount)
      );
      await tx.wait();
      await dispatch("getLpBalanceArray");
      await dispatch("getPendingJossArray");
      await dispatch("getUserInfoArray");
    } catch (error) {
      console.log(error);
    }
  },
  async claimJoss({ state, dispatch }, { poolID }) {
    const signer = provider.getSigner();
    const masterChef = await getMasterChef(signer, state.network.chainId);
    let tx;
    try {
      tx = await masterChef.deposit(poolID, 0);
      await tx.wait();
      await dispatch("getJossBalance");
      await dispatch("getPendingJossArray");
    } catch (error) {
      console.log(error);
    }
  },
  async getUserInfoArray({ commit, state }) {
    const signer = provider.getSigner();
    const masterChef = await getMasterChef(signer, state.network.chainId);
    const userInfoArray = [];

    const LP_ADDRESSES = addresses[state.network.chainId].LP_ADDRESSES;
    for (let i = 0; i < LP_ADDRESSES.length; i++) {
      const { poolID } = LP_ADDRESSES[i];
      const userInfo = await masterChef.userInfo(poolID, state.address);
      const { amount, rewardDebt } = userInfo;
      userInfoArray.push({
        amount: ethers.utils.formatEther(amount),
        rewardDebt: ethers.utils.formatEther(rewardDebt)
      });
    }

    commit("set", { userInfoArray });
  },
  async hashMetadata({}, { ipfsHash, metadata }) {
    await axios.post(HASH_METADATA, {
      ipfsPinHash: ipfsHash,
      metadata
    });
  },
  async buildGrave({ state, dispatch }, { IpfsHash }) {
    const signer = provider.getSigner();
    const grave = await getGraveContract(signer, state.network.chainId);
    const tx = await grave.buildGrave(state.address, IpfsHash);
    await tx.wait();
    await dispatch("getGraves");
  },
  async burnJoss({ state, dispatch }, { ipfsHash, amount, isApproveMax }) {
    const signer = provider.getSigner();
    const id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ipfsHash));
    const grave = await getGraveContract(signer, state.network.chainId);
    const jossContract = await getJossContract(signer, state.network.chainId);
    try {
      console.log(amount);
      await jossContract.approve(
        grave.address,
        isApproveMax
          ? ethers.utils.parseUnits(UINT256_MAX, "wei")
          : ethers.utils.parseUnits(amount.toString(), "ether")
      );
      const tx = await grave.burnJoss(
        id,
        ethers.utils.parseUnits(amount.toString(), "ether")
      );
      await tx.wait();
      const jossBurned = await grave.jossBurned(id);
      console.log("jossBurned", jossBurned);
      await dispatch("getJossBalance");
      await dispatch("hashMetadata", {
        ipfsHash,
        metadata: {
          keyvalues: {
            jossBurned: ethers.utils.formatEther(jossBurned)
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
};
