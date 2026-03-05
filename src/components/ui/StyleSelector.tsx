import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { defaultStylePresets } from '../../core/presets';
import { cn } from '../../lib/utils';

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function StyleSelector({ value, onChange, disabled }: StyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPreset = defaultStylePresets.find((p) => p.id === value) || defaultStylePresets[0];

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-3 rounded-xl',
          'bg-white border shadow-sm',
          'text-left flex items-center justify-between',
          'transition-all duration-200',
          isOpen && 'border-amber-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{selectedPreset.emoji}</span>
          <div>
            <span className="text-gray-800 text-sm font-medium">{selectedPreset.name}</span>
            <p className="text-gray-400 text-xs mt-0.5">{selectedPreset.description}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* 下拉选项 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full left-0 right-0 z-50 mt-2',
              'rounded-xl overflow-hidden',
              'bg-white border border-gray-200 shadow-lg',
              'max-h-80 overflow-y-auto'
            )}
          >
            {defaultStylePresets.map((preset, index) => {
              const isSelected = preset.id === value;

              return (
                <motion.button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onChange(preset.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-3 flex items-center gap-3',
                    'text-left transition-all duration-150',
                    isSelected
                       ? 'bg-amber-50 border-l-2 border-amber-400'
                       : 'hover:bg-gray-50 border-l-2 border-transparent'
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <span className="text-xl">{preset.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-amber-700' : 'text-gray-700'
                      )}>
                        {preset.name}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5 truncate">
                      {preset.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}