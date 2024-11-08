import fs from "fs";
import path from "path";

const dataFilePath = path.join("/tmp", "notes.json");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  switch (req.method) {
    case "GET":
      return getNotes(req, res);
    case "POST":
      return addNote(req, res);
    case "PUT":
      return updateNote(req, res);
    case "DELETE":
      return deleteNote(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

let notes = [
  { id: 1, title: "Sample Note", content: "This is a sample note." },
];

function readNotes() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]), "utf-8");
  }
  const fileData = fs.readFileSync(dataFilePath, "utf-8");
  return JSON.parse(fileData);
}

function writeNotes(notes) {
  fs.writeFileSync(dataFilePath, JSON.stringify(notes, null, 2), "utf-8");
}

// Retrieve all notes
function getNotes(req, res) {
  let notes = readNotes();

  if (notes.length === 0) {
    notes = [
      {
        id: 15345563453,
        title: "Sample Note",
        content: "This is a sample note.",
      },
    ];
    writeNotes(notes);
  }
  res.status(200).json(notes);
}

// Add a new note
function addNote(req, res) {
  const notes = readNotes();
  const newNote = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
  };
  notes.push(newNote);
  writeNotes(notes);
  res.status(201).json(newNote);
}

// Update an existing note
function updateNote(req, res) {
  const notes = readNotes();
  const { id, title, content } = req.body;
  const noteIndex = notes.findIndex((note) => note.id === id);
  if (noteIndex === -1) {
    return res.status(404).json({ message: "Note not found" });
  }
  notes[noteIndex] = { id, title, content };
  writeNotes(notes);
  res.status(200).json(notes[noteIndex]);
}

// Delete a note
function deleteNote(req, res) {
  const notes = readNotes();
  const { id } = req.query;
  const updatedNotes = notes.filter((note) => note.id !== parseInt(id));
  writeNotes(updatedNotes);
  res.status(200).json({ message: "Note deleted successfully" });
}
