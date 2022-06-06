import functions from "firebase-functions";
import express from "express";
import mySecretKey from "./secret.js";
import cors from "cors";

import jwt from "jsonwebtoken";

const users = [
  { id: 1, email: "todd@bocacode.com", password: "abc123" },
  { id: 2, email: "damien@bocacode.com", password: "def456" },
  { id: 3, email: "vitoria@bocacode.com", password: "ghi789" },
];

const app = express();
app.use(express.json());
app.use(cors());

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  //check to see if email and pw exist in db
  //if so, create and send back token!

  let user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
    res.status(401).send("invalid email or password");
    return;
  }
  user.password = undefined; // remove pw from user object
  //create and sign a token to send back
  const token = jwt.sign(user, mySecretKey, { expiresIn: "1h" });
  res.send(token); //{ id: 1, email: "todd@bocacode.com", password: "abc123" }
});

app.get("/public", (req, res) => {
  res.send("Welcome"); //anyone can see this
});

//requires token to see!
//get token from request headers in auth..
app.get("/private", (req, res) => {
  const token = req.headers.authorization || "";
  if (!token) {
    res.status(401).send("MEMBERS ONLY");
    return;
  }

  jwt.verify(token, mySecretKey, (err, decoded) => {
    if (err) {
      res.status(401).send("MEMBERS ONLY" + err);
      return;
    }
    res.send(`welcome ${decoded.email}!`);
  });
});

export const api = functions.https.onRequest(app);
