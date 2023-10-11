const AuthRoutes = require("./Auth");

exports.MainRoutes = (app) => {
  app.use("/api/auth", AuthRoutes);
  app.use("/", (req, res) => res.status(200).send("Welcome to the database!"));
};
