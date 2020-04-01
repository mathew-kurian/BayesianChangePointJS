export declare type Iteratee<T> = (t: T, index: number) => number;
export declare type BreakPointVerifier<T> = (next: BreakPoint<T>, prev: BreakPoint<T>) => boolean;
export declare type BreakPoint<T> = {
    data: T;
    index: number;
};
export default class BayesianChangePoint<T = number> {
    private breakpointVerifier;
    private iteratee;
    private chunkSize;
    private init;
    private maximum;
    private model;
    private mu0;
    private kappa0;
    private alpha0;
    private beta0;
    private breakPoints_;
    private iteration;
    private muT;
    private kappaT;
    private alphaT;
    private betaT;
    private data;
    private size;
    constructor({ breakpointVerifier, iteratee, chunkSize }: {
        breakpointVerifier: BreakPointVerifier<T>;
        iteratee?: Iteratee<T>;
        chunkSize?: number;
    });
    exec(data: T[]): void;
    private get;
    private run;
    private update;
    private computeIndex;
    private computeBreakPoints;
    breakPoints(): BreakPoint<T>[];
}
