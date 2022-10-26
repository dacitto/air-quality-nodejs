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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const connectDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const mongoURI = (_a = process.env.MONGO_URL) !== null && _a !== void 0 ? _a : "";
        const options = {
        // additional connection options
        };
        yield (0, mongoose_1.connect)(mongoURI, options);
    }
    catch (err) {
        console.error("Can't connect to database");
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
});
exports.default = connectDatabase;
