import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  ShieldCheck,
  Swords,
  MessageSquareText,
  ChevronDown,
  Briefcase,
  BookOpen,
  Scale,
  FileSearch,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES, HISTORY_ITEMS } from '../data/mockData';

const ROLE_NAV_ITEMS = {
  worker: [
    { icon: Calculator, label: '赔偿金计算器', moduleKey: 'compensation_calculator' },
    { icon: ShieldCheck, label: '证据体检箱', moduleKey: 'evidence_checker' },
    { icon: Swords, label: '博弈锦囊与话术', moduleKey: 'strategy_advisor' },
  ],
  employer: [
    { icon: Scale, label: '合规风险扫描', moduleKey: 'compliance_scanner' },
    { icon: ShieldCheck, label: '合同模板库', moduleKey: 'contract_templates' },
    { icon: Swords, label: '沟通话术指南', moduleKey: 'communication_guide' },
  ],
  lawyer: [
    { icon: BookOpen, label: '法规库检索', moduleKey: 'law_search' },
    { icon: FileSearch, label: '证据整理工具', moduleKey: 'evidence_organizer' },
    { icon: Calculator, label: '赔偿金计算器', moduleKey: 'lawyer_compensation' },
  ],
};

export default function Sidebar() {
  const { currentRole, startModule, activeModule } = useApp();
  const roleConfig = ROLES[currentRole];
  const navItems = ROLE_NAV_ITEMS[currentRole] || ROLE_NAV_ITEMS.worker;
  const [showHistory, setShowHistory] = useState(false);

  const handleNavClick = (moduleKey) => {
    if (moduleKey) startModule(moduleKey);
  };

  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-gray-200/80">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl ${roleConfig.bgClass} flex items-center justify-center shadow-sm`}
          >
            <Briefcase className="w-5 h-5 text-white" strokeWidth={1.6} />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">
              职引 <span className="font-light">JobPilot</span>
            </h1>
            <p className="text-[10px] text-gray-400 -mt-0.5">AI 劳动法律顾问</p>
          </div>
        </div>
      </div>

      {/* Core Modules */}
      <div className="px-4 pt-5 pb-2 flex-1">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-3 px-1">
          {roleConfig.label} · 核心模块
        </p>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeModule === item.moduleKey;
            return (
              <motion.button
                key={item.moduleKey}
                onClick={() => handleNavClick(item.moduleKey)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors cursor-pointer
                  ${isActive
                    ? `${roleConfig.bgClass} text-white`
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon
                  className={`w-4.5 h-4.5 ${isActive ? 'text-white' : roleConfig.textClass}`}
                />
                <span className="text-left">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Collapsible History */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-5 py-3 text-[11px]
            font-medium text-gray-400 uppercase tracking-wider hover:bg-gray-50
            transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>历史咨询</span>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full normal-case">
              {HISTORY_ITEMS.length}
            </span>
          </div>
          <motion.div animate={{ rotate: showHistory ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                {HISTORY_ITEMS.map((item) => (
                  <motion.div
                    key={item.id}
                    className="px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 font-medium truncate pr-2 group-hover:text-gray-800">
                        {item.title}
                      </p>
                      <MessageSquareText className="w-3 h-3 text-gray-300 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400">{item.date}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          item.status === '进行中'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-gray-100">
        <p className="text-[10px] text-gray-300 text-center">
          职引 JobPilot v1.0 · Web Demo
        </p>
      </div>
    </aside>
  );
}
