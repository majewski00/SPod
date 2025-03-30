module.exports = (serverless) => {
  return {
    bundle: true,
    minify: process.env.BUILD_STAGE === "prod",
    sourcemap: "external",
    alias: {
      constants: "./../../constants",
    },
  };
};
