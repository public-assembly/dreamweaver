module.exports = {
    apps: [{
      name: "dreamweaver",
      script: "./processAndUpload.ts",
      instances: 1,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  }