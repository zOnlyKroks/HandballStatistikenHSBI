const { defineConfig } = require("@vue/cli-service");

process.env.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

module.exports = defineConfig({
  transpileDependencies: true,
});
