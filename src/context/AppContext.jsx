import { createContext, useContext, useState, useCallback } from 'react';
import { MODULE_CONFIGS } from '../data/moduleConfigs';

const AppContext = createContext(null);

function buildInitialFields(moduleKey) {
  const config = MODULE_CONFIGS[moduleKey];
  if (!config) return {};
  const fields = {};
  for (const f of config.requiredFields) {
    fields[f.key] = { status: 'missing', value: null, label: f.label };
  }
  return fields;
}

export function AppProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [highlightedCitation, setHighlightedCitation] = useState(null);
  const [expandedCitations, setExpandedCitations] = useState(new Set());
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [analysisPhase, setAnalysisPhase] = useState(2);

  // Generic module state
  const [activeModule, setActiveModule] = useState(null);
  const [moduleFields, setModuleFields] = useState({});

  const selectRole = useCallback((role) => {
    setCurrentRole(role);
    setShowWelcome(false);
  }, []);

  const goToWelcome = useCallback(() => {
    setShowWelcome(true);
    setActiveModule(null);
  }, []);

  const highlightCitation = useCallback((refId) => {
    setHighlightedCitation(refId);
    setExpandedCitations((prev) => {
      const next = new Set(prev);
      next.add(refId);
      return next;
    });
    setTimeout(() => setHighlightedCitation(null), 3000);
  }, []);

  const toggleCitationExpand = useCallback((id) => {
    setExpandedCitations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleStepExpand = useCallback((step) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) {
        next.delete(step);
      } else {
        next.add(step);
      }
      return next;
    });
  }, []);

  // ── Generic module actions ──
  const startModule = useCallback((moduleKey) => {
    setActiveModule(moduleKey);
    setModuleFields(buildInitialFields(moduleKey));
    setExpandedSteps(new Set());
    setExpandedCitations(new Set());
  }, []);

  const exitModule = useCallback(() => {
    setActiveModule(null);
    setModuleFields({});
  }, []);

  const updateModuleField = useCallback((field, value) => {
    setModuleFields((prev) => ({
      ...prev,
      [field]: { ...prev[field], status: 'complete', value },
    }));
  }, []);

  // Computed progress
  const fieldValues = Object.values(moduleFields);
  const moduleProgress = fieldValues.length
    ? fieldValues.filter((f) => f.status === 'complete').length
    : 0;
  const moduleTotalFields = fieldValues.length;

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        showWelcome,
        selectRole,
        goToWelcome,
        highlightedCitation,
        highlightCitation,
        expandedCitations,
        toggleCitationExpand,
        expandedSteps,
        toggleStepExpand,
        analysisPhase,
        setAnalysisPhase,
        activeModule,
        moduleFields,
        moduleProgress,
        moduleTotalFields,
        startModule,
        exitModule,
        updateModuleField,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
