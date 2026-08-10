const jwt = require("jsonwebtoken");
const stationRegistrationSchema = require("../../schema/stationSchema/stationRegistrationSchema");
const userRegistrationSchema = require("../../schema/userSchema/userRegisterSchema");

const AuthenticateUser = (userSchema) => async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new Error();
    }
    const token = authorizationHeader.split(" ")[1];
    let decoded;
    if (userSchema === stationRegistrationSchema) {
      decoded = jwt.verify(token, process.env.SECRETE_KEY_STATION);
    } else if (userSchema === userRegistrationSchema) {
      decoded = jwt.verify(token, process.env.SECRETE_KEY_USER);
    }

    const user = await userSchema.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

const restrictToOwnProfile =
  (schema, idField = "stationId") =>
  async (req, res, next) => {
    try {
      const userId = req.user._id;
      const data = await schema.find({ [idField]: userId });

      if (!data || data.length === 0) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }

      // Attach the data to req for route handler
      req.data = data;

      next();
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

module.exports = { AuthenticateUser, restrictToOwnProfile };
