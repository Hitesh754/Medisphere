import { intents } from "@/constants/intents";
import { useAppStore } from "@/store/useAppStore";

export function getReply(message: string): string {
  const input = message.toLowerCase();

  const scanResult = useAppStore.getState().scanResult;

  if (input.includes("medicine") || input.includes("prescription")) {
    if (!scanResult) {
      return "No prescription scanned yet 📄";
    }

    return `Your medicines are: ${scanResult.Medicine?.join(", ")}`;
  }

  if (input.includes("dosage")) {
    if (!scanResult) return "No dosage info available.";

    return `Dosages: ${scanResult.Dosage?.join(", ")}`;
  }

  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      if (input.includes(pattern)) {
        const responses = intent.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }

  return "I didn’t understand 🤔 Try asking about medicines.";
}