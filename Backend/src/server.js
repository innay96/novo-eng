import express from 'express';
import cors from 'cors';
import { Cable, ConductorMaterial, InsulationType, SystemType } from './models/Cable.js';
import { Load } from './models/Load.js';
import { InstallationConditions } from './models/InstallationConditions.js';
import { Breaker, BreakerType, BreakerCurve, STANDARD_BREAKER_RATINGS } from './models/Breaker.js';
import { calculateCableSection, recommendCableSection } from './calculators/CableCalculator.js';
import { INSTALLATION_METHODS, STANDARD_SECTIONS, VOLTAGE_DROP_LIMITS } from './constants/israeliStandards.js';

const app = express();
app.use(cors());
app.use(express.json());

// POST /api/calculate - check a specific cable section
app.post('/api/calculate', (req, res) => {
    try {
        const { cable: cableParams, load: loadParams, conditions: condParams, breaker: breakerParams } = req.body;
        const cable = new Cable(cableParams);
        const load = new Load(loadParams);
        const conditions = new InstallationConditions(condParams);
        const breaker = breakerParams ? new Breaker(breakerParams) : null;
        const result = calculateCableSection(cable, load, conditions, breaker);
        res.json({ success: true, result: result.toJSON(), summary: result.summary, cable: cable.toJSON(), load: load.toJSON(), conditions: conditions.toJSON() });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// POST /api/recommend - find minimum passing cable section
app.post('/api/recommend', (req, res) => {
    try {
        const { cableParams, load: loadParams, conditions: condParams, breaker: breakerParams } = req.body;
        const load = new Load(loadParams);
        const conditions = new InstallationConditions(condParams);
        const breaker = breakerParams ? new Breaker(breakerParams) : null;
        const result = recommendCableSection(load, conditions, cableParams, breaker);
        res.json({ success: true, recommendedSection: result.cable?.section, result: result.toJSON(), summary: result.summary });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// GET /api/options - all dropdown options for the UI
app.get('/api/options', (req, res) => {
    res.json({
        materials: Object.values(ConductorMaterial),
        insulationTypes: Object.values(InsulationType),
        systemTypes: Object.values(SystemType),
        breakerTypes: Object.values(BreakerType),
        breakerCurves: Object.values(BreakerCurve),
        standardBreakerRatings: STANDARD_BREAKER_RATINGS,
        installationMethods: Object.entries(INSTALLATION_METHODS).map(([key, val]) => ({
            key, label: val.label, description: val.description,
        })),
        standardSections: STANDARD_SECTIONS,
        voltageDropLimits: VOLTAGE_DROP_LIMITS,
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Cable Calculator API running on https://novo-eng.com/cable-calc:${PORT}`));

export default app;