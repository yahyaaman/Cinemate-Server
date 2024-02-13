import { app } from "./app.js";
import { connectDB } from "./data/database.js";

connectDB();
app.listen(process.env.PORT, (err) => {
  if (!err) {
    console.log(`Server running on port ${process.env.PORT}`);
  } else {
    console.log(err);
  }
});
