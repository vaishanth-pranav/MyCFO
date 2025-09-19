import { GoogleGenAI, Type } from "@google/genai";
import type { GeminiIntent, KnowledgeBase, SheetRow } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: ["UPDATE_VARIABLE", "SIMULATE", "GET_INFO", "QUERY_DATA", "UNKNOWN"],
    },
    params: {
      type: Type.OBJECT,
      properties: {
        variable: { type: Type.STRING, description: "The normalized variable name from the knowledge base (e.g., 'sales_rep_hired_per_month')." },
        value: { type: Type.NUMBER, description: "The numerical value to set the variable to." },
        month: { type: Type.NUMBER, description: "The 1-indexed month number to apply the change to." },
        months: { type: Type.NUMBER, description: "The number of months to simulate." },
      },
      // Don't force params for GET_INFO / UNKNOWN
      required: [],
    },
    answer: {
        type: Type.STRING,
        description: "A concise, natural language answer to the user's question about the data."
    }
  },
  required: ["intent"],
};


export const getIntentFromQuery = async (
  query: string,
  knowledgeBase: KnowledgeBase,
  sheetData: SheetRow[] | null
): Promise<GeminiIntent> => {
  const variableDetails = Object.entries(knowledgeBase.variables)
    .filter(([, config]) => !config.hidden)
    .map(
      ([key, config]) =>
        `- key: '${key}', description: '${config.description}', mutable: ${config.mutable}`
    )
    .join("\n");
  
  const dataForPrompt = sheetData ? `
## Current Data Summary
Here is a JSON representation of the current financial model data. Use this to answer questions.
\`\`\`json
${JSON.stringify(sheetData, null, 2)}
\`\`\`
` : "There is no data loaded into the model yet.";

  const prompt = `
    You are an AI assistant for a financial modeling application. Your task is to interpret a user's natural language query and convert it into a structured JSON command.

    ## Knowledge Base (available variables):
    Here is a list of variables you can interact with. Each variable has a 'key', 'description', and a 'mutable' flag indicating if it can be changed by the user.
    ${variableDetails}
    
    ${dataForPrompt}

    ## User Query:
    "${query}"

    ## Instructions:
    1. Analyze the user's query to determine their intent.
    2. **Intent 'UPDATE_VARIABLE'**: Use this if the user wants to change the value of a variable.
       - You can ONLY choose a variable where 'mutable' is true. Do NOT try to update a variable where 'mutable' is false.
       - Identify the variable they want to change by matching their phrasing to the 'description'.
       - The 'key' you return in the JSON *must* be one of the keys from the knowledge base provided above.
       - Extract the new numerical value.
       - If they specify a month (e.g., "for month 3"), extract the 1-indexed month number.
    3. **Intent 'SIMULATE'**: Use this if the user wants to forecast or project future months.
       - Extract the number of months to simulate (e.g., "next 6 months", "simulate for a year").
    4. **Intent 'QUERY_DATA'**: Use this if the user asks a question about the data in the sheet (e.g., "what's the revenue in month 5?", "when do we reach 100 customers?"). 
        - Analyze the 'Current Data Summary' JSON to find the answer. 
        - Provide the answer as a natural language sentence in the 'answer' field. Do not make up data. If the answer is not in the data, say so.
    5. **Intent 'GET_INFO'**: Use this for general questions about your capabilities or how to use the tool.
    6. **Intent 'UNKNOWN'**: If the query does not match any of the above, or is unclear.
    7. Return the result as a JSON object matching the defined schema. Ensure the 'variable' parameter in the JSON is the exact 'key' from the knowledge base.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    });

    let jsonText = response.text;

    if (typeof jsonText !== 'string') {
        console.error("Gemini response did not contain valid text.", response);
        throw new Error("Received an invalid response from the AI.");
    }
    
    jsonText = jsonText.trim();

    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7, -3).trim();
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3, -3).trim();
    }

    const parsedJson = JSON.parse(jsonText) as GeminiIntent;
    
    if (!parsedJson.params) {
      parsedJson.params = {};
    }

    return parsedJson;

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    throw new Error("Failed to interpret user query.");
  }
};