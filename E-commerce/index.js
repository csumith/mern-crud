const express = require("express");
const cors = require("cors");
require("./Db/config");
const User = require("./Db/User");
const Product = require("./Db/Product");
const Jwt = require("jsonwebtoken");
const Jwtkey = "E-commerce-Secrete_key";
const app = express();
app.use(cors());
app.use(express.json());

app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();

  result = result.toObject();
  delete result.password;
  Jwt.sign({ result }, Jwtkey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      resp.send({ result: "Something went wrong pls try after sometime" });
    } else {
      resp.send({ result, auth: token });
    }
  });
});

app.post("/login", async (req, resp) => {
  if (req.body.Email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");

    if (user) {
      Jwt.sign({ user }, Jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          resp.send({ result: "Something went wrong pls try after sometime" });
        } else {
          resp.send({ user, auth: token });
        }
      });
    } else {
      resp.send({ result: "No user found" });
    }
  } else {
    resp.send({ result: "No user found" });
  }
});

app.post("/add", verifyToken,  async (req, resp) => {
  const product = new Product(req.body);
  const result = await product.save();
  resp.send(result);
});

app.get("/product", verifyToken,  async (req, resp) => {
  const result = await Product.find();
  if (result.length > 0) {
    resp.send(result);
  } else {
    resp.send({ result: "No product found" });
  }
});

app.delete("/product/:id", async (req, resp) => {
  let ProductData = await Product.deleteOne({ _id: req.params.id });
  resp.send(ProductData);
});

app.get("/product/update/:id", verifyToken,  async (req, resp) => {
  console.log(req.body);
  let getupdateProduct = await Product.findOne({ _id: req.params.id });
  if (getupdateProduct) {
    resp.send(getupdateProduct);
  } else {
    resp.send({ result: "No result found" });
  }
});

app.put("/product/update/:id", verifyToken,  async (req, resp) => {
  const updateData = await Product.updateOne(
    {
      _id: req.params.id,
    },
    {
      $set: req.body,
    }
  );
  if (updateData) {
    resp.send(updateData);
  } else {
    resp.send({ result: "Not data Update" });
  }
});

app.get("/product/search/:key", verifyToken, async (req, resp) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { price: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
    ],
  });
  resp.send(result);
});

//middleWare
function verifyToken(req, resp, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    Jwt.verify(token, Jwtkey, (err, valid) => {
      if (err) {
        resp.status(401).send({ result: "Please Provide the valid  token" });
      } else {
        next();
      }
    });
  } else {
    resp.status(403).send({ result: "Please Provide the valid  token" });
  }
}
app.listen(5000);
