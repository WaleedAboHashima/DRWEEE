const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const axios = require("axios").default;
const { MainRoutes } = require("./routes");
const { CountriesCities } = require("./models/CountriesAndCities");
/* Coloring */
morgan.token("coloredStatus", (req, res) => {
  const status = res.statusCode;
  let color = "white"; // Default color for unknown status codes

  switch (true) {
    case status >= 200 && status < 300:
      color = "green"; // Success status codes (2xx)
      break;
    case status >= 300 && status < 400:
      color = "cyan"; // Redirection status codes (3xx)
      break;
    case status >= 400 && status < 500:
      color = "yellow"; // Client error status codes (4xx)
      break;
    case status >= 500:
      color = "red"; // Server error status codes (5xx)
      break;
  }

  return chalk.keyword(color)(status.toString()); // Apply the color
});

/* Cofnigiration */
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length]")
);

MainRoutes(app);

const CountriesCitiesCheck = async (req, res) => {
  try {
    const cc = await CountriesCities.findOne({});
    if (cc) {
      console.log(`Countries already in db all good`);
    } else {
      const res = await axios.get(
        "https://countriesnow.space/api/v0.1/countries"
      );
      await CountriesCities.create({
        countries: res.data.data
      }).then(() => console.log(`Coutries added successfully`))
    }
  } catch (err) {
    console.log(`Error with cc function: ${err.message}`);
  }
};

CountriesCitiesCheck();

if (process.env.DB_URL) {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      app.listen(process.env.PORT || 8080, () =>
        console.log(`Server Running on port ${process.env.PORT}`)
      );
    })
    .catch((error) => console.log(`${error} didn't connect`));
} else {
  throw new Error("DB URL Required");
}
