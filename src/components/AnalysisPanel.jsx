import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Scale,
  Gavel,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  MOCK_ANALYSIS_STEPS,
  MOCK_LEGAL_CITATIONS,
  LAWYER_CASE_ANALYSIS,
  ROLES,
} from '../data/mockData';

function StepItem({ step }) {
  const { expandedSteps, toggleStepExpand } = useApp();
  const isCompleted = step.status === 'completed';
  const isActive = step.status === 'active';
  const isExpanded = expandedSteps.has(step.step);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step.step * 0.08 }}
      className="flex gap-2.5"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center pt-0.5">
        {isCompleted ? (
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
        ) : isActive ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Circle className="w-4.5 h-4.5 text-brand shrink-0 fill-brand/20" />
          </motion.div>
        ) : (
          <Circle className="w-4.5 h-4.5 text-gray-300 shrink-0" />
        )}
        {step.step < 5 && (
          <div
            className={`w-px flex-1 mt-1 ${
              isCompleted ? 'bg-emerald-200' : 'bg-gray-200'
            }`}
          />
        )}
      </div>

      {/* Content — clickable accordion */}
      <div className="flex-1 pb-3">
        <button
          onClick={() => toggleStepExpand(step.step)}
          className={`w-full flex items-center justify-between cursor-pointer rounded-lg
            px-2 py-1 -ml-1 hover:bg-gray-50 transition-colors`}
        >
          <span
            className={`text-xs font-semibold text-left ${
              isActive ? 'text-brand' : isCompleted ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            Step {step.step}：{step.title}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </motion.div>
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-[11px] text-gray-500 mt-1.5 ml-1 leading-relaxed">
                {step.content}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function renderHighlightedContent(content, highlightRange, isHighlighted) {
  if (!highlightRange || !isHighlighted) return content;
  const idx = content.indexOf(highlightRange);
  if (idx === -1) return content;
  const before = content.slice(0, idx);
  const match = content.slice(idx, idx + highlightRange.length);
  const after = content.slice(idx + highlightRange.length);
  return (
    <>
      {before}
      <mark className="cite-highlight">{match}</mark>
      {after}
    </>
  );
}

function CitationCard({ citation }) {
  const { highlightedCitation, expandedCitations, toggleCitationExpand } = useApp();
  const cardRef = useRef(null);
  const [pulseKey, setPulseKey] = useState(0);
  const isHighlighted = highlightedCitation === citation.refId;
  const isExpanded = expandedCitations.has(citation.id);
  const isAuthoritative = citation.type === 'authoritative';

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setPulseKey((k) => k + 1);
    }
  }, [isHighlighted]);

  return (
    <motion.div
      id={`citation-${citation.refId}`}
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isHighlighted ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-xl overflow-hidden cursor-pointer border relative
        ${isHighlighted ? 'border-pku-law shadow-[0_0_0_2px_#2563EB,0_4px_12px_rgba(37,99,235,0.15)]' : 'border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.04)]'}
        ${isAuthoritative ? 'bg-blue-50/50' : 'bg-emerald-50/50'}`}
      onClick={() => toggleCitationExpand(citation.id)}
    >
      {/* Pulse overlay */}
      {isHighlighted && (
        <div
          key={pulseKey}
          className="absolute inset-0 rounded-xl highlight-pulse pointer-events-none z-0"
        />
      )}

      {/* Compact header: tag + law name only */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0
              ${isAuthoritative ? 'bg-pku-law' : 'bg-firm-article'}`}
          >
            {citation.tag}
          </span>
          <span className="text-xs font-medium text-gray-700 truncate">
            {citation.shortTitle}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </motion.div>
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden relative z-10"
          >
            <div className="px-3.5 pb-3">
              <p className="text-xs font-semibold text-gray-800 mb-2">{citation.title}</p>
              <div
                className={`p-3 rounded-lg text-[11px] leading-relaxed text-gray-600
                  ${isAuthoritative ? 'bg-blue-100/50 border border-blue-200/60' : 'bg-emerald-100/50 border border-emerald-200/60'}`}
              >
                {renderHighlightedContent(citation.content, citation.highlightRange, isHighlighted)}
              </div>
              <div className="flex items-center justify-between mt-2 px-0.5">
                <div className="text-[10px] text-gray-400 flex gap-3">
                  {citation.effectiveDate && <span>{citation.effectiveDate}</span>}
                  {citation.author && <span>{citation.author}</span>}
                  {citation.publishDate && <span>{citation.publishDate}</span>}
                </div>
                <button className="text-[10px] text-pku-law flex items-center gap-0.5 hover:underline">
                  原文 <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CaseAnalysisCard({ caseItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-100 bg-white px-3.5 py-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gavel className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] text-gray-500 font-mono">{caseItem.caseNumber}</span>
        </div>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md
            ${caseItem.result === '劳动者胜诉' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
        >
          {caseItem.result}
        </span>
      </div>
      <p className="text-xs text-gray-700 mt-1.5 font-medium">{caseItem.summary}</p>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-gray-400">{caseItem.court}</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">关联度</span>
          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full"
              style={{ width: `${caseItem.relevance}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-brand">{caseItem.relevance}%</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalysisPanel() {
  const { currentRole } = useApp();
  const roleConfig = ROLES[currentRole];
  const isLawyer = currentRole === 'lawyer';

  return (
    <aside className="w-full h-full flex flex-col bg-white border-l border-gray-200/80">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">白箱化溯源分析</h2>
          {isLawyer && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] bg-brand-50 text-brand font-semibold px-2 py-0.5
                rounded-full flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              专业检索
            </motion.span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          可追溯的法律推理 · 消除大模型幻觉
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Logic Steps — Accordion */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-brand" />
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              逻辑推导步骤
            </p>
          </div>
          <div className="ml-0.5">
            {MOCK_ANALYSIS_STEPS.map((step) => (
              <StepItem key={step.step} step={step} />
            ))}
          </div>
        </div>

        {/* Citations — color-coded compact cards */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-pku-law" />
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              权威引用溯源
            </p>
          </div>
          <div className="space-y-2">
            {MOCK_LEGAL_CITATIONS.map((citation) => (
              <CitationCard key={citation.id} citation={citation} />
            ))}
          </div>
        </div>

        {/* Lawyer: Case Analysis */}
        <AnimatePresence>
          {isLawyer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pt-4 pb-6"
            >
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-dark" />
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  实务判决分析
                </p>
              </div>
              <div className="space-y-2.5">
                {LAWYER_CASE_ANALYSIS.map((caseItem) => (
                  <CaseAnalysisCard key={caseItem.id} caseItem={caseItem} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
