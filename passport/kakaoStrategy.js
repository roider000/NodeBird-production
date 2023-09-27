const passport = require("passport");
const { Strategy: kakaoStrategy } = require("passport-kakao");
const User = require("../models/user");

module.exports = () => {
  passport.use(
    new kakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("profile :", profile);
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          }); // 카카오 로그인에선 이메일 대신 snsId로 대신 쓴다고 했었다.
          if (exUser) {
            // 로그인
            done(null, exUser);
          } else {
            // 회원가입
            const newUser = await User.create({
              email: profile._json?.kakao_account?.email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, exUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
