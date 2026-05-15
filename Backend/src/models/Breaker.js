/**
 * Breaker (overcurrent protection device) model.
 * Represents a circuit breaker or fuse protecting the cable.
 *
 * IEC 60364-4-43 / SI 900 requirements:
 *   IB ≤ In ≤ Iz          (breaker rated between design current and cable capacity)
 *   I2 ≤ 1.45 × Iz        (effective tripping current ≤ 1.45 × cable capacity)
 *
 * For MCBs:  I2 = 1.45 × In  → condition becomes In ≤ Iz / 0.725 (since 1/1.45 = 0.69 ≈ 0.725 for fuses)
 * For fuses: I2 = 1.6  × In  → condition becomes In ≤ Iz / 1.6 * 1.45
 */

export const BreakerType = Object.freeze({
    MCB: 'MCB',    // Miniature Circuit Breaker (ממסר זעיר)
    MCCB: 'MCCB',  // Molded Case Circuit Breaker
    FUSE: 'FUSE',  // Fuse (פיוז)
    ACB: 'ACB',   // Air Circuit Breaker (גדול, לוחות ראשיים)
});

export const BreakerCurve = Object.freeze({
    B: 'B',  // Trip at 3–5 × In  (תאורה, מעגלים רגישים)
    C: 'C',  // Trip at 5–10 × In (שימוש כללי)
    D: 'D',  // Trip at 10–20 × In (מנועים, שנאים)
});

// Standard nominal current ratings available in Israel (Amperes)
export const STANDARD_BREAKER_RATINGS = [
    6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630
];

/**
 * I2 factor - the current at which the device is guaranteed to trip.
 * Used to verify I2 ≤ 1.45 × Iz
 */
const I2_FACTOR = {
    MCB: 1.45,
    MCCB: 1.45,
    FUSE: 1.6,
    ACB: 1.25,
};

export class Breaker {
    /**
     * @param {object} params
     * @param {number} params.In         - Nominal (rated) current in Amperes
     * @param {string} params.type       - BreakerType enum
     * @param {string} [params.curve]    - BreakerCurve (for MCB/MCCB)
     * @param {number} [params.Icu]      - Ultimate breaking capacity in kA (optional)
     */
    constructor({ In, type = BreakerType.MCB, curve = BreakerCurve.C, Icu = null }) {
        this._validate({ In, type });
        this.In = In;
        this.type = type;
        this.curve = curve;
        this.Icu = Icu;
    }

    _validate({ In, type }) {
        if (In <= 0) throw new Error('Breaker rated current must be positive');
        if (!Object.values(BreakerType).includes(type)) {
            throw new Error(`Invalid breaker type: ${type}`);
        }
    }

    /**
     * I2 - the current at which this device is guaranteed to trip (A)
     */
    get I2() {
        return this.In * I2_FACTOR[this.type];
    }

    /**
     * The maximum cable Iz this breaker can protect (A)
     * Derived from: I2 ≤ 1.45 × Iz  →  Iz ≥ I2 / 1.45
     */
    minCableCapacityRequired() {
        return this.I2 / 1.45;
    }

    /**
     * Check if this breaker is correctly rated for the given IB and Iz.
     * Returns object with individual check results.
     *
     * @param {number} IB  - Design current (A)
     * @param {number} Iz  - Corrected cable capacity (A)
     */
    checkProtection(IB, Iz) {
        const condition1 = this.In >= IB;           // IB ≤ In
        const condition2 = this.In <= Iz;           // In ≤ Iz
        const condition3 = this.I2 <= 1.45 * Iz;   // I2 ≤ 1.45 × Iz

        return {
            passed: condition1 && condition2 && condition3,
            condition1: { passed: condition1, description: 'IB ≤ In', values: { IB, In: this.In } },
            condition2: { passed: condition2, description: 'In ≤ Iz', values: { In: this.In, Iz } },
            condition3: { passed: condition3, description: 'I2 ≤ 1.45 × Iz', values: { I2: this.I2, limit: 1.45 * Iz } },
        };
    }

    /**
     * Suggest the smallest standard breaker rating that satisfies IB ≤ In
     * AND In ≤ Iz (cable protection).
     *
     * @param {number} IB
     * @param {number} Iz
     * @returns {number|null} recommended In, or null if none found
     */
    static recommend(IB, Iz, type = BreakerType.MCB) {
        const i2Factor = I2_FACTOR[type];
        for (const In of STANDARD_BREAKER_RATINGS) {
            const I2 = In * i2Factor;
            if (In >= IB && In <= Iz && I2 <= 1.45 * Iz) {
                return In;
            }
        }
        return null;
    }

    toJSON() {
        return {
            In: this.In,
            type: this.type,
            curve: this.curve,
            Icu: this.Icu,
            I2: this.I2,
        };
    }
}