import {
    INSTALLATION_METHODS,
    AMBIENT_TEMP_CORRECTION,
    GROUPING_FACTORS,
} from '../constants/israeliStandards.js';

/**
 * Represents the installation conditions for the cable.
 * Used to derive correction factors (Kt, Kg, Km).
 */
export class InstallationConditions {
    /**
     * @param {object} params
     * @param {string} params.method - Installation method key (A1, B1, C, D1, etc.)
     * @param {number} params.ambientTemp - Ambient temperature in °C
     * @param {number} params.groupCount - Number of circuits grouped together
     * @param {string} [params.insulationType] - For temperature correction factor lookup
     * @param {boolean} [params.inGround] - Whether cable is buried (affects temp base)
     * @param {number} [params.groundTemp] - Ground temperature (if inGround)
     */
    constructor({
        method = 'B1',
        ambientTemp = 35,  // Israel default: 35°C (conservative)
        groupCount = 1,
        insulationType = 'PVC',
        inGround = false,
        groundTemp = 25,
    }) {
        this._validate({ method, ambientTemp, groupCount });

        this.method = method;
        this.ambientTemp = ambientTemp;
        this.groupCount = groupCount;
        this.insulationType = insulationType;
        this.inGround = inGround;
        this.groundTemp = groundTemp;
    }

    _validate({ method, ambientTemp, groupCount }) {
        if (!INSTALLATION_METHODS[method]) {
            throw new Error(`Invalid installation method: ${method}`);
        }
        if (ambientTemp < -20 || ambientTemp > 80) {
            throw new Error(`Ambient temperature out of range: ${ambientTemp}°C`);
        }
        if (groupCount < 1) {
            throw new Error('Group count must be at least 1');
        }
    }

    /**
     * Temperature correction factor (Kt / Ca in IEC notation)
     * Corrects current capacity for ambient temp other than reference
     */
    get temperatureCorrectionFactor() {
        const table = AMBIENT_TEMP_CORRECTION.INSULATION_TYPE[this.insulationType];
        if (!table) return 1.0;

        const temp = this.inGround ? this.groundTemp : this.ambientTemp;

        // Find closest temperature in table
        const availableTemps = Object.keys(table.factors).map(Number).sort((a, b) => a - b);
        const closest = availableTemps.reduce((prev, curr) =>
            Math.abs(curr - temp) < Math.abs(prev - temp) ? curr : prev
        );

        return table.factors[closest] || 1.0;
    }

    /**
     * Grouping correction factor (Cg / Kg in IEC notation)
     */
    get groupingCorrectionFactor() {
        const counts = Object.keys(GROUPING_FACTORS).map(Number).sort((a, b) => a - b);
        // Find the closest count that is >= groupCount
        const match = counts.find(c => c >= this.groupCount);
        return match ? GROUPING_FACTORS[match] : GROUPING_FACTORS[20];
    }

    /**
     * Installation method factor (some methods have inherently different capacity)
     */
    get installationFactor() {
        return INSTALLATION_METHODS[this.method]?.factor || 1.0;
    }

    /**
     * Combined correction factor (product of all factors)
     * Applied to tabulated current capacity to get actual capacity
     */
    get combinedCorrectionFactor() {
        return this.temperatureCorrectionFactor * this.groupingCorrectionFactor;
    }

    get methodDescription() {
        return INSTALLATION_METHODS[this.method]?.label || this.method;
    }

    toJSON() {
        return {
            method: this.method,
            methodDescription: this.methodDescription,
            ambientTemp: this.ambientTemp,
            groupCount: this.groupCount,
            insulationType: this.insulationType,
            temperatureCorrectionFactor: this.temperatureCorrectionFactor,
            groupingCorrectionFactor: this.groupingCorrectionFactor,
            combinedCorrectionFactor: this.combinedCorrectionFactor,
        };
    }
}