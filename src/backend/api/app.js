import express from "express";
import CognitoExpress from "cognito-express";
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

// TODO: X-Origin-Verify (+ API Gateway conf)

const cognitoExpress = new CognitoExpress({
  region: process.env.AWS_REGION,
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "id",
});

router.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  cognitoExpress.validate(token, (err, response) => {
    if (err) {
      return res.status(401).send("Unauthorized: Invalid token");
    }
    res.locals.user = response;
    next();
  });
});

routes(router);

app.use("/", router);

export default app;
