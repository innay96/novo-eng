import {
    COPPER_PVC_CAPACITY,
    COPPER_XLPE_CAPACITY,
    ALUMINUM_PVC_CAPACITY,
    ALUMINUM_XLPE_CAPACITY,
} from '../constants/cableTables.js';
import {
    VOLTAGE_DROP_LIMITS,
    STANDARD_SECTIONS,
} from '../constants/israeliStandards.js';
import { Cable, ConductorMaterial, InsulationType, SystemType } from '../models/Cable.js';
import { Breaker } from '../models/Breaker.js';

function getTabulatedCapacity(cable, method) {
    const { material, insulation, section } = cable;
    let table;
    if (material === ConductorMaterial.COPPER && insulation === InsulationType.PVC) {
        table = COPPER_PVC_CAPACITY;
    } else if (material === ConductorMaterial.COPPER) {
        table = COPPER_XLPE_CAPACITY;
    } else if (material === ConductorMaterial.ALUMINUM && insulation === InsulationType.PVC) {
        table = ALUMINUM_PVC_CAPACITY;
    } else {
        table = ALUMINUM_XLPE_CAPACITY;
    }
    return table[section]?.[method] ?? null;
}

function calculateVoltageDrop(cable, load) {
    const { systemType, voltage, powerFactor } = load;
    const sinPhi = Math.sqrt(1 - powerFactor ** 2);
    const rPerMeter = cable.resistanceAtTemp(cable.maxOperatingTemp) / 1000; // Ω/m
    const xPerMeter = 0.08 / 1000; // Ω/m typical LV
    const I = load.designCurrent;
    const L = cable.length;

    let deltaU;
    if (systemType === SystemType.SINGLE_PHASE || systemType === SystemType.DC) {
        deltaU = 2 * I * L * (rPerMeter * powerFactor + xPerMeter * sinPhi);
    } else {
        deltaU = Math.sqrt(3) * I * L * (rPerMeter * powerFactor + xPerMeter * sinPhi);
    }

    return { voltageDrop: deltaU, voltageDropPercent: (deltaU / voltage) * 100 };
}

/**
 * Main calculation function.
 * @param {Cable} cable
 * @param {Load} load
 * @param {InstallationConditions} conditions
 * @param {Breaker|null} breaker - if null, auto-recommends
 */
export function calculateCableSection(cable, load, conditions, breaker = null) {
    const IB = load.designCurrent;

    // 1. Tabulated capacity
    const Iz_table = getTabulatedCapacity(cable, conditions.method);
    if (Iz_table === null) {
        return CalculationResult.error(
            `אין נתוני קיבולת עבור ${cable.material} ${cable.insulation} ${cable.section}mm² שיטה ${conditions.method}`
        );
    }

    // 2. Corrected capacity
    const correctionFactor = conditions.combinedCorrectionFactor;
    const Iz_corrected = Iz_table * correctionFactor;

    // 3. Current check
    const currentAdequate = Iz_corrected >= IB;
    const currentUtilization = (IB / Iz_corrected) * 100;

    // 4. Voltage drop
    const { voltageDrop, voltageDropPercent } = calculateVoltageDrop(cable, load);
    const maxVoltageDropPercent = VOLTAGE_DROP_LIMITS[load.loadType] || 5;
    const voltageDropOk = voltageDropPercent <= maxVoltageDropPercent;

    // 5. Breaker checks (IEC 60364-4-43)
    let breakerCheck = null;
    let recommendedBreakerIn = null;

    if (breaker) {
        // Validate user-provided breaker
        breakerCheck = breaker.checkProtection(IB, Iz_corrected);
    } else {
        // Auto-recommend smallest valid breaker
        recommendedBreakerIn = Breaker.recommend(IB, Iz_corrected, 'MCB');
        if (recommendedBreakerIn) {
            const rec = new Breaker({ In: recommendedBreakerIn });
            breakerCheck = rec.checkProtection(IB, Iz_corrected);
        }
    }

    const breakerOk = breakerCheck ? breakerCheck.passed : true;
    const passed = currentAdequate && voltageDropOk && breakerOk;

    return new CalculationResult({
        passed, cable, load, conditions, breaker,
        IB, Iz_table, correctionFactor, Iz_corrected,
        currentAdequate, currentUtilization,
        voltageDrop, voltageDropPercent, maxVoltageDropPercent, voltageDropOk,
        breakerCheck, recommendedBreakerIn,
        temperatureFactor: conditions.temperatureCorrectionFactor,
        groupingFactor: conditions.groupingCorrectionFactor,
    });
}

/**
 * Finds minimum passing cable section.
 */
export function recommendCableSection(load, conditions, cableParams, breaker = null) {
    const results = [];

    for (const section of STANDARD_SECTIONS) {
        try {
            const cable = new Cable({ ...cableParams, section });
            const result = calculateCableSection(cable, load, conditions, breaker);
            results.push(result);

            if (result.passed) {
                result.isRecommended = true;
                result.allTestedSections = results;
                return result;
            }
        } catch (e) {
            continue; // skip invalid combinations (e.g. AL < 10mm²)
        }
    }

    const last = results[results.length - 1];
    if (last) {
        last.allTestedSections = results;
        last.errorMessage = 'אין חתך סטנדרטי שעומד בכל הדרישות';
    }
    return last || CalculationResult.error('לא נמצא כבל מתאים');
}

export class CalculationResult {
    constructor(data) {
        Object.assign(this, data);
    }

    static error(message) {
        return new CalculationResult({ passed: false, errorMessage: message });
    }

    get summary() {
        if (this.errorMessage) return `❌ שגיאה: ${this.errorMessage}`;
        return [
            `כבל: ${this.cable?.material} ${this.cable?.insulation} ${this.cable?.section}mm² × ${this.cable?.length}m`,
            `זרם עיצוב (IB): ${this.IB?.toFixed(2)}A`,
            `קיבולת מתוקנת (Iz): ${this.Iz_corrected?.toFixed(2)}A (${this.currentUtilization?.toFixed(1)}% ניצול)`,
            `נפילת מתח: ${this.voltageDropPercent?.toFixed(2)}% (מקסימום ${this.maxVoltageDropPercent}%)`,
            this.recommendedBreakerIn ? `מבטח מומלץ: ${this.recommendedBreakerIn}A` : '',
            `תוצאה: ${this.passed ? '✅ עובר' : '❌ נכשל'}`,
        ].filter(Boolean).join('\n');
    }

    toJSON() {
        return {
            passed: this.passed,
            errorMessage: this.errorMessage,
            IB: this.IB,
            Iz_table: this.Iz_table,
            Iz_corrected: this.Iz_corrected,
            correctionFactor: this.correctionFactor,
            temperatureFactor: this.temperatureFactor,
            groupingFactor: this.groupingFactor,
            currentAdequate: this.currentAdequate,
            currentUtilization: this.currentUtilization,
            voltageDrop: this.voltageDrop,
            voltageDropPercent: this.voltageDropPercent,
            maxVoltageDropPercent: this.maxVoltageDropPercent,
            voltageDropOk: this.voltageDropOk,
            breakerCheck: this.breakerCheck,
            recommendedBreakerIn: this.recommendedBreakerIn,
        };
    }
}