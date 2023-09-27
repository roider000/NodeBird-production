const Sequelize = require("sequelize");

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: true,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        provider: {
          type: Sequelize.ENUM("local", "kakao"),
          allowNull: false,
          defaultValue: "local",
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true, // createdAt(생성시간), updatedAt(수정시간) 자동 업데이트
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Post);
    db.User.belongsToMany(db.User, {
      // 팔로잉 사용자 모델
      foreignKey: "followingId", // 본인 모델의 기본 키(Primary Key: 그중 _id)를 참조하는 외래 키(Foreign Key)
      as: "Followers", // 상대 모델의 별칭 ex) User.getFollowers 으로 상대 모델을 불러올 수 있다.
      through: "Follow", // JOIN테이블 이름
    });
    db.User.belongsToMany(db.User, {
      // 팔로워 사용자 모델
      foreignKey: "followerId", // 본인 모델의 기본 키(Primary Key: 그중 _id)를 참조하는 외래 키(Foreign Key)
      as: "Followings", // 상대 모델의 별칭 ex) User.getFollowings 으로 상대 모델을 불러올 수 있다.
      through: "Follow", // JOIN테이블 이름
    });
  }
}

module.exports = User;
