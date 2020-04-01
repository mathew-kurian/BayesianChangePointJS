import assert from "assert";
import BayesianChangePoint, { BreakPoint } from "../lib/BayesianChangePoint";

const breakpointVerifier = (
  next: BreakPoint<number>,
  prev: BreakPoint<number>
): boolean => {
  if (Math.abs(next.data - prev.data) >= 5) {
    return true;
  }

  return false;
};

const values = (breakPoints: BreakPoint<number>[]): number[] => {
  return breakPoints.map(breakPoint => breakPoint.data);
};

const indicies = (breakPoints: BreakPoint<number>[]): number[] => {
  return breakPoints.map(breakPoint => breakPoint.index);
};

describe("Changepoint", () => {
  it("should compute 2 breakPoints", () => {
    const detection = new BayesianChangePoint<number>({
      breakpointVerifier
    });

    detection.exec([
      10,
      10,
      10,
      10,
      5000,
      5000,
      5000,
      5000,
      30,
      30,
      30,
      30,
      30
    ]);

    assert.deepEqual(values(detection.breakPoints()), [5000, 30]);
    assert.deepEqual(indicies(detection.breakPoints()), [4, 8]);
  });

  it("should compute no breakPoints", () => {
    const detection = new BayesianChangePoint<number>({
      breakpointVerifier
    });

    detection.exec([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);

    assert.deepEqual(values(detection.breakPoints()), []);
    assert.deepEqual(indicies(detection.breakPoints()), []);
  });

  it("should compute 2 breakPoints", () => {
    const detection = new BayesianChangePoint<number>({
      breakpointVerifier
    });

    detection.exec([10, 10, 10, 10, 10, 80, 10, 10, 10, 10, 10, 10, 10]);

    assert.deepEqual(values(detection.breakPoints()), [80, 10]);
    assert.deepEqual(indicies(detection.breakPoints()), [5, 6]);
  });

  it("should compute no breakPoints", () => {
    const detection = new BayesianChangePoint<number>({
      breakpointVerifier
    });

    detection.exec([10, 80, 10, 80, 10, 80, 10, 80, 10, 80, 10, 80, 10]);

    assert.deepEqual(values(detection.breakPoints()), []);
    assert.deepEqual(indicies(detection.breakPoints()), []);
  });
});
