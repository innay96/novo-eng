import { useState, useCallback } from 'react';

const API_BASE = 'https://novo-eng.com/cable-calc:3001/api';

/**
 * Hook for cable calculation API calls.
 * Keeps API logic separate from UI components.
 */
export function useCableCalculator() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculate = useCallback(async ({ cable, load, conditions }) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cable, load, conditions }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const recommend = useCallback(async ({ cableParams, load, conditions }) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cableParams, load, conditions }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { result, loading, error, calculate, recommend };
}

/**
 * Hook to fetch available options from API.
 */
export function useOptions() {
    const [options, setOptions] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchOptions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/options`);
            const data = await res.json();
            setOptions(data);
        } catch (err) {
            console.error('Failed to fetch options:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    return { options, loading, fetchOptions };
}