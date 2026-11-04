import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, "0.0.0.0", () => {
  console.log(`Backend listening on http://127.0.0.1:${env.port}`);
});
