import { SystemType } from './Cable.js';
import { SYSTEM_VOLTAGES } from '../constants/israeliStandards.js';
/**
 * Represents the electrical load connected at the end of the cable.
 */
export class Load {
    /**
     * @param {object} params
     * @param {number} params.power - Active power in Watts (W)
     * @param {number} params.powerFactor - Power factor (0 < pf <= 1)
     * @param {string} params.systemType - SystemType enum
     * @param {number} [params.voltage] - System voltage in V (defaults by systemType)
     * @param {number} [params.efficiency] - Load efficiency 0-1 (for motors etc.)
     * @param {string} [params.loadType] - 'LIGHTING' | 'POWER' | 'MOTOR' | 'SENSITIVE'
     */
    constructor({
        power,
        powerFactor = 0.9,
        systemType = SystemType.THREE_PHASE,
        voltage = null,
        efficiency = 1.0,
        loadType = 'POWER',
    }) {
        this._validate({ power, powerFactor, efficiency });

        this.power = power;           // W
        this.powerFactor = powerFactor;
        this.systemType = systemType;
        this.voltage = voltage || this._defaultVoltage(systemType);
        this.efficiency = efficiency;
        this.loadType = loadType;
    }

    _validate({ power, powerFactor, efficiency }) {
        if (power <= 0) throw new Error('Power must be positive');
        if (powerFactor <= 0 || powerFactor > 1) throw new Error('Power factor must be between 0 and 1');
        if (efficiency <= 0 || efficiency > 1) throw new Error('Efficiency must be between 0 and 1');
    }

    _defaultVoltage(systemType) {
        const voltages = {
            [SystemType.SINGLE_PHASE]: 230,
            [SystemType.THREE_PHASE]: 400,
            [SystemType.THREE_PHASE_WITH_NEUTRAL]: 400,
            [SystemType.DC]: 230,
        };
        return voltages[systemType] || 230;
    }

    /**
     * Apparent power (VA)
     */
    get apparentPower() {
        return this.power / this.powerFactor;
    }

    /**
     * Reactive power (VAR)
     */
    get reactivePower() {
        return this.apparentPower * Math.sqrt(1 - this.powerFactor ** 2);
    }

    /**
     * Design current (A) - current drawn by the load
     * IB in IEC notation
     */
    get designCurrent() {
        const S = this.apparentPower / this.efficiency;

        if (this.systemType === SystemType.SINGLE_PHASE || this.systemType === SystemType.DC) {
            return S / this.voltage;
        } else {
            // Three-phase: I = S / (sqrt(3) * V_LL)
            return S / (Math.sqrt(3) * this.voltage);
        }
    }

    toJSON() {
        return {
            power: this.power,
            powerFactor: this.powerFactor,
            systemType: this.systemType,
            voltage: this.voltage,
            efficiency: this.efficiency,
            loadType: this.loadType,
            designCurrent: this.designCurrent,
            apparentPower: this.apparentPower,
        };
    }
}