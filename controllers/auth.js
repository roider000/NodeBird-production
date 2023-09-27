const User = require("../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");

// POST /auth/join
exports.join = async (req, res, next) => {
  const { nick, email, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect("/join?error=exist");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// POST /auth/login
exports.login = (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      // 서버 실패
      console.error(authError);
      return next(authError); // 서버 에러는 항상 next(에러)로 에러처리 미들웨어로 넘겨버리면 된다.
    }
    if (!user) {
      // 로직 실패 (유저가 없을 때)
      return res.redirect(`/?loginError=${info.message}`);
    }
    // 로그인 성공
    return req.login(user, (loginError) => {
      // user는 로컬전략의 exUser
      if (loginError) {
        // 로그인 과정에서 에러가 발생할 수 있다. 하지만 8년 이상 하면서 이 부분에서 에러나는 경우는 없다 함. 그래도 혹시 모르니
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다.
};

// GET /auth/logout
exports.logout = (req, res, next) => {
  req.logout(() => {
    // 세션 객체를 빈 객체로 만들어버림.
    res.redirect("/"); // 로그아웃 성공 시
  });
};
