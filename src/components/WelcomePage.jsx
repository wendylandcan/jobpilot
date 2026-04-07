import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  ShieldCheck,
  Library,
  Briefcase,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const ROLE_CARDS = [
  {
    key: 'worker',
    title: '劳动者',
    desc: '维权咨询 · 赔偿计算 · 证据指导',
    icon: FileSearch,
  },
  {
    key: 'employer',
    title: '用工者',
    desc: '合规审查 · 合同生成 · 风险管控',
    icon: ShieldCheck,
  },
  {
    key: 'lawyer',
    title: '律师',
    desc: '法规检索 · 证据整理 · 案例分析',
    icon: Library,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
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
    <div className="h-screen w-screen bg-gradient-to-b from-slate-50 to-slate-100/60 flex flex-col items-center justify-center overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-sm shadow-brand/20">
            <Briefcase className="w-5 h-5 text-white" strokeWidth={1.7} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            职引
            <span className="font-normal text-slate-300 ml-1">JobPilot</span>
          </h1>
        </div>
        <p className="text-sm text-slate-400 tracking-[0.08em]">
          可溯源的 AI 劳动法律顾问
        </p>
      </motion.div>

      {/* Prompt */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-[15px] text-slate-500 mb-8 tracking-wide"
      >
        选择您的身份，开始专属咨询
      </motion.p>

      {/* Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-6 px-6 max-w-[780px] w-full"
      >
        {ROLE_CARDS.map((card) => {
          const isLoading = loadingRole === card.key;
          const isDisabled = loadingRole && !isLoading;
          return (
            <motion.div
              key={card.key}
              variants={cardVariants}
              whileHover={!loadingRole ? { y: -4, transition: { duration: 0.2 } } : {}}
              onClick={() => handleSelect(card.key)}
              className={`flex-1 ${isDisabled ? 'pointer-events-none opacity-30' : 'cursor-pointer'}`}
            >
              <div
                className={`group relative bg-white rounded-2xl px-7 py-9
                  flex flex-col items-center text-center
                  border transition-all duration-300
                  ${isLoading
                    ? 'border-brand/30 shadow-[0_0_0_1px_rgba(30,58,138,0.08),0_8px_24px_rgba(30,58,138,0.10)]'
                    : 'border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-brand/20 hover:shadow-[0_8px_24px_rgba(30,58,138,0.08)]'
                  }`}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${isLoading
                      ? 'bg-brand shadow-md shadow-brand/15'
                      : 'bg-brand-50 group-hover:bg-brand group-hover:shadow-md group-hover:shadow-brand/15'
                    }`}
                >
                  <card.icon
                    size={24}
                    className={`transition-colors duration-300
                      ${isLoading ? 'text-white' : 'text-brand group-hover:text-white'}`}
                    strokeWidth={1.6}
                  />
                </div>

                {/* Title */}
                <h2 className="text-[17px] font-semibold text-slate-800 mt-6 tracking-wide">
                  {card.title}
                </h2>

                {/* Description */}
                <p className="text-[12px] text-slate-400 mt-2 tracking-wider leading-relaxed">
                  {card.desc}
                </p>

                {/* CTA */}
                <div className="mt-6">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1.5 text-xs text-brand/70"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        配置中
                      </motion.span>
                    ) : (
                      <motion.span
                        key="cta"
                        className="inline-flex items-center gap-1 text-xs font-medium
                          text-slate-400 group-hover:text-brand transition-colors duration-300"
                      >
                        进入
                        <ArrowRight
                          className="w-3.5 h-3.5 transition-transform duration-300
                            group-hover:translate-x-0.5"
                          strokeWidth={2}
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
        transition={{ delay: 0.6 }}
        className="mt-12 text-[10px] text-slate-300 tracking-wider"
      >
        职引 JobPilot v1.0
      </motion.p>
    </div>
  );
}
