import { useState, useEffect } from 'react';
import { useCableCalculator, useOptions } from './hooks/useCableCalculator';
import CableForm from './components/CableForm';
import LoadForm from './components/LoadForm';
import ConditionsForm from './components/ConditionsForm';
import BreakerForm from './components/BreakerForm';
import ResultPanel from './components/ResultPanel';
import './App.css';

const DEFAULT_LOAD = {
    power: 5000, powerFactor: 0.9, systemType: 'THREE_PHASE',
    voltage: 400, efficiency: 1.0, loadType: 'POWER',
};
const DEFAULT_CABLE = {
    material: 'COPPER', insulation: 'PVC', section: 2.5, length: 30, conductors: 3,
};
const DEFAULT_CONDITIONS = {
    method: 'B1', ambientTemp: 35, groupCount: 1, insulationType: 'PVC',
    inGround: false, groundTemp: 25,
};

function App() {
    const [cable, setCable] = useState(DEFAULT_CABLE);
    const [load, setLoad] = useState(DEFAULT_LOAD);
    const [conditions, setConditions] = useState(DEFAULT_CONDITIONS);
    const [breaker, setBreaker] = useState(null); // null = auto-recommend
    const [mode, setMode] = useState('recommend'); // 'check' | 'recommend'

    const { result, loading, error, calculate, recommend } = useCableCalculator();
    const { fetchOptions } = useOptions();

    useEffect(() => { fetchOptions(); }, []);

    const handleCableChange = (updated) => {
        setCable(updated);
        if (updated.insulation !== cable.insulation) {
            setConditions(prev => ({ ...prev, insulationType: updated.insulation }));
        }
    };

    const handleSubmit = () => {
        if (mode === 'check') {
            calculate({ cable, load, conditions, breaker });
        } else {
            const { section, ...cableParams } = cable;
            recommend({ cableParams, load, conditions, breaker });
        }
    };

    return (
        <div className="app" dir="rtl">
            <header className="app-header">
                <h1>🔌 מחשבון חתך כבלים</h1>
                <p className="subtitle">לפי תקן ישראלי SI 900 / IEC 60364</p>
            </header>

            <div className="mode-selector">
                <button className={mode === 'recommend' ? 'active' : ''} onClick={() => setMode('recommend')}>
                    🎯 המלצת חתך אוטומטית
                </button>
                <button className={mode === 'check' ? 'active' : ''} onClick={() => setMode('check')}>
                    🔍 בדיקת חתך קיים
                </button>
            </div>

            <div className="main-layout">
                <div className="forms-column">
                    <section className="form-section">
                        <h2>⚡ נתוני עומס</h2>
                        <LoadForm value={load} onChange={setLoad} />
                    </section>

                    <section className="form-section">
                        <h2>🔧 נתוני כבל</h2>
                        <CableForm value={cable} onChange={handleCableChange} showSection={mode === 'check'} />
                    </section>

                    <section className="form-section">
                        <h2>🏗️ תנאי התקנה</h2>
                        <ConditionsForm value={conditions} onChange={setConditions} />
                    </section>

                    <section className="form-section">
                        <h2>⚙️ מבטח / הגנת יתר-זרם</h2>
                        <BreakerForm value={breaker} onChange={setBreaker} />
                    </section>

                    <button className="calculate-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'מחשב...' : mode === 'check' ? '🔍 בדוק' : '🎯 חשב המלצה'}
                    </button>
                </div>

                <div className="result-column">
                    {error && <div className="error-panel"><strong>שגיאה:</strong> {error}</div>}
                    {result && <ResultPanel result={result} />}
                </div>
            </div>
        </div>
    );
}

export default App;