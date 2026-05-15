/**
 * Israeli Electrical Standards (SI 900, תקן ישראלי 900)
 * Based on IEC 60364 adapted for Israeli climate and regulations
 */

// Maximum voltage drop percentages (per Israeli standard)
export const VOLTAGE_DROP_LIMITS = {
    LIGHTING: 3,        // 3% for lighting circuits
    POWER: 5,           // 5% for power circuits
    MOTOR_START: 15,    // 15% during motor start
    SENSITIVE_EQUIPMENT: 2, // 2% for sensitive equipment
};

// Ambient temperature correction factors (Israel: often 35-45°C)
// Reference temperature: 30°C (IEC base), Israel uses 35°C as base
export const AMBIENT_TEMP_CORRECTION = {
    INSULATION_TYPE: {
        PVC: { refTemp: 70, factors: { 25: 1.06, 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71 } },
        XLPE: { refTemp: 90, factors: { 25: 1.04, 30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82 } },
        EPR: { refTemp: 90, factors: { 25: 1.04, 30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82 } },
    },
};

// Grouping (bundling) correction factors - number of circuits together
export const GROUPING_FACTORS = {
    1: 1.00,
    2: 0.80,
    3: 0.70,
    4: 0.65,
    5: 0.60,
    6: 0.57,
    7: 0.54,
    8: 0.52,
    9: 0.50,
    12: 0.45,
    16: 0.41,
    20: 0.38,
};

// Installation method factors (SI 900 Table B.52)
export const INSTALLATION_METHODS = {
    A1: { label: 'מוטבע בתוך קיר מבודד (כבל עם מעטפת)', factor: 1.0, description: 'Insulated conductors in conduit in thermally insulating wall' },
    A2: { label: 'מוטבע בתוך קיר מבודד (כבל רב-גידי)', factor: 1.0, description: 'Multi-core cable in thermally insulating wall' },
    B1: { label: 'בתוך צינור על/בתוך קיר', factor: 1.0, description: 'Insulated conductors in conduit on wall' },
    B2: { label: 'כבל בתוך צינור על/בתוך קיר', factor: 1.0, description: 'Multi-core cable in conduit on wall' },
    C: { label: 'על גבי קיר / תקרה', factor: 1.15, description: 'Single or multi-core on wall/ceiling' },
    D1: { label: 'בתוך קרקע - בצינור', factor: 1.0, description: 'Multi-core cable in conduit in ground' },
    D2: { label: 'בתוך קרקע - ישיר', factor: 1.0, description: 'Multi-core cable direct in ground' },
    E: { label: 'באוויר חופשי', factor: 1.2, description: 'Multi-core cable in free air' },
    F: { label: 'כבלים חד-גידיים באוויר', factor: 1.2, description: 'Single-core cables touching in free air' },
    G: { label: 'כבלים חד-גידיים מרווחים', factor: 1.3, description: 'Single-core cables spaced in free air' },
};

// Standard cable cross-sections (mm²) available in Israel
export const STANDARD_SECTIONS = [
    1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630
];

// System voltages in Israel
export const SYSTEM_VOLTAGES = {
    LV_SINGLE_PHASE: 230,   // Phase-to-neutral (V)
    LV_THREE_PHASE: 400,    // Phase-to-phase (V)
    MV_6KV: 6000,
    MV_12KV: 12000,
    MV_33KV: 33000,
};

// Frequency
export const FREQUENCY = 50; // Hz

// Ground resistivity (Israel - typical values)
export const GROUND_RESISTIVITY = {
    CLAY: 50,
    SAND: 200,
    ROCK: 1000,
    TYPICAL_ISRAEL: 100, // Ω·m
};
