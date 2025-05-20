import { motion } from 'framer-motion';

export default function PanelShell({ title, children, onRefresh }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="p-4 bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs text-blue-300 border border-blue-500 px-2 py-0.5 rounded hover:bg-blue-500 hover:text-white transition"
          >
            Refresh
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
}
