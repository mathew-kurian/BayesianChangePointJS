## BayesianChangePointJS Detection

[![Edit BayesianChangePointJS](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/hopeful-hawking-vpftt?fontsize=14&hidenavigation=1&theme=dark)

Pure JavaScript/TypeScript Bayesian changepoint detection for Browsers & NodeJS.

## Example

```typescript
import assert from "assert";
import BayesianChangePoint, { BreakPoint } from "bayesian-changepoint";

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

const detection = new BayesianChangePoint<number>({
  breakpointVerifier
});

detection.exec([10, 10, 10, 10, 5000, 5000, 5000, 5000, 30, 30, 30, 30, 30]);

assert.deepEqual(values(detection.breakPoints()), [5000, 30]);
assert.deepEqual(indicies(detection.breakPoints()), [4, 8]);
```

## Installation

```bash
npm install
npm test
```
