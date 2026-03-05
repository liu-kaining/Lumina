import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { ImageLanguage } from '../../types';

interface LanguageSelectorProps {
  value: ImageLanguage;
  onChange: (language: ImageLanguage) => void;
  disabled?: boolean;
}

const languageOptions: { id: ImageLanguage; name: string; description: string }[] = [
  { id: 'chinese', name: '中文', description: '图片中的文字显示为中文' },
  { id: 'english', name: 'English', description: '图片中的文字显示为英文' },
];

export function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLanguage = languageOptions.find((l) => l.id === value);

  return (
    <div className="sel-wrap">
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`sel-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
      >
        <div className="sel-trigger-left">
          <Globe className="sel-icon-amber" style={{ width: 16, height: 16 }} />
          <div>
            <p className="sel-trigger-name">{selectedLanguage?.name}</p>
            <p className="sel-trigger-desc">{selectedLanguage?.description}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="chevron" style={{ width: 16, height: 16 }} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="sel-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="sel-dropdown"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {languageOptions.map((language) => (
                <motion.button
                  key={language.id}
                  type="button"
                  onClick={() => {
                    onChange(language.id);
                    setIsOpen(false);
                  }}
                  className={`sel-option ${value === language.id ? 'selected' : ''}`}
                  whileHover={{ x: 2 }}
                >
                  <div className="sel-trigger-left">
                    <Globe
                      className={value === language.id ? 'sel-icon-amber' : ''}
                      style={{ width: 16, height: 16, color: value === language.id ? undefined : '#9ca3af' }}
                    />
                    <div>
                      <p className={`sel-option-name ${value === language.id ? 'selected' : ''}`}>
                        {language.name}
                      </p>
                      <p className="sel-option-desc">{language.description}</p>
                    </div>
                  </div>
                  {value === language.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="sel-option-check"
                      style={{ width: 20, height: 20 }}
                    >
                      <Check style={{ width: 12, height: 12 }} />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
