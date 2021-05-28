<template>
  <div>
    <h1 class="text-center">Holding</h1>
    <v-col cols="12">
      <v-alert v-if="error" type="error" dismissible>{{
        errorMessage
      }}</v-alert>
    </v-col>
    <v-alert v-if="metadata.length === 0" border="left" color="primary" dark>
      You don't have any grave.
    </v-alert>
    <div>
      <v-row>
        <v-col
          cols="12"
          md="6"
          lg="4"
          v-for="row in metadata"
          :key="row.ipfs_pin_hash"
        >
          <v-card>
            <v-card-title>{{ row.name }}</v-card-title>
            <v-card-subtitle>
              {{ row.keyvalues.description }}
            </v-card-subtitle>
            <v-card-text>
              <v-img
                v-if="row.keyvalues.mimetype.includes('image')"
                :src="`https://gateway.pinata.cloud/ipfs/${row.ipfs_pin_hash}`"
              ></v-img>
              <audio
                v-if="row.keyvalues.mimetype.includes('audio')"
                controls
                style="width: 100%"
                :src="`https://gateway.pinata.cloud/ipfs/${row.ipfs_pin_hash}`"
              ></audio>
              <iframe
                v-if="row.keyvalues.mimetype.includes('text')"
                style="background: white; width: 100%"
                :src="`https://gateway.pinata.cloud/ipfs/${row.ipfs_pin_hash}`"
                frameborder="0"
              ></iframe>
            </v-card-text>
            <v-card-text>
              <div style="display: flex; justify-content: space-between">
                <span> burned joss:</span>
                <span>
                  {{ row.keyvalues.jossBurned }}
                </span>
              </div>

              <v-divider></v-divider>
            </v-card-text>
            <v-card-actions class="px-4">
              <v-btn
                color="primary"
                class="mr-4"
                @click="handleClickGateway(row.ipfs_pin_hash)"
                >gateway</v-btn
              >
              <v-dialog v-model="burnJossAmountDialog" max-width="500">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" v-bind="attrs" v-on="on"
                    >burn joss</v-btn
                  >
                </template>
                <v-card>
                  <v-card-title>Joss Amount</v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-switch
                        v-model="isApproveMax"
                        label="Approve max LP(once and for all)"
                      ></v-switch>
                      <v-text-field v-model="jossAmount" required
                        ><template v-slot:append-outer>
                          <v-btn
                            text
                            color="primary"
                            @click="onClickSetApproveAmountMax()"
                          >
                            balance:
                            {{ jossBalance }}
                          </v-btn>
                        </template></v-text-field
                      >
                    </v-container>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      @click="handleBurnJoss(row.ipfs_pin_hash)"
                      >confirm</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import axios from "axios";
import { PINLIST_URL } from "../utils/constants";
export default {
  data() {
    return {
      error: false,
      errorMessage: "",
      isApproveMax: false,
      metadata: [],
      jossAmount: "0",
      burnJossAmountDialog: false,
    };
  },
  computed: {
    ...mapState(["address", "graveArray", "jossBalance"]),
  },
  methods: {
    ...mapMutations(["toggleLoading"]),
    ...mapActions(["burnJoss"]),
    handleClickGateway(ipfs_pin_hash) {
      window.open(
        `https://gateway.pinata.cloud/ipfs/${ipfs_pin_hash}`,
        "_blank"
      );
    },
    async handleBurnJoss(ipfs_pin_hash) {
      if (this.jossBalance < this.jossAmount) {
        this.error = true;
        this.errorMessage = "Your joss balance is not enough.";
        this.burnJossAmountDialog = false;
        this.jossAmount = "0";
        return;
      }
      this.toggleLoading(true);
      try {
        await this.burnJoss({
          ipfsHash: ipfs_pin_hash,
          amount: this.jossAmount,
          isApproveMax: this.isApproveMax,
        });
        await this.getMetadata();
      } catch (e) {
        console.log(e);
      }
      this.toggleLoading(false);
      this.burnJossAmountDialog = false;
      this.jossAmount = "0";
    },
    onClickSetApproveAmountMax() {
      this.jossAmount = this.jossBalance;
    },
    async getMetadata() {
      const response = await axios.get(`${PINLIST_URL}${this.address}`);
      this.metadata = [];
      const { rows } = response.data;
      for (let i = 0; i < rows.length; i++) {
        this.metadata.push({
          ...rows[i].metadata,
          ipfs_pin_hash: rows[i].ipfs_pin_hash,
        });
      }
    },
  },
  async mounted() {
    if (this.graveArray.length === 0) {
      return;
    }
    this.toggleLoading(true);
    await this.getMetadata();
    this.toggleLoading(false);
  },
};
</script>

<style>
</style>