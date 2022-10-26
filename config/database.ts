import { ConnectOptions, connect } from "mongoose";

const connectDatabase = async () => {
  try {
    const mongoURI: string = process.env.MONGO_URL ?? "";
    const options: ConnectOptions = {
      // additional connection options
    };
    await connect(mongoURI, options);
  } catch (err: any) {
    console.error("Can't connect to database");
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDatabase;
