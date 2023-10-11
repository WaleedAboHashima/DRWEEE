const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const { MainRoutes } = require("./routes");

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
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length]")
);

MainRoutes(app);

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
