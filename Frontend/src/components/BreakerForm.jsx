const BREAKER_TYPES = [
    { value: 'MCB', label: 'MCB - ממסר זעיר (עד 125A)' },
    { value: 'MCCB', label: 'MCCB - ממסר מוגן תבנית' },
    { value: 'FUSE', label: 'פיוז' },
    { value: 'ACB', label: 'ACB - ממסר אוויר (לוחות ראשיים)' },
];

const BREAKER_CURVES = [
    { value: 'B', label: 'B - פסיקה ב-3-5×In (תאורה, מעגלים רגישים)' },
    { value: 'C', label: 'C - פסיקה ב-5-10×In (שימוש כללי)' },
    { value: 'D', label: 'D - פסיקה ב-10-20×In (מנועים, שנאים)' },
];

const STANDARD_RATINGS = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];

/**
 * Optional breaker form.
 * If the user leaves it empty, the system auto-recommends a breaker.
 *
 * @param {object} props
 * @param {object|null} props.value   - Current breaker state, or null if auto
 * @param {function} props.onChange   - Called with updated breaker object or null
 */
function BreakerForm({ value, onChange }) {
    const isAuto = value === null;

    const handleToggle = () => {
        onChange(isAuto ? { In: 16, type: 'MCB', curve: 'C', Icu: null } : null);
    };

    const update = (key, val) => onChange({ ...value, [key]: val });

    return (
        <div className="form-grid">
            <div className="field full-width">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={!isAuto}
                        onChange={handleToggle}
                        style={{ width: 16, height: 16 }}
                    />
                    הכנס מבטח ידנית (אחרת המערכת ממליצה אוטומטית)
                </label>
            </div>

            {!isAuto && (
                <>
                    <div className="field">
                        <label>סוג מבטח</label>
                        <select value={value.type} onChange={e => update('type', e.target.value)}>
                            {BREAKER_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>עקומה (MCB/MCCB)</label>
                        <select value={value.curve} onChange={e => update('curve', e.target.value)}
                            disabled={value.type === 'FUSE' || value.type === 'ACB'}>
                            {BREAKER_CURVES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>זרם נקוב In (A)</label>
                        <select value={value.In} onChange={e => update('In', parseFloat(e.target.value))}>
                            {STANDARD_RATINGS.map(r => (
                                <option key={r} value={r}>{r} A</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>קיבולת פסיקה Icu (kA) - אופציונלי</label>
                        <input
                            type="number"
                            min="1"
                            max="150"
                            placeholder="למשל: 6, 10, 25..."
                            value={value.Icu || ''}
                            onChange={e => update('Icu', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                    </div>

                    <div className="field derived-value">
                        <label>זרם פסיקה I2</label>
                        <span className="value-display">
                            {(value.In * (value.type === 'FUSE' ? 1.6 : value.type === 'ACB' ? 1.25 : 1.45)).toFixed(1)} A
                        </span>
                    </div>
                </>
            )}

            {isAuto && (
                <div className="field full-width">
                    <span className="hint" style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                        💡 המערכת תבחר את המבטח הקטן ביותר שמקיים: IB ≤ In ≤ Iz ו-I2 ≤ 1.45×Iz
                    </span>
                </div>
            )}
        </div>
    );
}

export default BreakerForm;