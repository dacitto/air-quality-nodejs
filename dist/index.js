"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = __importDefault(require("node-cron"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const Pollution_schema_1 = __importDefault(require("./schema/Pollution.schema"));
dotenv_1.default.config();
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
const app = (0, express_1.default)();
const port = process.env.PORT;
//connect the database
(0, database_1.default)();
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
//running a task every 1 minute
node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { data } = yield axios_1.default.request({
            url: `http://api.airvisual.com/v2/nearest_city?lat=48.856613&lon=2.352222&key=${process.env.API_KEY}`,
            method: `GET`,
        });
        const PollutionResponse = (_b = (_a = data.data) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.pollution;
        const newPollution = new Pollution_schema_1.default(PollutionResponse);
        const savedPollution = yield newPollution.save();
        if (savedPollution)
            console.log("data seved to mongodb --==-- cron");
    }
    catch (error) {
        console.log(error);
    }
}));
// routes
app.get("/", (req, res) => {
    res.send("Welcome to the server");
});
app.get("/get-air-quality", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const MAX_LATITUDE = 90;
    const MAX_LONGITUDE = 180;
    if (!req.query.longitude || !req.query.longitude)
        return res
            .status(400)
            .send({ message: "please provide a longitude and latitude" });
    const longitude = Number(req.query.longitude);
    const latitude = Number(req.query.latitude);
    if (!(Math.abs(latitude) <= MAX_LATITUDE) ||
        !(Math.abs(longitude) <= MAX_LONGITUDE)) {
        return res.status(400).send({
            message: `Latitude must be a numerical value, within range [-90, 90] and Longitude must be a numerical value, within range [-180, 180].`,
        });
    }
    try {
        const { data: response } = yield axios_1.default.request({
            url: `http://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${process.env.API_KEY}`,
            method: `GET`,
        });
        const Pollution = (_d = (_c = response.data) === null || _c === void 0 ? void 0 : _c.current) === null || _d === void 0 ? void 0 : _d.pollution;
        const Result = {
            Result: {
                Pollution,
            },
        };
        return res.send(Result);
    }
    catch (error) {
        return res.status(400).send({ message: error.message });
    }
}));
app.get("/get-max-pollution", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const maxPolution = yield Pollution_schema_1.default.findOne().sort({ aqius: -1 });
        if (maxPolution)
            return res.send(maxPolution);
        else {
            return res.send(`No data found`);
        }
    }
    catch (error) {
        return res.send(error.message);
    }
}));
app.listen(port, () => {
    console.log(`⚡️⚡️[server]: Server is running at http://localhost:${port} ⚡️⚡️`);
});
