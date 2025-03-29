import express from "express";
import helmet from "helmet";
import noCache from "nocache";
import cors from "cors";
import routes from "./routes";

const app = express();
const router = express.Router();

const origins = ["https://localhost:4000"];

router.use(express.json());
router.use(express.urlencoded({ extended: true, limit: "10mb" }));
router.use(helmet());
router.use(noCache());
router.use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "DELETE"],
    origin: origins,
  })
);

routes(router);

app.use("/", router);

export default app;
