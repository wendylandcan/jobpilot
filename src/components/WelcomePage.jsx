import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  ShieldCheck,
  Library,
  Briefcase,
  ArrowRight,
  Loader2,
  Scale,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const ROLE_CARDS = [
  {
    key: 'worker',
    title: '劳动者',
    desc: '维权咨询 · 赔偿计算 · 证据指导',
    icon: FileSearch,
    accent: 'from-blue-600 to-blue-700',
    accentLight: 'bg-blue-50 group-hover:bg-blue-600',
    iconActive: 'text-blue-600 group-hover:text-white',
  },
  {
    key: 'employer',
    title: '用工者',
    desc: '合规审查 · 合同生成 · 风险管控',
    icon: ShieldCheck,
    accent: 'from-slate-700 to-slate-800',
    accentLight: 'bg-slate-100 group-hover:bg-slate-700',
    iconActive: 'text-slate-600 group-hover:text-white',
  },
  {
    key: 'lawyer',
    title: '律师',
    desc: '法规检索 · 证据整理 · 案例分析',
    icon: Scale,
    accent: 'from-gray-800 to-gray-900',
    accentLight: 'bg-gray-100 group-hover:bg-gray-800',
    iconActive: 'text-gray-600 group-hover:text-white',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function WelcomePage() {
  const { selectRole } = useApp();
  const [loadingRole, setLoadingRole] = useState(null);

  const handleSelect = (key) => {
    if (loadingRole) return;
    setLoadingRole(key);
    setTimeout(() => selectRole(key), 500);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-lg shadow-brand/15">
            <Briefcase className="w-5.5 h-5.5 text-white" strokeWidth={1.6} />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
              职引
              <span className="font-light text-gray-300 ml-1.5">JobPilot</span>
            </h1>
          </div>
        </div>
        <p className="text-sm text-gray-400 tracking-wide">
          可溯源的 AI 劳动法律顾问
        </p>
      </motion.div>

      {/* Prompt */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-[15px] text-gray-500 mb-8 tracking-wide relative z-10"
      >
        选择您的身份，开始专属咨询
      </motion.p>

      {/* Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-4 px-6 max-w-[700px] w-full relative z-10"
      >
        {ROLE_CARDS.map((card) => {
          const isLoading = loadingRole === card.key;
          const isDisabled = loadingRole && !isLoading;
          return (
            <motion.div
              key={card.key}
              variants={cardVariants}
              whileHover={!loadingRole ? { y: -6, transition: { duration: 0.25, ease: 'easeOut' } } : {}}
              onClick={() => handleSelect(card.key)}
              className={`flex-1 ${isDisabled ? 'pointer-events-none opacity-25' : 'cursor-pointer'}`}
            >
              <div
                className={`group relative bg-white rounded-2xl px-6 py-7
                  flex flex-col items-center text-center
                  border transition-all duration-300
                  ${isLoading
                    ? 'border-brand/25 shadow-lg shadow-brand/8'
                    : 'border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-gray-200 hover:shadow-lg hover:shadow-gray-900/5'
                  }`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center
                    transition-all duration-300 ${isLoading ? `bg-gradient-to-br ${card.accent} shadow-md` : card.accentLight}`}
                >
                  <card.icon
                    size={22}
                    className={`transition-colors duration-300
                      ${isLoading ? 'text-white' : card.iconActive}`}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h2 className="text-[15px] font-semibold text-gray-800 mt-5 tracking-wide">
                  {card.title}
                </h2>

                {/* Description */}
                <p className="text-[11px] text-gray-400 mt-1 tracking-wider leading-relaxed">
                  {card.desc}
                </p>

                {/* CTA */}
                <div className="mt-5">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1.5 text-xs text-brand/60"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        初始化
                      </motion.span>
                    ) : (
                      <motion.span
                        key="cta"
                        className="inline-flex items-center gap-1 text-xs font-medium
                          text-gray-400 group-hover:text-gray-700 transition-colors duration-300"
                      >
                        进入
                        <ArrowRight
                          className="w-3.5 h-3.5 transition-transform duration-300
                            group-hover:translate-x-0.5"
                          strokeWidth={1.8}
                        />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-[10px] text-gray-300 tracking-wider relative z-10"
      >
        JobPilot v1.0
      </motion.p>
    </div>
  );
}
