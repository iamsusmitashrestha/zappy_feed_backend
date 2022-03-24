import jwt from "jwt-then";

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization || "";

  try {
    const payload = await jwt.verify(token, "tero tauko");
    req.payload = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token did not match." });
  }
};

export default authMiddleware;
