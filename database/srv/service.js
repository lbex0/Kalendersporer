cds = require("@sap/cds");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!JWT_SECRET || !REFRESH_SECRET)
{
  throw new Error("JWT_SECRET and REFRESH_SECRET must be set in environment variables");
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

  srv.on("validateLogin", async (req) => 
  {
    const { username, password } = req.data;

    const loginInfo = await cds.run(
      SELECT.one.from("kalendersporer.LoginInfo").where({ username })
    );

    if (!loginInfo) 
    {
      return req.reject(401, "Invalid username or password");
    }

    const ok = await bcrypt.compare(password, loginInfo.password_hash);

    if (!ok) 
    {
      return req.reject(401, "Invalid username or password");
    }
    return {
      accessToken: jwt.sign({ username }, JWT_SECRET, { expiresIn: "1m" }),
      refreshToken: jwt.sign({ username }, REFRESH_SECRET, { expiresIn: "7d" })
    };
  });

  srv.on("refreshToken", (req) => 
  {
    try 
    {
      const payload = jwt.verify(req.data.refreshToken, REFRESH_SECRET);
      return 
      {
        accessToken: jwt.sign({ username: payload.username }, JWT_SECRET, { expiresIn: "15m" })
      };
    } 
    catch 
    {
      return req.reject(403, "Invalid or expired refresh token");
    }
  });
};