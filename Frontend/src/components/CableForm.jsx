const MATERIALS = [
    { value: 'COPPER', label: 'נחושת (Cu)' },
    { value: 'ALUMINUM', label: 'אלומיניום (Al)' },
];

const INSULATIONS = [
    { value: 'PVC', label: 'PVC (70°C)' },
    { value: 'XLPE', label: 'XLPE (90°C)' },
    { value: 'EPR', label: 'EPR (90°C)' },
];

const STANDARD_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

/**
 * Form for cable physical parameters.
 * @param {object} props
 * @param {object} props.value - Current cable state
 * @param {function} props.onChange - Called with updated cable object
 * @param {boolean} props.showSection - Whether to show section selector (false = auto-recommend mode)
 */
function CableForm({ value, onChange, showSection = true }) {
    const update = (key, val) => onChange({ ...value, [key]: val });

    const handleMaterialChange = (material) => {
        // Aluminum not available below 10mm²
        const minSection = material === 'ALUMINUM' ? 10 : 1.5;
        const section = value.section < minSection ? minSection : value.section;
        onChange({ ...value, material, section });
    };

    const availableSections = STANDARD_SECTIONS.filter(
        s => value.material === 'ALUMINUM' ? s >= 10 : true
    );

    return (
        <div className="form-grid">
            <div className="field">
                <label>חומר מוליך</label>
                <select value={value.material} onChange={e => handleMaterialChange(e.target.value)}>
                    {MATERIALS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            <div className="field">
                <label>סוג בידוד</label>
                <select value={value.insulation} onChange={e => update('insulation', e.target.value)}>
                    {INSULATIONS.map(i => (
                        <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                </select>
            </div>

            {showSection && (
                <div className="field">
                    <label>חתך (mm²)</label>
                    <select value={value.section} onChange={e => update('section', parseFloat(e.target.value))}>
                        {availableSections.map(s => (
                            <option key={s} value={s}>{s} mm²</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="field">
                <label>אורך כבל (מ')</label>
                <input
                    type="number"
                    min="1"
                    value={value.length}
                    onChange={e => update('length', parseFloat(e.target.value))}
                />
            </div>

            <div className="field">
                <label>מספר מוליכים טעונים</label>
                <select value={value.conductors} onChange={e => update('conductors', parseInt(e.target.value))}>
                    <option value={2}>2 (פאזה + ניטרל)</option>
                    <option value={3}>3 (תלת-פאזי)</option>
                </select>
            </div>
        </div>
    );
}

export default CableForm;