const moongoose = require("mongoose");

const ccSchema = new moongoose.Schema({
  countries: []
});

exports.CountriesCities = moongoose.model('Countries And Cities', ccSchema);
