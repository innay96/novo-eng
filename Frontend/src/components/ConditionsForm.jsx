const INSTALLATION_METHODS = [
    { key: 'A1', label: 'A1 - מוטבע בתוך קיר מבודד (כבל עם מעטפת)' },
    { key: 'A2', label: 'A2 - מוטבע בתוך קיר מבודד (כבל רב-גידי)' },
    { key: 'B1', label: 'B1 - בתוך צינור על/בתוך קיר' },
    { key: 'B2', label: 'B2 - כבל בתוך צינור על/בתוך קיר' },
    { key: 'C', label: 'C - על גבי קיר / תקרה' },
    { key: 'D1', label: 'D1 - בתוך קרקע (בצינור)' },
    { key: 'D2', label: 'D2 - בתוך קרקע (ישיר)' },
    { key: 'E', label: 'E - באוויר חופשי (רב-גידי)' },
    { key: 'F', label: 'F - כבלים חד-גידיים צמודים באוויר' },
    { key: 'G', label: 'G - כבלים חד-גידיים מרווחים באוויר' },
];

const GROUPING_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16, 20];

function ConditionsForm({ value, onChange }) {
    const update = (key, val) => onChange({ ...value, [key]: val });
    const isGround = value.method === 'D1' || value.method === 'D2';

    return (
        <div className="form-grid">
            <div className="field full-width">
                <label>שיטת התקנה (לפי IEC 60364-5-52)</label>
                <select value={value.method} onChange={e => update('method', e.target.value)}>
                    {INSTALLATION_METHODS.map(m => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                </select>
            </div>

            {!isGround && (
                <div className="field">
                    <label>טמפרטורת סביבה (°C)</label>
                    <input
                        type="number"
                        min="-10"
                        max="70"
                        value={value.ambientTemp}
                        onChange={e => update('ambientTemp', parseFloat(e.target.value))}
                    />
                    <span className="hint">ישראל: בדרך כלל 35-45°C</span>
                </div>
            )}

            {isGround && (
                <div className="field">
                    <label>טמפרטורת קרקע (°C)</label>
                    <input
                        type="number"
                        min="5"
                        max="40"
                        value={value.groundTemp}
                        onChange={e => update('groundTemp', parseFloat(e.target.value))}
                    />
                    <span className="hint">ישראל: בדרך כלל 20-25°C</span>
                </div>
            )}

            <div className="field">
                <label>מספר מעגלים מקובצים</label>
                <select value={value.groupCount} onChange={e => update('groupCount', parseInt(e.target.value))}>
                    {GROUPING_OPTIONS.map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? '(ללא קיבוץ)' : ''}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default ConditionsForm;