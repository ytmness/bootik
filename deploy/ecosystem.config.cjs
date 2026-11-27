// pm2 start deploy/ecosystem.config.cjs   (desde /opt/bootik-api)
module.exports = {
  apps: [{
    name: "bootik-api",
    script: "server/server.mjs",
    cwd: "/opt/bootik-api",
    env: { NODE_ENV: "production" }, // el resto de variables va en server/.env (no en git)
    max_memory_restart: "150M",
  }],
};
