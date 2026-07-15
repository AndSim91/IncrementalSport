import { describe, expect, it } from "vitest";
import {
  getSchoolYear,
  getSchoolYearStartMonth,
  isSummerBreak,
} from "./calendar";

describe("school calendar", () => {
  it("keeps September through June in one school year and starts a new one in September", () => {
    expect(getSchoolYear(1)).toBe(1);
    expect(getSchoolYear(8)).toBe(1);
    expect(getSchoolYear(9)).toBe(2);
    expect(getSchoolYear(18)).toBe(2);
    expect(getSchoolYear(20)).toBe(2);
    expect(getSchoolYear(21)).toBe(3);
  });

  it("marks only July and August as summer break", () => {
    expect(isSummerBreak(6)).toBe(false);
    expect(isSummerBreak(7)).toBe(true);
    expect(isSummerBreak(8)).toBe(true);
    expect(isSummerBreak(9)).toBe(false);
    expect(isSummerBreak(19)).toBe(true);
  });

  it("returns the first month of each school year", () => {
    expect(getSchoolYearStartMonth(1)).toBe(1);
    expect(getSchoolYearStartMonth(2)).toBe(9);
    expect(getSchoolYearStartMonth(3)).toBe(21);
  });
});
