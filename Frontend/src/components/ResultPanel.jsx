/**
 * ResultPanel - displays full calculation results including breaker checks.
 */
function ResultPanel({ result }) {
    if (!result) return null;

    const { result: r, recommendedSection } = result;

    const fmt = (val, unit = '', decimals = 2) =>
        val != null ? `${val.toFixed(decimals)}${unit}` : '—';

    const StatusBadge = ({ ok }) => (
        <span className={`badge ${ok ? 'badge-pass' : 'badge-fail'}`}>
            {ok ? '✅ עובר' : '❌ נכשל'}
        </span>
    );

    const CheckRow = ({ label, passed, left, right }) => (
        <tr style={{ background: passed ? '#f0fdf4' : '#fef2f2' }}>
            <td>{label}</td>
            <td style={{ fontFamily: 'monospace' }}>{left}</td>
            <td style={{ fontFamily: 'monospace' }}>{right}</td>
            <td>{passed ? '✅' : '❌'}</td>
        </tr>
    );

    const bc = r.breakerCheck;

    return (
        <div className="result-panel">
            <div className={`result-header ${r.passed ? 'pass' : 'fail'}`}>
                <h3>{r.passed ? '✅ עובר את כל הבדיקות' : '❌ נכשל'}</h3>
                {recommendedSection && <p>חתך מומלץ: <strong>{recommendedSection} mm²</strong></p>}
                {r.recommendedBreakerIn && <p>מבטח מומלץ: <strong>{r.recommendedBreakerIn} A</strong></p>}
            </div>

            <div className="result-grid">

                {/* Current capacity */}
                <div className="result-card">
                    <h4>🔌 עומסיות זרם</h4>
                    <table style={{ width: '100%', fontSize: '0.85rem' }}>
                        <tbody>
                            <tr><td>זרם עיצוב IB</td><td><strong>{fmt(r.IB, ' A')}</strong></td></tr>
                            <tr><td>קיבולת טבלה Iz_table</td><td>{fmt(r.Iz_table, ' A')}</td></tr>
                            <tr><td>מקדם תיקון כולל</td><td>{fmt(r.correctionFactor, '', 3)} (טמפ׳: {fmt(r.temperatureFactor, '', 3)} × קיבוץ: {fmt(r.groupingFactor, '', 3)})</td></tr>
                            <tr><td>קיבולת מתוקנת Iz</td><td><strong>{fmt(r.Iz_corrected, ' A')}</strong></td></tr>
                            <tr><td>ניצול</td><td>{fmt(r.currentUtilization, '%', 1)}</td></tr>
                        </tbody>
                    </table>
                    <StatusBadge ok={r.currentAdequate} />
                </div>

                {/* Voltage drop */}
                <div className="result-card">
                    <h4>📉 נפילת מתח</h4>
                    <table style={{ width: '100%', fontSize: '0.85rem' }}>
                        <tbody>
                            <tr><td>נפילת מתח</td><td><strong>{fmt(r.voltageDrop, ' V')}</strong></td></tr>
                            <tr><td>נפילה באחוזים</td><td><strong>{fmt(r.voltageDropPercent, '%')}</strong></td></tr>
                            <tr><td>מקסימום מותר</td><td>{r.maxVoltageDropPercent}%</td></tr>
                        </tbody>
                    </table>
                    <StatusBadge ok={r.voltageDropOk} />
                </div>

                {/* Breaker protection */}
                {bc && (
                    <div className="result-card">
                        <h4>⚡ הגנת יתר-זרם (IEC 60364-4-43)</h4>
                        <table style={{ width: '100%', fontSize: '0.83rem', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ textAlign: 'right', padding: '3px 6px' }}>תנאי</th>
                                    <th style={{ padding: '3px 6px' }}>ערך</th>
                                    <th style={{ padding: '3px 6px' }}>גבול</th>
                                    <th style={{ padding: '3px 6px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                <CheckRow
                                    label="IB ≤ In"
                                    passed={bc.condition1.passed}
                                    left={`IB = ${fmt(bc.condition1.values.IB, ' A')}`}
                                    right={`In = ${fmt(bc.condition1.values.In, ' A')}`}
                                />
                                <CheckRow
                                    label="In ≤ Iz"
                                    passed={bc.condition2.passed}
                                    left={`In = ${fmt(bc.condition2.values.In, ' A')}`}
                                    right={`Iz = ${fmt(bc.condition2.values.Iz, ' A')}`}
                                />
                                <CheckRow
                                    label="I2 ≤ 1.45×Iz"
                                    passed={bc.condition3.passed}
                                    left={`I2 = ${fmt(bc.condition3.values.I2, ' A')}`}
                                    right={`1.45×Iz = ${fmt(bc.condition3.values.limit, ' A')}`}
                                />
                            </tbody>
                        </table>
                        <StatusBadge ok={bc.passed} />
                    </div>
                )}

            </div>
        </div>
    );
}

export default ResultPanel;