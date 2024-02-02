import { app } from "./app.js";
import { connectDB } from "./data/database.js";

connectDB();
app.listen(process.env.port, (err) => {
  if (!err) {
    console.log(`Server running on port ${process.env.port}`);
  } else {
    console.log(err);
  }
});
