const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const User = require("../models/user");
const bcrypt = require("bcrypt");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        // passport에다가 LocalStrategy를 등록.
        // 1. LocalStrategy의 옵션
        usernameField: "email", // req.body.email 값을 받아 아래 email매개변수로 넘김
        passwordField: "password", // req.body.password 값을 받아 아래 password매개변수로 넘김.
        passReqToCallback: false,
        // true면 다음 미들웨어는 async (req, email, password, done) 이 됨.
        // false면 다음 미들웨어는 async (email, password, done) 이 됨. 지금은 req가 필요 없으니 false로 함. req필요하면 true
      },
      async (email, password, done) => {
        //2. 로그인을 해도 되는지 아닌지를 판단하는 로직을 짜야 함.
        try {
          const exUser = await User.findOne({ where: { email } }); // 일단 입력한 이메일이 DB에 등록되어 있는지 확인
          if (exUser) {
            // 등록된 이메일 있으면 비밀번호 비교
            const result = await bcrypt.compare(password, exUser.password); // 입력한 비번(암호화x)과 DB의 비번(암호화o)을 비교
            if (result) {
              // 비번도 일치한다면
              done(null, exUser); // done(서버실패, 성공유저, 로직실패) 형태로, 로그인 조건을 충족시켜준다면 두 번재 인자로 사용자 정보를 넣어준다.
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." }); // done(서버실패, 성공유저, 로직실패) 형태로, 딱히 에러는 없지만 로그인 조건을 충족시키지 못하는 경우 세 번째 인자로 메시지(이유)를 넣어주면 됨
            }
          } else {
            // 등록된 이메일이 없는 경우
            done(null, false, { message: "가입하지 않은 회원입니다." });
          }
        } catch (error) {
          console.error(error);
          done(error); // done(서버실패, 성공유저, 로직실패) 형태로, 서버쪽에서 문image.png제가 생긴다면 첫 번째 인자로 에러를 넣어줘 호출
        }
      }
    )
  );
};
