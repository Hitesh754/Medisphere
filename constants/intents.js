export const intents = [
  {
    tag: "greeting",
    patterns: ["hi", "hello", "hey"],
    responses: [
      "Hello 👋 I'm MediSphere Assistant!",
      "Hey! How can I help you today?",
    ],
  },
  {
    tag: "meals",
    patterns: ["meal", "food", "diet"],
    responses: [
      "Check your meals in the Meals tab 🍽️",
      "Your diet plan is available in Meals section.",
    ],
  },
  {
    tag: "medicine",
    patterns: ["medicine", "tablet", "prescription"],
    responses: [
      "You can view medicines in Prescriptions 💊",
      "Check your prescription tab for details.",
    ],
  },
  {
    tag: "help",
    patterns: ["help", "support"],
    responses: [
      "I can help with meals, prescriptions, and health tips.",
    ],
  },
];