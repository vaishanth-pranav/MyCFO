import { GoogleGenAI, Type } from "@google/genai";
import type { GeminiIntent, KnowledgeBase } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: ['UPDATE_VARIABLE', 'SIMULATE', 'GET_INFO', 'UNKNOWN'],
    },
    params: {
      type: Type.OBJECT,
      properties: {
        variable: { type: Type.STRING, description: "The normalized variable name from the knowledge base (e.g., 'sales_people')." },
        value: { type: Type.NUMBER, description: "The numerical value to set the variable to." },
        month: { type: Type.NUMBER, description: "The 1-indexed month number to apply the change to." },
        months: { type: Type.NUMBER, description: "The number of months to simulate." },
      },
    },
  },
  required: ["intent", "params"],
};

export const getIntentFromQuery = async (query: string, knowledgeBase: KnowledgeBase): Promise<GeminiIntent> => {
  const variableNames = Object.keys(knowledgeBase.variables).join(', ');

  const prompt = `
    You are an AI assistant for a financial modeling application. Your task is to interpret a user's natural language query and convert it into a structured JSON command.

    ## Knowledge Base (available variables):
    ${variableNames}

    ## User Query:
    "${query}"

    ## Instructions:
    1. Analyze the user's query to determine their intent.
    2. **Intent 'UPDATE_VARIABLE'**: Use this if the user wants to change the value of a variable.
       - Identify the variable they want to change. Normalize it to match a name from the knowledge base.
       - Extract the new numerical value.
       - If they specify a month (e.g., "for month 3"), extract the month number.
    3. **Intent 'SIMULATE'**: Use this if the user wants to forecast or project future months.
       - Extract the number of months to simulate (e.g., "next 6 months", "simulate for a year").
    4. **Intent 'GET_INFO'**: Use this for general questions about your capabilities or how to use the tool.
    5. **Intent 'UNKNOWN'**: If the query does not match any of the above, or is unclear.
    6. Return the result as a JSON object matching the defined schema.
    
    ## Examples:
    - Query: "set the number of sales people to 15" -> Intent: UPDATE_VARIABLE, Params: {variable: "sales_people", value: 15}
    - Query: "simulate 6 months ahead" -> Intent: SIMULATE, Params: {months: 6}
    - Query: "what can you do?" -> Intent: GET_INFO, Params: {}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as GeminiIntent;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to interpret user query.");
  }
};
