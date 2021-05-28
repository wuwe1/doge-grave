<template>
  <v-row style="max-width: 480px; margin: 0 auto">
    <v-col cols="12">
      <v-alert v-if="success" type="success" dismissible>Grave built!</v-alert>
      <v-alert v-if="error" type="error" dismissible>{{
        errorMessage
      }}</v-alert>
    </v-col>
    <v-col cols="12">
      <h1 class="font-weight-bold purple--text text--lighten-2">
        Build a grave
      </h1>
    </v-col>
    <v-col cols="12">
      <v-form v-model="valid" ref="form">
        <v-file-input
          v-model="file"
          :rules="[rules.fileSize, rules.required]"
          small-chips
          show-size
          placeholder="TXT, PNG, GIF, WEBP, MP3, MP4. Max 30mb"
          truncate-length="15"
        ></v-file-input>
        <v-text-field
          v-model="name"
          :rules="[rules.required]"
          prepend-icon="mdi-account-details"
          label="Name"
          required
        ></v-text-field>
        <v-textarea
          v-model="description"
          solo
          label="Description (Optional)"
        ></v-textarea>
        <v-btn
          :loading="loading"
          :disabled="!valid"
          color="primary"
          width="100%"
          @click="onSumbit"
          >submit</v-btn
        >
      </v-form>
    </v-col>
    <v-col class="text-center" cols="12">
      <blockquote class="blockquote">&#8220;So grave.&#8221;</blockquote>
    </v-col>
  </v-row>
</template>
<script>
import axios from "axios";
import { mapMutations, mapState, mapActions } from "vuex";
import { PIN_URL, UNPIN_URL } from "../utils/constants";
export default {
  data() {
    return {
      valid: false,
      success: false,
      error: false,
      errorMessage: "",
      rules: {
        required: (value) => !!value || "Required.",
        fileSize: (value) =>
          !value ||
          value.size < 30 * 1024 * 1024 ||
          "File size should be less than 30 MB.",
      },
      name: "",
      description: "",
      file: null,
    };
  },
  computed: {
    ...mapState(["loading", "address"]),
  },
  methods: {
    ...mapMutations(["toggleLoading"]),
    ...mapActions(["buildGrave"]),
    sleep(ms) {
      return new Promise((res) => setTimeout(res, ms));
    },
    async onSumbit() {
      if (!this.valid) {
        return;
      }
      this.toggleLoading(true);
      const formData = new FormData();
      const { file, description, name } = this;
      formData.append("asset", file);
      const options = new Blob(
        [
          JSON.stringify(
            {
              name,
              description,
              userAddress: this.address,
            },
            null,
            2
          ),
        ],
        { type: "application/json" }
      );
      formData.append("options", options, "options.json");

      const response = await axios.post(PIN_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status !== 200) {
        this.toggleLoading(false);
        return;
      }

      const { IpfsHash } = response.data;
      try {
        const response = await this.buildGrave({ IpfsHash });
        console.log(response);
      } catch (error) {
        console.error(error);

        await axios.post(UNPIN_URL, { IpfsHash });
        this.$refs.form.reset();
        this.success = false;
        this.error = true;
        this.errorMessage = error.message;
        this.toggleLoading(false);
        return;
      }

      this.$refs.form.reset();
      this.success = true;
      this.error = false;
      this.toggleLoading(false);
    },
  },
};
</script>
