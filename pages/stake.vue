<template>
  <div>
    <v-row justify="center" align="center">
      <v-col sm="8" v-if="isWalletConnected">
        <v-card class="rounded-md">
          <v-card-text>
            <v-text-field
              append-icon="mdi-magnify"
              dark
              label="Search by name"
              rounded
              filled
              dense
            ></v-text-field>
            <v-list v-for="(lp, index) in lpAddresses" :key="lp.name">
              <v-list-group
                class="deep-purple darken-2"
                style="margin-bottom: 16px"
              >
                <template v-slot:activator>
                  <v-list-item-title>
                    <div
                      style="
                        display: flex;
                        justify-content: space-between;
                        color: white;
                      "
                    >
                      <div>{{ lp.name }}</div>
                      <div>
                        pending:
                        {{
                          pendingJossArray.length !== 0
                            ? pendingJossArray[index]
                            : 0
                        }}
                      </div>
                      <div>
                        Staked:
                        {{
                          userInfoArray.length !== 0
                            ? userInfoArray[index].amount
                            : 0
                        }}
                      </div>
                    </div>
                  </v-list-item-title>
                </template>
                <v-list-item style="background: #1e1e1e">
                  <v-card width="100%">
                    <v-card-text>
                      <v-row style="margin-top: 1em">
                        <v-col cols="4">
                          <v-dialog v-model="stakeDialog" width="500">
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                color="deep-purple lighten-4"
                                width="100%"
                                outlined
                                v-bind="attrs"
                                v-on="on"
                              >
                                Stake
                              </v-btn>
                            </template>

                            <v-card>
                              <v-card-title
                                class="headline deep-purple lighten-2"
                              >
                                Stake
                              </v-card-title>
                              <v-card-text>
                                <form>
                                  <v-container>
                                    <v-switch
                                      v-model="isApproveMax"
                                      label="Approve max LP(once and for all)"
                                    ></v-switch>
                                    <v-text-field
                                      v-model="depositAmount"
                                      :rules="depositAmountRules"
                                      label="Deposit Amount"
                                      required
                                    >
                                    </v-text-field>
                                    <v-row>
                                      <v-spacer></v-spacer>
                                      <v-btn
                                        text
                                        color="primary"
                                        @click="
                                          onClickSetApproveAmountMax(index)
                                        "
                                      >
                                        MAX:
                                        {{ lpBalanceArray[index].balance }}
                                      </v-btn>
                                    </v-row>
                                  </v-container>
                                </form>
                              </v-card-text>

                              <v-divider></v-divider>

                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                  color="primary"
                                  text
                                  @click="onSumbitStake(lp.poolID)"
                                >
                                  Sumbit
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                        </v-col>
                        <v-col cols="4"
                          ><v-btn
                            outlined
                            color="deep-purple lighten-4"
                            width="100%"
                            @click="onClickClaim(lp.poolID)"
                            >Claim</v-btn
                          ></v-col
                        >
                        <v-col cols="4">
                          <v-dialog v-model="unstakeDialog" width="500">
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                color="deep-purple lighten-4"
                                width="100%"
                                outlined
                                v-bind="attrs"
                                v-on="on"
                              >
                                Unstake
                              </v-btn>
                            </template>

                            <v-card>
                              <v-card-title
                                class="headline deep-purple lighten-2"
                              >
                                Unstake
                              </v-card-title>
                              <v-card-text>
                                <form>
                                  <v-container>
                                    <v-text-field
                                      v-model="withdrawAmount"
                                      :rules="withdrawAmountRules"
                                      label="Withdraw Amount"
                                      required
                                    >
                                      <template v-slot:append-outer>
                                        <v-btn
                                          text
                                          color="primary"
                                          @click="
                                            onClickSetWithdrawAmountMax(index)
                                          "
                                        >
                                          staked:
                                          {{ userInfoArray[index].amount }}
                                        </v-btn>
                                      </template>
                                    </v-text-field>
                                  </v-container>
                                </form>
                              </v-card-text>

                              <v-divider></v-divider>

                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                  color="primary"
                                  text
                                  @click="onSumbitUnstake(lp.poolID)"
                                >
                                  Sumbit
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-list-item>
              </v-list-group>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col sm="12" v-else>
        <v-alert border="left" color="primary" dark>
          please connect wallet
        </v-alert>
      </v-col>
      <v-col class="text-center" cols="12">
        <blockquote class="blockquote">&#8220;Such mining.&#8221;</blockquote>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { addresses, BINANCE_SMART_CHAIN_ID } from "../utils/constants";
export default {
  computed: {
    ...mapState([
      "pendingJossArray",
      "lpBalanceArray",
      "userInfoArray",
      "isWalletConnected",
    ]),
  },
  data() {
    return {
      lpAddresses: addresses[BINANCE_SMART_CHAIN_ID]["LP_ADDRESSES"],
      isApproveMax: false,
      stakeDialog: false,
      depositAmount: 0,
      depositAmountRules: [],
      unstakeDialog: false,
      withdrawAmount: 0,
      withdrawAmountRules: [],
    };
  },
  methods: {
    ...mapActions(["stakeLP", "claimJoss", "unstakeLP"]),
    async onClickClaim(poolID) {
      await this.claimJoss({
        poolID,
      });
    },
    async onClickUnstake(poolID) {
      await this.unstakeLP({
        poolID,
        withdrawAmount: 1000,
      });
    },
    async onSumbitStake(poolID) {
      const { depositAmount, isApproveMax } = this;
      await this.stakeLP({
        poolID,
        depositAmount,
        isApproveMax,
      });
      this.depositAmount = 0;
      this.isApproveMax = false;
      this.stakeDialog = false;
    },
    async onSumbitUnstake(poolID) {
      const { withdrawAmount } = this;
      await this.unstakeLP({
        poolID,
        withdrawAmount,
      });
      this.withdrawAmount = 0;
      this.unstakeDialog = false;
    },
    onClickSetApproveAmountMax(index) {
      this.depositAmount = this.lpBalanceArray[index].balance;
    },
    onClickSetWithdrawAmountMax(index) {
      this.withdrawAmount = this.userInfoArray[index].amount;
    },
  },
};
</script>
