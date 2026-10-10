import app from "./app.js";
import { connectDB } from "./db.js";
import { getJwtSecret } from "./utils/auth.js";

const port = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  try {
    getJwtSecret();
    await connectDB();
    app.listen(port, () => {
      console.log(`API server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
}

void startServer();
