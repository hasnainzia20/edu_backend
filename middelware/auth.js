// middelware/auth.js
import jwt from "jsonwebtoken";
import { User, Student, Instructor } from "../models/User.js";

export const auth = async (req, res, next) => {
  console.log(req.headers);
  debugger;
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user object with _id and role
    req.user = {
      _id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware to restrict roles
export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
