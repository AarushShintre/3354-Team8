import {
  calculateCompatibilityScore,
  calculatePaymentSuggestion,
  sortRecommendations,
} from "@/lib/calculations";
import { Recommendation, UserProfile } from "@/lib/types";

const baseProfile: UserProfile = {
  id: 1,
  name: "Jordan",
  bio: "",
  location: "North",
  typicalDrivingTimes: "Morning",
  contactInfo: "",
  parkingPass: "",
  major: "Engineering",
  extracurriculars: "Robotics",
};

describe("calculateCompatibilityScore", () => {
  it("rewards overlapping profile attributes", () => {
    const candidate: UserProfile = {
      ...baseProfile,
      id: 2,
    };
    expect(calculateCompatibilityScore(baseProfile, candidate)).toBeGreaterThan(0);
  });

  it("returns zero when nothing overlaps", () => {
    const candidate: UserProfile = {
      ...baseProfile,
      id: 3,
      location: "South",
      typicalDrivingTimes: "Night",
      major: "History",
      extracurriculars: "Basketball",
    };
    expect(calculateCompatibilityScore(baseProfile, candidate)).toBe(0);
  });
});

describe("calculatePaymentSuggestion", () => {
  it("creates predictable suggestions using positive inputs", () => {
    expect(calculatePaymentSuggestion(10, 3.5)).toBeCloseTo(5.16, 2);
  });

  it("handles negative numbers defensively", () => {
    expect(calculatePaymentSuggestion(-10, -3)).toBeGreaterThan(0);
  });
});

describe("sortRecommendations", () => {
  const recommendations: Recommendation[] = [
    { user: { ...baseProfile, id: 2, name: "Casey", location: "Central" }, score: 4 },
    { user: { ...baseProfile, id: 3, name: "Aria", location: "East" }, score: 8 },
  ];

  it("sorts by score descending by default", () => {
    const sorted = sortRecommendations(recommendations, "score");
    expect(sorted[0].score).toBeGreaterThanOrEqual(sorted[1].score);
  });

  it("sorts alphabetically when filtering by location", () => {
    const sorted = sortRecommendations(recommendations, "location");
    expect(sorted[0].user.location <= sorted[1].user.location).toBeTruthy();
  });
});

