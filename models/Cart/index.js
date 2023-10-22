const moongoose = require("mongoose");

const cartSchema = new moongoose.Schema({
  User: {
    type: moongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  Products: [],
  totalPrice: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
});

exports.Carts = moongoose.model("Carts", cartSchema);
