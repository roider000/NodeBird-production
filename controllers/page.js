const Post = require("../models/post");
const User = require("../models/user");
const Hashtag = require("../models/hashtag");

// 계층적 호출 : 라우터 →(호출)→ 컨트롤러 →(호출)→ 서비스

// - 컨트롤러 : 응답을 보내는 미들웨어. 요청, 응답이 뭔지 안다고 보면 됨
// - 서비스 : 응답을 보내는 미들웨어. 요청, 응답을 모른다고 보면 됨

exports.renderProfile = (req, res) => {
  // 서비스를 호출
  res.render("profile", { title: "내 정보 - NodeBird" });
};

exports.renderJoin = (req, res) => {
  res.render("join", { title: "회원가입 - NodeBird" });
};

exports.renderMain = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ["id", "nick"], // 사용자 정보는 ID와 닉네임만. 비번은 프론트로 보내면 안 된다.
      },
      order: [["createdAt", "DESC"]], // 날짜 기준 내림차순(최신순) 정렬
    });
    res.render("main", {
      title: "NodeBird",
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.renderHashtag = async (req, res, next) => {
  const query = req.query.hashtag;
  console.log("req.query: ", req.query);
  if (!query) {
    // 꼭 있다는 보장이 없기 때문에 혹시나 쿼리가 없다고 하면 (항상 서버에서는 없을 때를 가정해봐야 한다.)
    return res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({
        include: [{ model: User, attributes: ["id", "nick"] }],
        order: [["createdAt", "DESC"]],
      }); // 이렇게 관계를 맺었을 시 get메서드를 사용하여 연결된 상대 모델 객체를 가져올 수 있다.
    }
    res.render("main", {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
