<template>
  <v-row justify="center" align="center">
    <v-col cols="12">
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-img
                max-width="350"
                src="/doge.jpeg"
                style="margin: auto"
              ></v-img>
            </v-col>
            <v-col
              cols="12"
              md="8"
              style="
                display: flex;
                justify-content: center;
                align-items: center;
              "
            >
              <div>
                <h1 style="text-align: center">Doge Grave 犬の墓</h1>
                <br />
                <h4 style="text-align: center">MEME Liquidity Mining & NFT</h4>
                <br />
                <p style="font-size: 1.5em; line-height: 1.3em">
                  <strong>DOGE GRAVE 犬の墓</strong>
                  is a decentralized grave where doge and other things rest. You
                  can put anything in the grave, and this grave will always
                  exist.
                </p>
                <br />
                <p style="font-size: 1.5em; text-align: center">
                  How you can interact with this protocol:
                </p>

                <ul style="font-size: 1.5em; line-height: 2em">
                  <li>
                    <v-btn :to="'/stake'" style="color: #b39ddb"
                      >Stake LP</v-btn
                    >
                    and earn Joss Money
                  </li>
                  <li>
                    <v-btn :to="'grave'" style="color: #b39ddb"
                      >build a grave</v-btn
                    >
                  </li>
                  <li>trade your grave with other people. (coming soon)</li>
                </ul>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <DashBoard />
  </v-row>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["network", "address"]),
  },
};
</script>
