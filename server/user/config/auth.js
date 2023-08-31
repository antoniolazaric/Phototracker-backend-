const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    //console.log(token);
    const decoded = jwt.verify(token, "secret");
    req.userData = decoded;
    // console.log(req.userData);
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Authentification Failed",
    });
  }
};

exports.verify = async (req, res, next) => {
  if (req.headers["authorization"]) {
    try {
      let authorization = req.headers["authorization"].split(" ");
      if (authorization[0] !== "Bearer") {
        return res.status(401).send(); // HTTP invalid requets
      } else {
        let token = authorization[1];
        // spremi uz upit rezultat JWT provjere tokena (rezultat su podaci o

        // verify baca grešku(exception) ako ne uspije provjera
        req.jwt = jwt.verify(authorization[1], "secret");
        return next(); // Sve je ok, možemo prijeći na konkretan upit
      }
    } catch (err) {
      return res.status(403).send(); // HTTP not-authorized
    }
  } else {
    return res.status(401).send(); // HTTP invalid request
  }
};
