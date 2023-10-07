const express = require("express");
const User = require("./userModel");
const Excercise = require("./excerciseModel");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.static("public"));

// Allow POST
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app
  .route("/api/users")
  .get(async (req, res) => {
    const users = await User.find({}).select("-__v");
    res.json(users);
  })
  .post(async (req, res) => {
    const { username } = req.body;
    const user = new User({ username });
    const newUser = await user.save();
    res.json({ username, _id: newUser._id });
  });

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { duration, description, date } = req.body;
  const { _id } = req.params;
  const user = await User.findById(_id).select("-__v");
  const createUser = {
    userId: user._id.toString(),
    duration: parseInt(duration),
    description,
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };
  if (user) {
    const exercise = new Excercise(createUser);
    const newUser = await exercise.save();
    delete createUser.userId;
    res
      .status(200)
      .json({ _id: user._id, username: user.username, ...createUser });
  } else {
    res.status(404).json({ error: "user not found" });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  let response;
  const user = await User.findById(_id).select("-__v");
  if (user) {
    const query = { userId: _id };
    if (from) query.date = { ...query.date, $gte: from };
    if (to) query.date = { ...query.date, $lte: to };
    console.log({ query });
    const userExercise = await Excercise.find(query, "-__v").limit(
      parseInt(limit)
    );

    const formattedUserExercise = userExercise.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString(),
    }));
    response = {
      _id: user._id,
      username: user.username,
      count: userExercise.length,
      log: formattedUserExercise,
    };
  }
  console.log(response);
  res.json(response);
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log("Your app is listening on port " + listener.address().port);
    });
  })
  .catch((err) => {
    console.error(err.toString());
  });
