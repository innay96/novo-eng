const SYSTEM_TYPES = [
    { value: 'SINGLE_PHASE', label: 'חד-פאזי 230V' },
    { value: 'THREE_PHASE', label: 'תלת-פאזי 400V' },
    { value: 'THREE_PHASE_WITH_NEUTRAL', label: 'תלת-פאזי + ניטרל' },
];

const LOAD_TYPES = [
    { value: 'LIGHTING', label: 'תאורה (מקסימום 3%)' },
    { value: 'POWER', label: 'כוח (מקסימום 5%)' },
    { value: 'MOTOR_START', label: 'הפעלת מנוע (מקסימום 15%)' },
    { value: 'SENSITIVE_EQUIPMENT', label: 'ציוד רגיש (מקסימום 2%)' },
];

function LoadForm({ value, onChange }) {
    const update = (key, val) => onChange({ ...value, [key]: val });

    const handleSystemTypeChange = (systemType) => {
        const defaultVoltage = systemType.includes('THREE') ? 400 : 230;
        onChange({ ...value, systemType, voltage: defaultVoltage });
    };

    // Derived: apparent current for display
    const S = value.power / value.powerFactor / value.efficiency;
    const I = value.systemType.includes('THREE')
        ? S / (Math.sqrt(3) * value.voltage)
        : S / value.voltage;

    return (
        <div className="form-grid">
            <div className="field">
                <label>סוג מערכת</label>
                <select value={value.systemType} onChange={e => handleSystemTypeChange(e.target.value)}>
                    {SYSTEM_TYPES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            <div className="field">
                <label>הספק פעיל (W)</label>
                <input
                    type="number"
                    min="1"
                    value={value.power}
                    onChange={e => update('power', parseFloat(e.target.value))}
                />
            </div>

            <div className="field">
                <label>גורם הספק (cos φ)</label>
                <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="1"
                    value={value.powerFactor}
                    onChange={e => update('powerFactor', parseFloat(e.target.value))}
                />
            </div>

            <div className="field">
                <label>נצילות עומס (η)</label>
                <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="1"
                    value={value.efficiency}
                    onChange={e => update('efficiency', parseFloat(e.target.value))}
                />
            </div>

            <div className="field">
                <label>מתח מערכת (V)</label>
                <input
                    type="number"
                    value={value.voltage}
                    onChange={e => update('voltage', parseFloat(e.target.value))}
                />
            </div>

            <div className="field">
                <label>סוג עומס (מגדיר מקסימום נפילת מתח)</label>
                <select value={value.loadType} onChange={e => update('loadType', e.target.value)}>
                    {LOAD_TYPES.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                </select>
            </div>

            <div className="field derived-value">
                <label>זרם עיצוב מחושב (IB)</label>
                <span className="value-display">{isNaN(I) ? '—' : `${I.toFixed(2)} A`}</span>
            </div>
        </div>
    );
}

export default LoadForm;