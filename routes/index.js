const AuthRoutes = require("./Auth");
const UserRoutes = require("./User");
exports.MainRoutes = (app) => {
  app.use("/api/auth", AuthRoutes);
  app.use("/api/user", UserRoutes);
  app.use("/", (req, res) => res.status(200).send("Welcome to the database!"));
};
