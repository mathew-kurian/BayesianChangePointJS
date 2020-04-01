"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PDF_1 = __importDefault(require("./PDF"));
const fill = (arr, value) => {
    for (let i = 0, length = arr.length; i < length; i++) {
        arr[i] = value;
    }
};
const chunker = (arr, chunkSize) => {
    let temp = [];
    for (let i = 0, j = arr.length; i < j; i += chunkSize) {
        temp.push(arr.slice(i, i + chunkSize));
    }
    return temp;
};
const defaultIteratee = (t, index) => {
    if (typeof t === "number") {
        return t;
    }
    throw Error("Specifiy an iteratee");
};
class BayesianChangePoint {
    constructor({ breakpointVerifier, iteratee = defaultIteratee, chunkSize = 1000 }) {
        this.iteratee = iteratee;
        this.breakpointVerifier = breakpointVerifier;
        this.chunkSize = chunkSize;
        this.init = false;
        this.maximum = [];
        this.model = [];
        this.mu0 = 0.0;
        this.kappa0 = 1.0;
        this.alpha0 = 1.0;
        this.beta0 = 1.0;
        this.muT = [this.mu0];
        this.kappaT = [this.kappa0];
        this.alphaT = [this.alpha0];
        this.betaT = [this.beta0];
        this.breakPoints_ = [];
        this.iteration = 0;
        this.data = [];
        this.size = 0;
    }
    exec(data) {
        const chunkSize = this.chunkSize;
        if (!this.init) {
            const maximum = (this.maximum = new Array(chunkSize + 1));
            fill(maximum, 0);
            const model = (this.model = new Array(chunkSize + 1));
            fill(model, 0);
            for (let i = 0; i < model.length; i++) {
                model[i] = new Array(chunkSize + 1);
                fill(model[i], 0);
            }
            model[0][0] = 1;
            this.mu0 = 0.0;
            this.kappa0 = 1.0;
            this.alpha0 = 1.0;
            this.beta0 = 1.0;
            this.muT = [this.mu0];
            this.kappaT = [this.kappa0];
            this.alphaT = [this.alpha0];
            this.betaT = [this.beta0];
            this.breakPoints_ = [];
            this.iteration = 0;
            this.init = true;
        }
        const chunks = chunker(data, chunkSize);
        for (let i = 0, length = chunks.length; i < length; i++) {
            const data = chunks[0];
            this.data = data;
            this.size = data.length;
            this.iteration = i;
            this.run();
            this.computeBreakPoints();
            const model = this.model;
            const lastPrior = model[model.length - 1];
            for (let i = 0; i < model.length; i++) {
                model[i] = new Array(chunkSize + 1);
                fill(model[i], 0);
            }
            model[0] = lastPrior;
            model[0][0] = 1;
        }
    }
    get(i) {
        return this.iteratee(this.data[i], i);
    }
    run() {
        let H;
        let sum;
        let normSum;
        let maxVal;
        let maxIdx = 0;
        for (let t = 0; t < this.size; t++) {
            const arr = new Array(t + 1);
            for (let i = 0; i <= t; i++) {
                arr[i] =
                    (this.betaT[i] * (this.kappaT[i] + 1)) /
                        (this.alphaT[i] * this.kappaT[i]);
            }
            const predictedProbabilities = PDF_1.default.predict(this.get(t), this.muT, arr, this.alphaT);
            H = 0.005;
            for (let idx = 1; idx <= t + 1; idx++) {
                this.model[idx][t + 1] =
                    this.model[idx - 1][t] * predictedProbabilities[idx - 1] * (1 - H);
            }
            sum = 0.0;
            for (let idx = 0; idx <= t; idx++) {
                sum = sum + this.model[idx][t] * predictedProbabilities[idx] * H;
            }
            this.model[0][t + 1] = sum;
            normSum = 0.0;
            for (let idx = 0; idx < this.size; idx++) {
                normSum = normSum + this.model[idx][t + 1];
            }
            for (let idx = 0; idx <= this.size; idx++) {
                this.model[idx][t + 1] = this.model[idx][t + 1] / normSum;
            }
            this.update(t);
            maxVal = Number.MIN_VALUE;
            for (let idx = 0; idx <= t; idx++) {
                if (this.model[idx][t] > maxVal) {
                    maxVal = this.model[idx][t];
                    maxIdx = idx;
                }
            }
            this.maximum[t] = maxIdx;
        }
    }
    update(t) {
        let muT0Temp;
        let kappaT0Temp;
        let alphaT0Temp;
        let betaT0Temp;
        muT0Temp = new Array(t + 2);
        kappaT0Temp = new Array(t + 2);
        alphaT0Temp = new Array(t + 2);
        betaT0Temp = new Array(t + 2);
        muT0Temp[0] = this.mu0;
        kappaT0Temp[0] = this.kappa0;
        alphaT0Temp[0] = this.alpha0;
        betaT0Temp[0] = this.beta0;
        for (let i = 0; i <= t; i++) {
            muT0Temp[i + 1] =
                (this.kappaT[i] * this.muT[i] + this.get(t)) / (this.kappaT[i] + 1);
            kappaT0Temp[i + 1] = this.kappaT[i] + 1;
            alphaT0Temp[i + 1] = this.alphaT[i] + 0.5;
            betaT0Temp[i + 1] =
                this.betaT[i] +
                    (this.kappaT[i] * Math.pow((this.get(t) - this.muT[i]), 2)) /
                        (2 * (this.kappaT[i] + 1));
        }
        this.muT = muT0Temp;
        this.kappaT = kappaT0Temp;
        this.alphaT = alphaT0Temp;
        this.betaT = betaT0Temp;
    }
    computeIndex(index) {
        return this.iteration * this.chunkSize + index;
    }
    computeBreakPoints() {
        let breakPoints = this.breakPoints_;
        let breakPoint = 0;
        let lastBreakPoint = breakPoints[0];
        for (let i = 1; i < this.size; i++) {
            if (this.maximum[i - 1] > this.maximum[i]) {
                breakPoint = i - this.maximum[i];
                if (breakPoints.length === 0) {
                    lastBreakPoint = {
                        data: this.data[breakPoint],
                        index: this.computeIndex(breakPoint)
                    };
                    breakPoints.push(lastBreakPoint);
                }
                else {
                    const potentialBreakpoint = {
                        data: this.data[breakPoint],
                        index: this.computeIndex(breakPoint)
                    };
                    if (this.breakpointVerifier(potentialBreakpoint, lastBreakPoint)) {
                        lastBreakPoint = potentialBreakpoint;
                        breakPoints.push(lastBreakPoint);
                    }
                }
            }
        }
    }
    breakPoints() {
        return [...this.breakPoints_].sort((a, b) => a.index - b.index);
    }
}
exports.default = BayesianChangePoint;
