const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

module.exports = () => {
  passport.serializeUser((user, done) => {
    // user는 로컬전략의 exUser가 login컨트롤러를 통해 도착한 것.
    done(null, user.id); // req.session에 user.id만 저장
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      include: [
        {
          // 팔로워
          model: User,
          attributes: ["id", "nick"],
          as: "Followers",
        },
        {
          // 팔로잉
          model: User,
          attributes: ["id", "nick"],
          as: "Followings",
        },
      ],
    })
      .then((user) => done(null, user)) // req.user생성. 이때 엄밀히 말하자면 아니지만 그냥 req.session도 같이 생성 된다고 보면 됨.
      .catch((err) => done(err));
  });

  local();
  kakao();
};
