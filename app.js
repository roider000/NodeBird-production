const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");
const redis = require("redis");
const RedisStore = require("connect-redis").default;
const { sequelize } = require("./models"); // db객체 안에 있는 sequelize객체
const helmet = require("helmet");
const hpp = require("hpp");
// ↑ process.env.COOKIE_SECRET → undefined
dotenv.config(); // process.env
// ↓ process.env.COOKIE_SECRET → 'cookiesecret'
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_URL}`,
  password: process.env.REDIS_PASSWORD,
  legacyMode: true,
});
redisClient.connect().catch(console.error);

const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const passportConfig = require("./passport");

const app = express();
passportConfig();
app.set("port", process.env.PORT || 8001); // http://localhost:8001
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

sequelize
  .sync()
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

if (process.env.NODE_ENV === "production") {
  app.enable("trust proxy");
  app.use(morgan("combined"));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );
  app.use(hpp());
} else {
  app.use(morgan("dev"));
}
// 1
app.use(express.static(path.join(__dirname, "public"))); // 2
// ㄴ 레이아웃 html에서 <link rel="stylesheet" href="/main.css" /> 태그가 있는데 이때 해당 css파일을 제공함.
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json()); // 3 : ajax json요청으로부터 req.body를 만듦
app.use(express.urlencoded({ extended: false })); // 3 : 폼으로부터 req.body를 만듦
app.use(cookieParser(process.env.COOKIE_SECRET)); // 3
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({ client: redisClient }),
};
if (process.env.NODE_ENV === "production") {
  sessionOption.proxy = true;
  // sessionOption.cookie.secure = true;
}
app.use(session(sessionOption));
app.use(passport.initialize());
// passport.initialize 호출시 req.user, req.login, req.isAuthenticate, req.logout 생성
app.use(passport.session()); // connect.sid라는 이름으로 세션 쿠키가 브라우저로 전송

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  // 404 NOT FOUND
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

// app.listen(app.get("port"), () => {
//   console.log(app.get("port"), "번 포트에서 대기중");
// });
