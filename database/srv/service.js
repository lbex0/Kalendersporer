cds = require("@sap/cds");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) 
{
  throw new Error("JWT_SECRET must be set in environment variables");
}

module.exports = (srv) => 
{

  // JWT Guard
  srv.before(["READ", "CREATE", "UPDATE", "DELETE"], "*", (req) => 
  {
    const auth = req.headers.authorization;

    if (!auth?.startsWith("Bearer ")) 
    {
      return req.reject(401, "Unauthorized");
    }
    try 
    {
      const token = auth.split(" ")[1];
      req.user = jwt.verify(token, JWT_SECRET);
    } 
    catch 
    {
      return req.reject(403, "Invalid token");
    }
  });
};
