import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  ImagePlus,
  Bot,
  User,
  ChevronDown,
  ArrowLeftRight,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_CONVERSATION, GUIDE_CHIPS, ROLES, ROLE_GREETINGS } from '../data/mockData';
import GuidedChat from './GuidedChat';

const PHASES = [
  { key: 0, label: '背景采集' },
  { key: 1, label: '法律分析' },
  { key: 2, label: '方案生成' },
];

function PhaseBar({ currentPhase }) {
  return (
    <div className="flex items-center gap-0 px-5 py-2 bg-white/60 backdrop-blur-sm border-b border-gray-50">
      {PHASES.map((phase, idx) => (
        <div key={phase.key} className="flex items-center flex-1">
          <div className="flex items-center gap-1.5 flex-1">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold
                ${
                  idx < currentPhase
                    ? 'bg-emerald-500 text-white'
                    : idx === currentPhase
                      ? 'bg-brand text-white'
                      : 'bg-gray-100 text-gray-400'
                }`}
            >
              {idx < currentPhase ? '✓' : idx + 1}
            </div>
            <span
              className={`text-[11px] font-medium ${
                idx <= currentPhase ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {phase.label}
            </span>
          </div>
          {idx < PHASES.length - 1 && (
            <div
              className={`h-px flex-1 mx-2 ${
                idx < currentPhase ? 'bg-emerald-200' : 'bg-gray-100'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Inline Analysis Step (timeline item) ── */
function InlineStepItem({ step, totalSteps, onRefClick }) {
  const { expandedSteps, toggleStepExpand } = useApp();
  const isCompleted = step.status === 'completed';
  const isActive = step.status === 'active';
  const isExpanded = expandedSteps.has(step.step);
  const hasRefs = step.refIds && step.refIds.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step.step * 0.05 }}
      className="flex gap-2"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center pt-0.5">
        {isCompleted ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        ) : isActive ? (
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Circle className="w-3.5 h-3.5 text-brand shrink-0 fill-brand/20" />
          </motion.div>
        ) : (
          <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        )}
        {step.step < totalSteps && (
          <div
            className={`w-px flex-1 mt-1 ${
              isCompleted ? 'bg-emerald-200' : 'bg-gray-100'
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        <button
          onClick={() => toggleStepExpand(step.step)}
          className="w-full flex items-center justify-between cursor-pointer rounded-md
            px-1.5 py-0.5 -ml-0.5 hover:bg-gray-50/80 transition-colors"
        >
          <span
            className={`text-[11px] font-semibold text-left ${
              isActive ? 'text-brand' : isCompleted ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            Step {step.step}：{step.title}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
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
              <p className="text-[11px] text-gray-500 mt-1 ml-1 leading-relaxed">
                {step.content}
              </p>
              {hasRefs && (
                <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                  <span className="text-[10px] text-gray-400">引用</span>
                  {step.refIds.map((refId) => (
                    <button
                      key={refId}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefClick(refId);
                      }}
                      className="inline-flex items-center justify-center w-4.5 h-4.5 text-[9px]
                        font-bold text-white bg-pku-law rounded-full cursor-pointer
                        hover:bg-blue-700 hover:scale-110 transition-all"
                    >
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

/* ── Highlighted content for citation cards ── */
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

/* ── Inline Citation Card ── */
function InlineCitationCard({ citation }) {
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
      animate={{
        opacity: 1,
        y: 0,
        scale: isHighlighted ? 1.01 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-lg overflow-hidden cursor-pointer border relative
        ${isHighlighted ? 'border-pku-law shadow-[0_0_0_1.5px_#3182ce,0_4px_12px_rgba(49,130,206,0.12)]' : 'border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.03)]'}
        ${isAuthoritative ? 'bg-blue-50/50' : 'bg-emerald-50/50'}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleCitationExpand(citation.id);
      }}
    >
      {/* Pulse overlay */}
      {isHighlighted && (
        <div
          key={pulseKey}
          className="absolute inset-0 rounded-lg highlight-pulse pointer-events-none z-0"
        />
      )}

      {/* Compact header */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0
              ${isAuthoritative ? 'bg-pku-law' : 'bg-firm-article'}`}
          >
            {citation.tag}
          </span>
          <span className="text-[11px] font-medium text-gray-600 truncate">
            {citation.shortTitle}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
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
            <div className="px-3 pb-2.5">
              <p className="text-[11px] font-semibold text-gray-800 mb-1.5">{citation.title}</p>
              <div
                className={`p-2.5 rounded-md text-[11px] leading-relaxed text-gray-600
                  ${isAuthoritative ? 'bg-blue-100/40 border border-blue-200/50' : 'bg-emerald-100/40 border border-emerald-200/50'}`}
              >
                {renderHighlightedContent(citation.content, citation.highlightRange, isHighlighted)}
              </div>
              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <div className="text-[10px] text-gray-400 flex gap-2">
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

/* ── Chat Bubble ── */
function ChatBubble({ message, onCitationClick }) {
  const isAI = message.role === 'assistant';
  const [detailOpen, setDetailOpen] = useState(false);
  const hasAnalysis = isAI && message.analysisSteps && message.analysisSteps.length > 0;
  const hasCitations = isAI && message.inlineCitations && message.inlineCitations.length > 0;
  const hasDetail = hasAnalysis || hasCitations;

  const renderContent = (text) => {
    const parts = text.split(/(\[(\d+)\])/g);
    const elements = [];
    let i = 0;
    while (i < parts.length) {
      if (i + 2 < parts.length && parts[i + 1] && /^\[\d+\]$/.test(parts[i + 1])) {
        elements.push(<span key={`t-${i}`}>{parts[i]}</span>);
        const refNum = parseInt(parts[i + 2], 10);
        elements.push(
          <button
            key={`c-${i}`}
            data-ref-id={refNum}
            onClick={(e) => {
              e.stopPropagation();
              onCitationClick(refNum);
            }}
            className="inline-flex items-center justify-center w-4.5 h-4.5 mx-0.5 text-[9px]
              font-bold text-white bg-pku-law rounded-full cursor-pointer
              hover:bg-blue-700 hover:scale-110 transition-all align-super"
          >
            {refNum}
          </button>
        );
        i += 3;
      } else {
        elements.push(<span key={`t-${i}`}>{parts[i]}</span>);
        i++;
      }
    }
    return elements;
  };

  const renderMarkdown = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc">
            {renderContent(line.slice(2))}
          </li>
        );
      }
      const numberedMatch = line.match(/^(\d+)\.\s/);
      if (numberedMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal">
            {renderContent(line.slice(numberedMatch[0].length))}
          </li>
        );
      }
      const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      if (boldedLine !== line) {
        return (
          <p key={idx} dangerouslySetInnerHTML={{ __html: boldedLine }} className="my-0.5" />
        );
      }
      if (line.trim() === '') return <br key={idx} />;
      return (
        <p key={idx} className="my-0.5">
          {renderContent(line)}
        </p>
      );
    });
  };

  return (
    <motion.div
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
        <div
          className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed
            ${
              isAI
                ? 'bg-white border border-gray-100 text-gray-700'
                : 'bg-brand text-white'
            }`}
        >
          {renderMarkdown(message.content)}

          {/* ── Toggle for analysis detail ── */}
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

          {/* ── Inline Analysis Steps ── */}
          <AnimatePresence>
            {hasAnalysis && detailOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1 h-1 rounded-full bg-brand" />
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      推导步骤
                    </p>
                  </div>
                  <div className="ml-0.5">
                    {message.analysisSteps.map((step) => (
                      <InlineStepItem
                        key={step.step}
                        step={step}
                        totalSteps={message.analysisSteps.length}
                        onRefClick={onCitationClick}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Inline Citation Cards ── */}
          <AnimatePresence>
            {hasCitations && detailOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1 h-1 rounded-full bg-pku-law" />
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      引用溯源
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {message.inlineCitations.map((citation) => (
                      <InlineCitationCard key={citation.id} citation={citation} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className="text-[10px] text-gray-400 mt-1 block px-1">{message.timestamp}</span>

        {/* Follow-up options */}
        {message.followUpOptions && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.followUpOptions.map((opt) => (
              <motion.button
                key={opt}
                className="px-3 py-1.5 text-[11px] font-medium border border-gray-200 text-gray-600
                  bg-white rounded-full hover:border-brand/30 hover:text-brand hover:bg-brand-50/30
                  transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main Router ── */
export default function ChatPanel() {
  const { activeModule } = useApp();

  if (activeModule) {
    return <GuidedChat />;
  }

  return <NormalChatPanel />;
}

/* ── Normal Chat Panel (non-module mode) ── */
function NormalChatPanel() {
  const { currentRole, highlightCitation, analysisPhase, goToWelcome } = useApp();
  const [inputValue, setInputValue] = useState('');
  const roleConfig = ROLES[currentRole];
  const allChips = GUIDE_CHIPS[currentRole];
  const greeting = ROLE_GREETINGS[currentRole];

  const CHIP_KEYWORDS = {
    '入职时间': ['入职', '工作.*年', '干了.*年', '去年.*月', '今年.*月', '\\d+年'],
    '所在城市': ['北京', '上海', '广州', '深圳', '杭州', '成都', '城市', '在.*工作'],
    '用工形式': ['正式', '合同工', '劳务派遣', '外包', '临时工', '实习', '用工形式'],
    '合同类型': ['固定期限', '无固定期限', '劳动合同', '劳务合同', '合同类型'],
    '离职原因': ['辞退', '开除', '裁员', '主动离职', '被迫离职', '辞职', '解除', '开了'],
    '企业规模': ['人.*公司', '员工.*人', '小企业', '大企业', '规模'],
    '用工地点': ['北京', '上海', '广州', '深圳', '杭州', '地点', '在.*经营'],
    '行业类别': ['互联网', '制造', '金融', '教育', '医疗', '餐饮', '行业'],
    '员工类型': ['全职', '兼职', '实习生', '退休返聘', '劳务派遣', '员工类型'],
    '风险场景': ['解除', '调岗', '降薪', '加班', '工伤', '竞业', '风险'],
    '案件类型': ['劳动争议', '工伤', '工资', '解除', '竞业限制', '案件类型'],
    '管辖法院': ['仲裁委', '法院', '中院', '基层法院', '管辖'],
    '争议金额': ['万元', '元', '金额', '赔偿.*\\d+', '\\d+.*工资'],
    '证据清单': ['证据', '录音', '合同', '工资条', '微信记录', '聊天记录'],
    '适用地区': ['北京', '上海', '广州', '深圳', '地区', '当地'],
  };

  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      role: 'assistant',
      content: greeting.content,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      followUpOptions: greeting.followUpOptions,
    },
  ]);
  const messagesEndRef = useRef(null);
  const prevRoleRef = useRef(currentRole);

  useEffect(() => {
    if (currentRole !== prevRoleRef.current) {
      const g = ROLE_GREETINGS[currentRole];
      setMessages([
        {
          id: Date.now(),
          role: 'assistant',
          content: g.content,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          followUpOptions: g.followUpOptions,
        },
      ]);
      prevRoleRef.current = currentRole;
    }
  }, [currentRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chips = useMemo(() => {
    const userText = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join(' ');
    if (!userText) return allChips;
    return allChips.filter((chip) => {
      const keywords = CHIP_KEYWORDS[chip];
      if (!keywords) return true;
      return !keywords.some((kw) => new RegExp(kw).test(userText));
    });
  }, [messages, allChips]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: inputValue,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setInputValue('');
  };

  const handleCitationClick = (refId) => {
    highlightCitation(refId);
    setTimeout(() => {
      const el = document.getElementById(`citation-${refId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">智能法律咨询</h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            当前身份：{roleConfig.label}
          </p>
        </div>
        <motion.button
          onClick={goToWelcome}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px]
            text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer"
          whileTap={{ scale: 0.95 }}
          title="切换身份"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          切换
        </motion.button>
      </div>

      {/* Phase Progress Bar */}
      <PhaseBar currentPhase={analysisPhase} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 space-y-5 bg-surface">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            onCitationClick={handleCitationClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Guide Chips */}
      <AnimatePresence>
        {chips.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-2 bg-white border-t border-gray-50">
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                <span className="text-[10px] text-gray-400 shrink-0 font-medium">补充</span>
                <AnimatePresence mode="popLayout">
                  {chips.map((chip) => (
                    <motion.button
                      key={chip}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className={`shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-full
                        bg-gray-50 border border-gray-100 text-gray-500
                        hover:border-brand/30 hover:text-brand hover:bg-brand-50/30
                        transition-colors duration-200 cursor-pointer`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setInputValue((v) => (v ? v + '，' : '') + chip + '：')}
                    >
                      + {chip}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <motion.button
              className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center
                text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors cursor-pointer"
              whileTap={{ scale: 0.95 }}
              title="上传附件"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center
                text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors cursor-pointer"
              whileTap={{ scale: 0.95 }}
              title="上传图片"
            >
              <ImagePlus className="w-3.5 h-3.5" />
            </motion.button>
          </div>
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
              placeholder="描述您的劳动法律问题..."
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
