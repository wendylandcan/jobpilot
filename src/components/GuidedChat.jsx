import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  X,
  Check,
  Circle,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MODULE_CONFIGS } from '../data/moduleConfigs';
import { ROLES } from '../data/mockData';

/* ── Progress Bar ── */
function ModuleProgressBar({ config, moduleFields, moduleProgress, moduleTotalFields }) {
  const pct = moduleTotalFields ? (moduleProgress / moduleTotalFields) * 100 : 0;
  return (
    <div className="px-5 py-2.5 bg-white/60 backdrop-blur-sm border-b border-gray-50">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-gray-500">信息补全</span>
        <span className="text-[11px] font-bold text-brand">{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {config.requiredFields.map((f) => {
          const done = moduleFields[f.key]?.status === 'complete';
          return (
            <div key={f.key} className="flex items-center gap-1">
              {done ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Circle className="w-3 h-3 text-gray-300" />
              )}
              <span
                className={`text-[10px] ${
                  done ? 'text-emerald-600 font-medium' : 'text-gray-400'
                }`}
              >
                {f.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Highlighted content for citation cards ── */
function renderHighlightedContent(content, highlightRange, isHighlighted) {
  if (!highlightRange || !isHighlighted) return content;
  const idx = content.indexOf(highlightRange);
  if (idx === -1) return content;
  return (
    <>
      {content.slice(0, idx)}
      <mark className="cite-highlight">{content.slice(idx, idx + highlightRange.length)}</mark>
      {content.slice(idx + highlightRange.length)}
    </>
  );
}

/* ── Inline Citation Card (reused from ChatPanel pattern) ── */
function ReportCitationCard({ citation }) {
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
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0, scale: isHighlighted ? 1.01 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-lg overflow-hidden cursor-pointer border relative
        ${isHighlighted ? 'border-pku-law shadow-[0_0_0_1.5px_#3182ce,0_4px_12px_rgba(49,130,206,0.12)]' : 'border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.03)]'}
        ${isAuthoritative ? 'bg-blue-50/50' : 'bg-emerald-50/50'}`}
      onClick={(e) => { e.stopPropagation(); toggleCitationExpand(citation.id); }}
    >
      {isHighlighted && (
        <div key={pulseKey} className="absolute inset-0 rounded-lg highlight-pulse pointer-events-none z-0" />
      )}
      <div className="px-3 py-2 flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0 ${isAuthoritative ? 'bg-pku-law' : 'bg-firm-article'}`}>
            {citation.tag}
          </span>
          <span className="text-[11px] font-medium text-gray-600 truncate">{citation.shortTitle}</span>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden relative z-10"
          >
            <div className="px-3 pb-2.5">
              <p className="text-[11px] font-semibold text-gray-800 mb-1.5">{citation.title}</p>
              <div className={`p-2.5 rounded-md text-[11px] leading-relaxed text-gray-600 ${isAuthoritative ? 'bg-blue-100/40 border border-blue-200/50' : 'bg-emerald-100/40 border border-emerald-200/50'}`}>
                {renderHighlightedContent(citation.content, citation.highlightRange, isHighlighted)}
              </div>
              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <span className="text-[10px] text-gray-400">{citation.effectiveDate}</span>
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

/* ── Report Step Item ── */
function ReportStepItem({ step, totalSteps, onRefClick }) {
  const { expandedSteps, toggleStepExpand } = useApp();
  const isCompleted = step.status === 'completed';
  const isActive = step.status === 'active';
  const isExpanded = expandedSteps.has(step.step);
  const hasRefs = step.refIds && step.refIds.length > 0;

  return (
    <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: step.step * 0.05 }} className="flex gap-2">
      <div className="flex flex-col items-center pt-0.5">
        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : isActive ? (
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <Circle className="w-3.5 h-3.5 text-brand shrink-0 fill-brand/20" />
          </motion.div>
        ) : <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
        {step.step < totalSteps && <div className={`w-px flex-1 mt-1 ${isCompleted ? 'bg-emerald-200' : 'bg-gray-100'}`} />}
      </div>
      <div className="flex-1 pb-2">
        <button onClick={() => toggleStepExpand(step.step)} className="w-full flex items-center justify-between cursor-pointer rounded-md px-1.5 py-0.5 -ml-0.5 hover:bg-gray-50/80 transition-colors">
          <span className={`text-[11px] font-semibold text-left ${isActive ? 'text-brand' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
            Step {step.step}：{step.title}
          </span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </motion.div>
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <p className="text-[11px] text-gray-500 mt-1 ml-1 leading-relaxed">{step.content}</p>
              {hasRefs && (
                <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                  <span className="text-[10px] text-gray-400">引用</span>
                  {step.refIds.map((refId) => (
                    <button key={refId} onClick={(e) => { e.stopPropagation(); onRefClick(refId); }} className="inline-flex items-center justify-center w-4.5 h-4.5 text-[9px] font-bold text-white bg-pku-law rounded-full cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all">
                      {refId}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Render markdown-like text ── */
function renderMarkdown(text) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('- ')) {
      const html = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      return <li key={idx} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    if (line.startsWith('> ')) {
      return <blockquote key={idx} className="ml-3 pl-3 border-l-2 border-brand/20 text-gray-600 italic my-1">{line.slice(2)}</blockquote>;
    }
    const numMatch = line.match(/^(\d+)\.\s/);
    if (numMatch) {
      const html = line.slice(numMatch[0].length).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      return <li key={idx} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    const bolded = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    if (bolded !== line) return <p key={idx} dangerouslySetInnerHTML={{ __html: bolded }} className="my-0.5" />;
    if (line.trim() === '') return <br key={idx} />;
    return <p key={idx} className="my-0.5">{line}</p>;
  });
}

/* ═══════════════════════════════════════════════
   GuidedChat — main component
   ═══════════════════════════════════════════════ */
export default function GuidedChat() {
  const {
    currentRole, activeModule, moduleFields, moduleProgress, moduleTotalFields,
    updateModuleField, exitModule, highlightCitation,
  } = useApp();
  const roleConfig = ROLES[currentRole];
  const config = MODULE_CONFIGS[activeModule];

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const prevProgressRef = useRef(0);
  const isAllComplete = moduleProgress === moduleTotalFields;

  // Initialize with greeting
  useEffect(() => {
    if (config) {
      setMessages([
        {
          id: 1,
          role: 'assistant',
          content: config.greeting,
          timestamp: now(),
        },
      ]);
      prevProgressRef.current = 0;
    }
  }, [activeModule]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // React to field updates — generate next AI prompt
  useEffect(() => {
    if (!config) return;
    if (moduleProgress > prevProgressRef.current && moduleProgress < moduleTotalFields) {
      const nextMissing = config.requiredFields.find(
        (f) => moduleFields[f.key]?.status !== 'complete'
      );
      if (nextMissing) {
        const completedFields = config.requiredFields.filter(
          (f) => moduleFields[f.key]?.status === 'complete'
        );
        let text = '收到！';
        if (completedFields.length > 0) {
          const last = completedFields[completedFields.length - 1];
          text = `好的，已记录**${last.label}**：${moduleFields[last.key].value}。\n\n`;
        }
        text += nextMissing.prompt;

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: text,
            timestamp: now(),
            chips: nextMissing.chips || null,
            chipField: nextMissing.key,
          },
        ]);
      }
    }
    // All fields complete → generate report
    if (moduleProgress === moduleTotalFields && prevProgressRef.current < moduleTotalFields && moduleTotalFields > 0) {
      const report = config.generateReport(moduleFields);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: 'assistant',
          content: report.content,
          timestamp: now(),
          analysisSteps: report.analysisSteps,
          inlineCitations: report.inlineCitations,
        },
      ]);
    }
    prevProgressRef.current = moduleProgress;
  }, [moduleProgress]);

  function now() {
    return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  const handleSend = () => {
    if (!inputValue.trim() || !config) return;
    const text = inputValue;
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: text, timestamp: now() }]);
    setInputValue('');

    const updates = config.parseInput(text, moduleFields);
    let updated = false;
    for (const [field, value] of Object.entries(updates)) {
      updateModuleField(field, value);
      updated = true;
    }

    if (!updated && !isAllComplete) {
      const nextMissing = config.requiredFields.find(
        (f) => moduleFields[f.key]?.status !== 'complete'
      );
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: `抱歉，未能识别到有效信息。\n\n${nextMissing ? nextMissing.prompt : ''}`,
            timestamp: now(),
            chips: nextMissing?.chips || null,
            chipField: nextMissing?.key,
          },
        ]);
      }, 300);
    }
  };

  const handleChipClick = (fieldKey, value) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: value,
        timestamp: now(),
      },
    ]);
    updateModuleField(fieldKey, value);
  };

  const handleCitationClick = (refId) => {
    highlightCitation(refId);
    setTimeout(() => {
      document.getElementById(`citation-${refId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  if (!config) return null;

  const nextMissing = config.requiredFields.find(
    (f) => moduleFields[f.key]?.status !== 'complete'
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-gray-900">{config.title}</h2>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 ml-3.5">{config.persona} · {config.subtitle}</p>
        </div>
        <motion.button
          onClick={exitModule}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px]
            text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer"
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-3.5 h-3.5" />
          退出
        </motion.button>
      </div>

      {/* Progress */}
      <ModuleProgressBar
        config={config}
        moduleFields={moduleFields}
        moduleProgress={moduleProgress}
        moduleTotalFields={moduleTotalFields}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 space-y-5 bg-surface">
        {messages.map((msg) => {
          const isAI = msg.role === 'assistant';
          const hasAnalysis = isAI && msg.analysisSteps?.length > 0;
          const hasCitations = isAI && msg.inlineCitations?.length > 0;
          const hasDetail = hasAnalysis || hasCitations;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1
                  ${isAI ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[min(85%,660px)] ${isAI ? '' : 'text-right'}`}>
                <GuidedBubble
                  msg={msg}
                  isAI={isAI}
                  hasDetail={hasDetail}
                  hasAnalysis={hasAnalysis}
                  hasCitations={hasCitations}
                  onChipClick={handleChipClick}
                  onCitationClick={handleCitationClick}
                />
                <span className="text-[10px] text-gray-400 mt-1 block px-1">{msg.timestamp}</span>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom bar hint */}
      <div className="px-5 py-2 bg-white border-t border-gray-50">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {!isAllComplete && nextMissing && (
            <>
              <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                待补全：{nextMissing.label}
              </span>
              {nextMissing.chips && nextMissing.chips.slice(0, 3).map((chip) => (
                <motion.button
                  key={chip}
                  className="shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-full
                    bg-gray-50 border border-gray-100 text-gray-500
                    hover:border-brand/30 hover:text-brand hover:bg-brand-50/30
                    transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleChipClick(nextMissing.key, chip)}
                >
                  {chip}
                </motion.button>
              ))}
              {!nextMissing.chips && (
                <motion.button
                  className="shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-full
                    bg-gray-50 border border-gray-100 text-gray-500
                    hover:border-brand/30 hover:text-brand hover:bg-brand-50/30
                    transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setInputValue(nextMissing.label + '：')}
                >
                  + {nextMissing.label}
                </motion.button>
              )}
            </>
          )}
          {isAllComplete && (
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              信息已全部补全，报告已生成
            </span>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={nextMissing ? `请输入${nextMissing.label}...` : '输入补充信息...'}
              rows={1}
              className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2
                text-[13px] focus:outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/10
                placeholder:text-gray-400"
            />
          </div>
          <motion.button
            onClick={handleSend}
            className={`w-8 h-8 rounded-lg ${roleConfig.bgClass} text-white
              flex items-center justify-center cursor-pointer`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* ── Guided Bubble with inline Quick Reply chips & detail toggle ── */
function GuidedBubble({ msg, isAI, hasDetail, hasAnalysis, hasCitations, onChipClick, onCitationClick }) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div
        className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed
          ${isAI ? 'bg-white border border-gray-100 text-gray-700' : 'bg-brand text-white'}`}
      >
        {renderMarkdown(msg.content)}

        {hasDetail && (
          <button
            onClick={() => setDetailOpen((v) => !v)}
            className="mt-3 flex items-center gap-1 text-[11px] text-brand/60 hover:text-brand
              font-medium cursor-pointer transition-colors"
          >
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${detailOpen ? 'rotate-180' : ''}`} />
            {detailOpen ? '收起' : '查看详情'}
          </button>
        )}

        <AnimatePresence>
          {hasAnalysis && detailOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1 h-1 rounded-full bg-brand" />
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">推导步骤</p>
                </div>
                <div className="ml-0.5">
                  {msg.analysisSteps.map((step) => (
                    <ReportStepItem key={step.step} step={step} totalSteps={msg.analysisSteps.length} onRefClick={onCitationClick} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hasCitations && detailOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1 h-1 rounded-full bg-pku-law" />
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">引用溯源</p>
                </div>
                <div className="space-y-1.5">
                  {msg.inlineCitations.map((c) => (
                    <ReportCitationCard key={c.id} citation={c} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isAI && msg.chips && msg.chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {msg.chips.map((chip) => (
            <motion.button
              key={chip}
              className="px-3 py-1.5 text-[11px] font-medium border border-gray-200 text-gray-600
                bg-white rounded-full hover:border-brand/30 hover:text-brand hover:bg-brand-50/30
                transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChipClick(msg.chipField, chip)}
            >
              {chip}
            </motion.button>
          ))}
        </div>
      )}
    </>
  );
}
