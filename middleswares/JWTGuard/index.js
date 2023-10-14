const { verify } = require("jsonwebtoken");

exports.JWTGuard = (...allowedRoles) => {
  return (req, res, next) => {
    const token =
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1];
    if (!token)
      return res.status(200).json({ success: false, message: "Token Required" });
    else {
      if (process.env.TOKEN) {
        verify(token, process.env.TOKEN, { complete: true }, (err, decoded) => {
          if (!decoded)
            return res
              .status(200)
              .json({ success: false, message: "Invalid Token" });
          const { id, role } = decoded.payload;
          if (allowedRoles.length) {
            if (!allowedRoles.includes(role))
              return res.status(200).json({
                success: false,
                message: `Only ${allowedRoles.join(
                  "-"
                )} has access to this api.`,
              });
          }
          req.user = { id, role };
          next();
        });
      } else {
        res.status(200).json({ success: false, message: "Token is required" });
      }
    }
  };
};
