import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import connectDatabase from "./config/database";
import axios from "axios";
import cron from "node-cron";
import { NearestCityResponse } from "./types/responses";
import swaggerDocument from "./swagger.json";
import swaggerUi from "swagger-ui-express";
import Pollution from "./schema/Pollution.schema";
dotenv.config();

// Swagger options
const options = {
  swagger: "2.0",
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hello World",
      version: "1.0.0",
    },
  },
  host: "localhost:8000",
  basePath: "/api-docs",

  apis: ["./*.js"], // files containing annotations as above
};

// TODO README Documentation

const app: Express = express();
const port = process.env.PORT;
//connect the database
connectDatabase();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//running a task every 1 minute
cron.schedule("* * * * *", async () => {
  try {
    const { data } = await axios.request<NearestCityResponse>({
      url: `http://api.airvisual.com/v2/nearest_city?lat=48.856613&lon=2.352222&key=${process.env.API_KEY}`,
      method: `GET`,
    });
    const PollutionResponse = data.data?.current?.pollution;
    const newPollution = new Pollution(PollutionResponse);
    const savedPollution = await newPollution.save();
    if (savedPollution) console.log("data seved to mongodb --==-- cron");
  } catch (error) {
    console.log(error);
  }
});

// routes
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the server");
});

app.get("/get-air-quality", async (req: Request, res: Response) => {
  const MAX_LATITUDE = 90;
  const MAX_LONGITUDE = 180;
  if (!req.query.longitude || !req.query.longitude)
    return res
      .status(400)
      .send({ message: "please provide a longitude and latitude" });
  const longitude: number = Number(req.query.longitude);
  const latitude: number = Number(req.query.latitude);
  if (
    !(Math.abs(latitude) <= MAX_LATITUDE) ||
    !(Math.abs(longitude) <= MAX_LONGITUDE)
  ) {
    return res.status(400).send({
      message: `Latitude must be a numerical value, within range [-90, 90] and Longitude must be a numerical value, within range [-180, 180].`,
    });
  }
  try {
    const { data: response } = await axios.request<NearestCityResponse>({
      url: `http://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${process.env.API_KEY}`,
      method: `GET`,
    });
    const Pollution = response.data?.current?.pollution;
    const Result = {
      Result: {
        Pollution,
      },
    };
    return res.send(Result);
  } catch (error: any) {
    return res.status(400).send({ message: error.message });
  }
});
app.get("/get-max-pollution", async (req: Request, res: Response) => {
  try {
    const maxPolution = await Pollution.findOne().sort({ aqius: -1 });
    if (maxPolution) return res.send(maxPolution);
    else {
      return res.send(`No data found`);
    }
  } catch (error: any) {
    return res.send(error.message);
  }
});
app.listen(port, () => {
  console.log(
    `⚡️⚡️[server]: Server is running at http://localhost:${port} ⚡️⚡️`
  );
});
