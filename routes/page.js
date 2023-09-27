const express = require("express");
const {
  renderProfile,
  renderJoin,
  renderMain,
  renderHashtag,
} = require("../controllers/page");
const { isNotLoggedIn, isLoggedIn } = require("../middlewares");
const User = require("../models/user");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user?.Followers?.length || 0;
  res.locals.followingCount = req.user?.Followings?.length || 0;
  res.locals.followingIdList = req.user?.Followings?.map((f) => f.id) || [];
  next(); // next를 호출해야 다음 미들웨어로 넘어가는거 잊지말자.
});

router.get("/profile", isLoggedIn, renderProfile);
router.get("/join", isNotLoggedIn, renderJoin);
router.get("/", renderMain);
router.get("/hashtag", renderHashtag); //hashtag?hashtag=고양이

module.exports = router;
