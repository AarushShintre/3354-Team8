import { Recommendation, UserProfile } from "@/lib/types";

export function calculateCompatibilityScore(
  reference: UserProfile,
  candidate: UserProfile,
): number {
  let score = 0;
  if (reference.location && reference.location === candidate.location) {
    score += 3;
  }
  if (
    reference.typicalDrivingTimes &&
    reference.typicalDrivingTimes === candidate.typicalDrivingTimes
  ) {
    score += 2;
  }
  if (reference.major && reference.major === candidate.major) {
    score += 2;
  }
  if (
    reference.extracurriculars &&
    reference.extracurriculars === candidate.extracurriculars
  ) {
    score += 1;
  }
  return score;
}

export function calculatePaymentSuggestion(
  distanceMiles: number,
  gasPrice: number,
): number {
  const safeDistance = Math.max(distanceMiles, 0);
  const safeGasPrice = Math.max(gasPrice, 0);
  const baseFare = 2.5;
  const mpg = 24;
  const fuelCost = (safeDistance / mpg) * safeGasPrice;
  const wearBuffer = safeDistance * 0.12;
  return Number((baseFare + fuelCost + wearBuffer).toFixed(2));
}

export function sortRecommendations(
  recommendations: Recommendation[],
  sortBy: "score" | "location" | "times" | "major" | "extracurriculars",
): Recommendation[] {
  return [...recommendations].sort((a, b) => {
    switch (sortBy) {
      case "location":
        return a.user.location.localeCompare(b.user.location);
      case "times":
        return a.user.typicalDrivingTimes.localeCompare(b.user.typicalDrivingTimes);
      case "major":
        return a.user.major.localeCompare(b.user.major);
      case "extracurriculars":
        return a.user.extracurriculars.localeCompare(b.user.extracurriculars);
      default:
        return b.score - a.score;
    }
  });
}

