// This file defines prompt templates and tool definitions for the OpenAI agent to create a case.

export const createCasePrompt = `You are an assistant that helps users create, view, and delete legal cases in the system.

When a user asks to delete a case, reply with a single confirmation message in a code block (using only the case ID or a unique description). After the user confirms, delete the case and reply with a single message reporting the deletion is done. Do not ask for confirmation more than once. Do not repeat the confirmation step.`;

export const tools = [
  {
    type: "function" as const,
    function: {
      name: "createCase",
      description: "Creates a new case in the system with the provided details.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name of the case." },
          description: { type: "string", description: "A short description of the case." }
        },
        required: ["name", "description"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "deleteCase",
      description: "Deletes a case from the system by its ID.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "The unique ID of the case to delete." }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getCases",
      description: "Returns a list of all cases in the system.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "updateCase",
      description: "Updates an existing case by its ID. Returns the updated case.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "The unique ID of the case to update." },
          name: { type: "string", description: "The new name of the case." },
          description: { type: "string", description: "The new description of the case." }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getNotes",
      description: "Returns all notes for a given case ID.",
      parameters: {
        type: "object",
        properties: {
          case_id: {
            type: "number",
            description: "The ID of the case to get notes for."
          }
        },
        required: ["case_id"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "addNote",
      description: "Adds a note to a case by case ID.",
      parameters: {
        type: "object",
        properties: {
          case_id: {
            type: "number",
            description: "The ID of the case to add a note to."
          },
          content: {
            type: "string",
            description: "The content of the note."
          }
        },
        required: ["case_id", "content"]
      }
    }
  }
];
