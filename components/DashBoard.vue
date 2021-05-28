<template>
  <v-row style="padding: 14px; margin-top: 16px">
    <v-col cols="12" sm="6" md="4">
      <DashBoardCard :val="balance" description="BNB Balance" />
    </v-col>
    <v-col cols="12" sm="6" md="4">
      <DashBoardCard :val="jossBalance" description="Joss Balance" />
    </v-col>
    <v-col cols="12" sm="6" md="4">
      <DashBoardCard :val="totalPendingJoss" description="Total Pending Joss" />
    </v-col>
    <v-col cols="12" sm="6" md="4" v-for="lp in lpBalanceArray" :key="lp.name">
      <DashBoardCard :val="lp.balance" :description="`${lp.name} Balance`" />
    </v-col>
    <v-col cols="12" sm="6" md="4">
      <DashBoardCard :val="graveCount" description="Grave Count" />
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters(["totalPendingJoss"]),
    ...mapState(["balance", "jossBalance", "lpBalanceArray", "graveCount"]),
  },
};
</script>

<style>
</style>