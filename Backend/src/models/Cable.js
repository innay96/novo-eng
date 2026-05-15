import { RESISTIVITY_20C, TEMP_COEFFICIENT, CABLE_REACTANCE } from '../constants/cableTables.js';
import { STANDARD_SECTIONS } from '../constants/israeliStandards.js';

/**
 * Enum-like objects for cable properties
 */
export const ConductorMaterial = Object.freeze({
    COPPER: 'COPPER',
    ALUMINUM: 'ALUMINUM',
});

export const InsulationType = Object.freeze({
    PVC: 'PVC',
    XLPE: 'XLPE',
    EPR: 'EPR',
});

export const SystemType = Object.freeze({
    SINGLE_PHASE: 'SINGLE_PHASE',  // Phase + Neutral
    THREE_PHASE: 'THREE_PHASE',    // 3-phase balanced
    THREE_PHASE_WITH_NEUTRAL: 'THREE_PHASE_WITH_NEUTRAL',
    DC: 'DC',
});

/**
 * Represents a cable's physical and electrical properties.
 * This is a pure data/property model - no calculation logic here.
 */
export class Cable {
    /**
     * @param {object} params
     * @param {string} params.material - ConductorMaterial enum value
     * @param {string} params.insulation - InsulationType enum value
     * @param {number} params.section - Cross-sectional area in mm²
     * @param {number} params.length - Cable length in meters
     * @param {number} params.conductors - Number of loaded conductors (2 for SP, 3 for 3P)
     */
    constructor({ material, insulation, section, length, conductors = 3 }) {
        this._validate({ material, insulation, section, length, conductors });

        this.material = material;
        this.insulation = insulation;
        this.section = section;         // mm²
        this.length = length;           // m
        this.conductors = conductors;
    }

    _validate({ material, insulation, section, length, conductors }) {
        if (!Object.values(ConductorMaterial).includes(material)) {
            throw new Error(`Invalid material: ${material}`);
        }
        if (!Object.values(InsulationType).includes(insulation)) {
            throw new Error(`Invalid insulation: ${insulation}`);
        }
        if (!STANDARD_SECTIONS.includes(section)) {
            throw new Error(`Non-standard cable section: ${section} mm²`);
        }
        if (length <= 0) {
            throw new Error('Cable length must be positive');
        }
        if (![1, 2, 3].includes(conductors)) {
            throw new Error('Conductors must be 1, 2, or 3');
        }
    }

    /**
     * Resistance per unit length at 20°C (mΩ/m)
     */
    get resistancePerMeter20C() {
        return (RESISTIVITY_20C[this.material] / this.section) * 1000; // mΩ/m
    }

    /**
     * Resistance corrected for operating temperature (mΩ/m)
     * @param {number} operatingTemp - Conductor operating temperature in °C
     */
    resistanceAtTemp(operatingTemp) {
        const alpha = TEMP_COEFFICIENT[this.material];
        const r20 = this.resistancePerMeter20C;
        return r20 * (1 + alpha * (operatingTemp - 20));
    }

    /**
     * Total resistance for the circuit (both ways = 2 * length for SP/DC)
     * For 3-phase, we calculate per-phase (single length)
     * @param {number} operatingTemp
     * @param {string} systemType - SystemType enum
     */
    totalResistance(operatingTemp, systemType) {
        const rPerMeter = this.resistanceAtTemp(operatingTemp);
        const factor = systemType === SystemType.SINGLE_PHASE || systemType === SystemType.DC ? 2 : 1;
        return (rPerMeter * this.length * factor) / 1000; // Convert to Ω
    }

    /**
     * Approximate reactance (Ω) - for AC systems
     * Single phase: 2*L*X, three phase: L*X
     * @param {string} systemType
     */
    totalReactance(systemType) {
        const xPerMeter = CABLE_REACTANCE.DEFAULT_MV_PER_METER / 1000; // Ω/m
        const factor = systemType === SystemType.SINGLE_PHASE ? 2 : 1;
        return xPerMeter * this.length * factor;
    }

    /**
     * Returns max operating temperature based on insulation type
     */
    get maxOperatingTemp() {
        const temps = { PVC: 70, XLPE: 90, EPR: 90 };
        return temps[this.insulation];
    }

    toJSON() {
        return {
            material: this.material,
            insulation: this.insulation,
            section: this.section,
            length: this.length,
            conductors: this.conductors,
        };
    }
}