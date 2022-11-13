const { setOffline } = require("../service/userService");
const {
  prisma,
  errorHandling,
  ClientErrorHandling,
} = require("./prismaClient");
const modelError = require("../utils/prismaErrorHandling");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");
// desc     create new user
// route    POST /api/v1/user
// access   public
prisma.$use(async (params, next) => {
  if (params.model == "user" && params.action == "create") {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(params.args.data.password, salt);
      params.args.data.password = hash;
      const result = await next(params);
      return result;
    } catch (e) {
      createError(400, "error in bcrypt password");
    }
  }
  return next(params);
});
exports.createUser = async (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password,
      },
    });
    res.status(201).json({ data: user });
    if (err) {
      next(createError(400, "password not exists"));
    }
  } catch (e) {
    modelError(next, errorHandling, ClientErrorHandling, "user", e);
  }
};
// desc     get all user
// route    POST /api/v1/user
// access   public
exports.getAllUser = async (req, res, next) => {
  try {
    const { keyWord } = req.query;
    if (keyWord) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { firstname: { contains: keyWord.splite(" ")[0] } },
            { lastname: { contains: keyWord.splite(" ")[1] } },
          ],
        },
        include: {
          inboxId: true,
        },
      });
      res.status(200).json({ result: users.length, hdata: users });
    } else {
      const users = await prisma.user.findMany();
      res.status(200).json({ result: users.length, data: users });
    }
  } catch (e) {
    modelError(next, errorHandling, ClientErrorHandling, "user", e);
  }
};

// desc     get specific user
// route    GET /api/v1/user/:userId
// access   public

exports.getSpecificUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    res.status(200).json({ data: user });
  } catch (e) {
    modelError(next, errorHandling, ClientErrorHandling, "user", e);
  }
};

// desc     update specific user
// route    PUT /api/v1/user/:userId
// access   public
exports.updateUser = async (req, res, next) => {
  try {
    const { firstname, lastname, email } = req.body;
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstname: firstname != null ? firstname : undefined,
        lastname: lastname != null ? lastname : undefined,
        email: email != null ? email : undefined,
      },
    });
    res.status(203).json({ data: user });
  } catch (e) {
    modelError(next, errorHandling, ClientErrorHandling, "user", e);
  }
};

// desc     delete specific user
// route    delete /api/v1/user/:userId
// access   public

exports.deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  await prisma.user.delete({ where: { id: userId } });
  res.status(204).json({ msg: "success" });
};

// desc     update status
// route    PATCH /api/v1/user/:userId
// access   public

exports.updataStatusOnline = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "online",
      },
    });
    res.status(203).json({ data: user });
  } catch (e) {
    modelError(next, errorHandling, ClientErrorHandling, "user", e);
  }
};

exports.updataStatusOffline = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await setOffline(userId);
    res.status(203).json({ data: user });
  } catch (e) {
    modelError(next, errorHandling, ClientErrorHandling, "user", e);
  }
};
