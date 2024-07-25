require("dotenv").config();
const express = require("express");
const connect = require("./lib/connect");
const Note = require("./model/notes");
const User = require("./model/users");
const app = express();
const port = process.env.PORT || 3000;

// für die Anfragen mit JSON-Dateien:
app.use(express.json());

app.get("/", (req, res) => res.type("html").send(html));

app.post("/users", async (req, res) => {
  await connect();
  const { name } = req.body;
  const created = await User.create({ name });

  if (!created?._id) {
    return res.json({ message: "Sorry, user could not be created." });
  }

  res.json({ message: `User ${name} created successfully. ` });
});

app.post("/:user/notes", async (req, res) => {
  await connect();
  const { user } = req.params;
  const { content, category } = req.body;
  const foundUser = await User.findOne({ name: user });

  const created = await Note.create({
    content,
    category,
    userId: foundUser._id,
  });

  res.json({ message: `Note created successfully.` });
});

app.get("/:user/notes", async (req, res) => {
  await connect();
  const { user } = req.params;
  const foundUser = await User.findOne({ name: user });

  const notes = await Note.find({ userId: foundUser._id }).populate(
    "userId",
    "-_id"
  );
  res.json(notes);
});

// GET Route to get all notes
app.get("/notes", async (req, res) => {
  await connect();
  const notes = await Note.find();

  if (!notes.length) {
    return res.json({ message: "Sorry, could not find any notes." });
  }
  res.json(notes);
});

// GET Route to get all users
app.get("/users", async (req, res) => {
  await connect();
  const users = await User.find();

  if (!users.length) {
    return res.json({ message: "Sorry, could not find any users." });
  }
  res.json(users);
});

// Get Route for a single note
app.get("/:user/notes/:id", async (req, res) => {
  await connect();
  const { user, id } = req.params;

  const foundUser = await User.findOne({ name: user });

  if (!foundUser) {
    return res.json({ message: "User not found." });
  }

  const note = await Note.findOne({ _id: id, userId: foundUser._id });

  if (!note) {
    return res.json({ message: "Note not found." });
  }

  res.json(note);
});

// Patch Route to change a single note
app.patch("/:user/notes/:id", async (req, res) => {
  await connect();
  const { user, id } = req.params;
  const { content, category } = req.body;
  const foundUser = await User.findOne({ name: user });

  if (!foundUser) {
    return res.json({ message: "User not found." });
  }
  // looking for a note with the wanted id and the userId that fits to the foundUser
  // then the note is updated with new value for content and category
  const updatedNote = await Note.findOneAndUpdate(
    { _id: id, userId: foundUser._id },
    { content, category },
    { new: true }
  );

  if (!updatedNote) {
    return res.json({ message: "Note not found or could not be updated." });
  }

  res.json({ message: "Note updated successfully.", note: updatedNote });
});

// Delete Route for a single note
app.delete("/:user/notes/:id", async (req, res) => {
  await connect();
  const { user, id } = req.params;

  const foundUser = await User.findOne({ name: user });

  if (!foundUser) {
    return res.json({ message: "User not found." });
  }

  const deletedNote = await Note.findOneAndDelete({
    _id: id,
    userId: foundUser._id,
  });

  if (!deletedNote) {
    return res.json({ message: "Note not found or could not be deleted." });
  }

  res.json({ message: "Note deleted successfully." });
});

const server = app.listen(port, () =>
  console.log(`Express app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Welcome to our note app!
    </section>
  </body>
</html>
`;

// Mariias Lösungen:

// const noteSchema = new Schema(
//   {
//     content: { type: String, required: true },
//     category: { type: String, required: true },
//   },
//   {
//     toJSON: {
//       virtuals: true,
//       transform: (doc, ret) => {
//         // Remove fields that you do not want to be included in the response
//         delete ret.__v;
//         delete ret.id;
//         return {
//           id: ret._id,
//           content: ret.content,
//           category: ret.category,
//         };
//       },
//     },
//   }
// );

// app.get("/notes/category/:category", async (req, res) => {
//   await connect();
//   try {
//     const { category } = req.params;
//     //for a find({obj:obj from req.params}) we need to send an object
//     const notes = await Note.find({ category }); //{ category : req.params.category}
//     res.json(notes);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
