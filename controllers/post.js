const Post = require("../models/post");
const Hashtag = require("../models/hashtag");

exports.afterUploadImage = (req, res) => {
  // 컨트롤러 오기 이전에 single 미들웨어 사용되었음
  console.log("req.file :", req.file);
  res.json({ url: req.file.location }); // 업로드된 S3의 이미지URL(original/)을 프론트로 다시 보내줌
};

exports.uploadPost = async (req, res, next) => {
  try {
    const post = await Post.create({
      // Post모델을 가져와 DB에 저장
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g); // ['#노드교과서', '#익스프레스']
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          // [프로미스, 프로미스]
          return Hashtag.findOrCreate({
            // 있으면 가져오고, 없으면 새로 생성해서 가져오고
            where: { title: tag.slice(1).toLowerCase() }, // slice(1)은 # 떼는 거/ 대문자 있음 다 소문자로 만듦
          });
        })
      );
      console.log("result :", result);
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};
