require("dotenv").config();
const app = require("./src/app");
const { connectDB } = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");

const PORT = process.env.PORT || 8000;

(async () => {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`[server] Running on port ${PORT}`);
  });
})();
