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
  await Note.create({ content, category, userId: foundUser._id });

  res.json({ message: `Note created successfully.` });
});

app.get("/:user/notes", async (req, res) => {
  await connect();
  // const { user } = req.params;

  const notes = await Note.find().populate("userId");
  res.json(notes);
});

// GET-Route to get all notes
app.get("/notes", async (req, res) => {
  await connect();
  const notes = await Note.find();

  if (!notes.length) {
    return res.json({ message: "Sorry, could not find any notes." });
  }
  res.json(notes);
});

// Neue POST-Route für das Hinzufügen von Notizen
app.post("/notes", async (req, res) => {
  await connect();
  const { content, category } = req.body;
  const newNote = new Note({
    content,
    category,
  });
  await newNote.save();
  res.json({ id: newNote._id });
});

// Neue GET-Route für das Abrufen einer einzelnen Notiz
app.get("/notes/:id", async (req, res) => {
  await connect();
  const { id } = req.params;
  const note = await Note.findById(id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).send("Note not found");
  }
});

// Neue PATCH-Route für das Aktualisieren einer einzelnen Notiz
app.patch("/notes/:id", async (req, res) => {
  await connect();
  const { id } = req.params;
  const { content, category } = req.body;
  const note = await Note.findByIdAndUpdate(
    id,
    { content, category },
    { new: true }
  );
  if (note) {
    res.json({ message: "Note updated successfully", note });
  } else {
    res.status(404).send("Note not found");
  }
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
