<template>
  <v-app
    :style="{
      backgroundimage: `url('/background.jpg')`,
    }"
  >
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-bold">Doge Grave</v-toolbar-title>
      <v-spacer />
      <v-btn
        :color="!isConnectError ? 'deep-purple darken-2' : 'red lighten-1'"
        @click="onConnectWallet"
        :loading="loading"
        >{{ btnText }}</v-btn
      >
    </v-app-bar>
    <v-progress-linear
      style="position: absolute; top: 0; z-index: 999"
      indeterminate
      color="deep-purple lighten-3"
      v-if="loading"
    ></v-progress-linear>

    <v-main>
      <v-container style="margin-top: 16px; padding: 32px">
        <nuxt />
      </v-container>
    </v-main>
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-github</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-telegram</v-icon>
      </v-btn>
    </v-footer>
  </v-app>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex";
export default {
  mounted() {
    this.init();
    const ethereum = window["ethereum"];
    if (ethereum) {
      ethereum.on("accountsChanged", async () => {
        await this.init();
        await this.connect();
      });
      ethereum.on("chainChanged", async () => {
        await this.init();
        await this.connect();
      });
    }
  },
  computed: {
    ...mapState(["address", "loading", "connectError"]),
    ...mapGetters(["isConnectError"]),
    btnText() {
      if (!this.isConnectError) {
        return this.address === null
          ? "connect wallet"
          : String(this.address).slice(0, 6) +
              "..." +
              String(this.address).slice(-4);
      } else {
        return this.connectError;
      }
    },
  },
  methods: {
    ...mapActions(["init", "connect"]),
    async onConnectWallet() {
      if (this.isConnectError) {
        return;
      }
      await this.connect();
    },
  },
  data() {
    return {
      clipped: true,
      drawer: true,
      fixed: true,
      items: [
        {
          icon: "mdi-home",
          title: "Welcome",
          to: "/",
        },
        {
          icon: "mdi-pickaxe",
          title: "Stake",
          to: "/stake",
        },
        {
          icon: "mdi-grave-stone",
          title: "Grave",
          to: "/grave",
        },
        {
          icon: "mdi-wallet",
          title: "Holding",
          to: "/holding",
        },
      ],
      miniVariant: true,
    };
  },
};
</script>
<style>
#app {
  background: url("/background.jpg") repeat center center fixed !important;
  background-size: cover;
}
</style>
