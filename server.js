import { app } from "./app.js";
import { connectDB } from "./data/database.js";

app.listen(process.env.port, (err) => {
  if (!err) {
    connectDB();
    console.log(`Server running on port ${process.env.port}`);
  } else {
    console.log(err);
  }
});
