import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { defaultStylePresets } from '../../core/presets';

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function StyleSelector({ value, onChange, disabled }: StyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPreset = defaultStylePresets.find((p) => p.id === value) || defaultStylePresets[0];

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
    <div ref={containerRef} className="sel-wrap">
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`sel-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
      >
        <div className="sel-trigger-left">
          <span className="sel-trigger-emoji">{selectedPreset.emoji}</span>
          <div>
            <span className="sel-trigger-name">{selectedPreset.name}</span>
            <p className="sel-trigger-desc">{selectedPreset.description}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="chevron" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="sel-dropdown"
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
                  className={`sel-option ${isSelected ? 'selected' : ''}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <span className="sel-option-emoji">{preset.emoji}</span>
                  <div className="sel-option-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`sel-option-name ${isSelected ? 'selected' : ''}`}>
                        {preset.name}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="sel-option-check"
                        >
                          <Check style={{ width: 12, height: 12 }} />
                        </motion.div>
                      )}
                    </div>
                    <p className="sel-option-desc">{preset.description}</p>
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
