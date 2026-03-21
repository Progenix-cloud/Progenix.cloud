import { describe, it, expect } from "vitest";

const calculateRice = (
  reach: number,
  impact: number,
  confidence: number,
  effort: number
) => {
  const result = (reach * impact * confidence) / effort;
  return Math.round(result * 100) / 100;
};

describe("RICE Score Calculation", () => {
  it("standard calculation", () => {
    const score = calculateRice(1000, 3, 0.8, 2);
    expect(score).toBeCloseTo(1200);
  });

  it("edge cases", () => {
    expect(calculateRice(0, 10, 1, 1)).toBe(0);
    expect(calculateRice(1000, 0, 1, 1)).toBe(0);
    expect(calculateRice(1000, 10, 0, 1)).toBe(0);
    expect(calculateRice(1000, 10, 1, 10000)).toBeCloseTo(1);
  });
});
