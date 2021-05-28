<template>
  <v-card style="background: transparent; border: 2px solid #7e57c2">
    <v-card-text>
      <div
        style="
          text-align: center;
          color: white;
          font-weight: bold;
          font-size: 1.5em;
        "
      >
        {{ val }}
      </div>
      <div style="text-align: center">{{ description }}</div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    description: String,
    val: String,
  },
};
</script>

<style>
</style>