import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import WelcomePage from './components/WelcomePage';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const { showWelcome } = useApp();

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <WelcomePage />
        </motion.div>
      ) : (
        <motion.div
          key="workspace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-screen w-screen overflow-hidden bg-gray-50"
        >
          {/* Left Sidebar */}
          <div className="w-[240px] min-w-[220px] h-full shrink-0">
            <Sidebar />
          </div>

          {/* Chat Panel — full remaining width */}
          <div className="flex-1 h-full p-2">
            <ChatPanel />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
