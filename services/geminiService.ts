import { GoogleGenAI } from "@google/genai";
import { Task, Observation } from "../types";

export const generateWeeklySummary = async (
  tasks: Task[], 
  observations: Observation[], 
  userInstructions?: string
): Promise<string> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Done' && t.status !== 'Archived').length;
  const highPriority = tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
  const recentObs = observations.slice(0, 5).map(o => o.content).join("; ");

  const prompt = `
    Analyze the following productivity data for the week:
    - Completed Tasks: ${completedTasks}
    - Pending Tasks: ${pendingTasks}
    - High Priority Pending: ${highPriority}
    - Recent Observations: ${recentObs}
    
    ${userInstructions ? `User Custom Instructions: ${userInstructions}` : ''}

    Provide a concise, professional executive summary (max 3 paragraphs). 
    Focus on throughput, bottlenecks indicated by high priority items, and patterns in observations.
    Use a motivating but objective tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate summary.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate summary. Please check your network connection.");
  }
};