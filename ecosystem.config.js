module.exports = {
    apps: [{
      name: "dreamweaver",
      script: "./processAndUpload.ts",
      instances: 1,
      interpreter: "ts-node",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  }