const fs = require("fs");
const path = require("path");

const dataFilePath = path.join("/tmp", "notes.json");

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event)); // Debug log

  const { body, queryStringParameters } = event;
  const httpMethod = event.requestContext?.http?.method;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: null,
    };
  }

  try {
    switch (httpMethod) {
      case "GET":
        return { ...getNotes(), headers };
      case "POST":
        return { ...addNote(JSON.parse(body)), headers };
      case "PUT":
        return { ...updateNote(JSON.parse(body)), headers };
      case "DELETE":
        return { ...deleteNote(queryStringParameters?.id), headers };
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ message: `Method ${httpMethod} Not Allowed` }),
        };
    }
  } catch (error) {
    console.error("Error processing the request:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};

function readNotes() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify([]), "utf-8");
    }
    const fileData = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading notes:", error);
    throw new Error("Unable to read notes file");
  }
}

function writeNotes(notes) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(notes, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing notes:", error);
    throw new Error("Unable to write notes to file");
  }
}

function getNotes() {
  console.log("Getting notes...");
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
  console.log("Returning notes:", JSON.stringify(notes));
  return {
    statusCode: 200,
    body: JSON.stringify(notes),
  };
}

function addNote(data) {
  console.log("Adding new note:", data);
  const notes = readNotes();
  const newNote = { id: Date.now(), title: data.title, content: data.content };
  notes.push(newNote);
  writeNotes(notes);
  console.log("New note added:", JSON.stringify(newNote));
  return {
    statusCode: 201,
    body: JSON.stringify(newNote),
  };
}

function updateNote(data) {
  console.log("Updating note with data:", data);
  const notes = readNotes();
  const { id, title, content } = data;
  const noteIndex = notes.findIndex((note) => note.id === id);
  if (noteIndex === -1) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Note not found" }),
    };
  }
  notes[noteIndex] = { id, title, content };
  writeNotes(notes);
  console.log("Updated note:", JSON.stringify(notes[noteIndex]));
  return {
    statusCode: 200,
    body: JSON.stringify(notes[noteIndex]),
  };
}

function deleteNote(id) {
  console.log("Deleting note with id:", id);
  const notes = readNotes();
  const updatedNotes = notes.filter((note) => note.id !== parseInt(id));
  if (updatedNotes.length === notes.length) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Note not found" }),
    };
  }
  writeNotes(updatedNotes);
  console.log("Note deleted successfully");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Note deleted successfully" }),
  };
}
