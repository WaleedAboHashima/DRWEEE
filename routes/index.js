const AuthRoutes = require("./Auth");
const UserRoutes = require("./User");
const OwnerRoutes = require("./Owner");
const SharedRoutes = require("./Main");
const { JWTGuard } = require("../middleswares/JWTGuard");

exports.MainRoutes = (app) => {
  app.use("/api/auth", AuthRoutes);
  app.use("/api/user", JWTGuard("User"), UserRoutes);
  app.use("/api/main", SharedRoutes);
  app.use("/api/owner", JWTGuard("Owner"), OwnerRoutes);
  app.use("/", (req, res) => res.status(200).send("Welcome to the database!"));
};
