import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { ImageLanguage } from '../../types';
import { cn } from '../../lib/utils';

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
    <div className="relative">
      {/* 触发按钮 */}
      <motion.button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2.5 rounded-xl text-left',
          'bg-white border border-gray-200 shadow-sm',
          'hover:border-gray-300 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'border-amber-400'
        )}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-gray-800 text-sm font-medium">{selectedLanguage?.name}</p>
              <p className="text-gray-400 text-xs">{selectedLanguage?.description}</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>
      </motion.button>

      {/* 下拉选项 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* 下拉菜单 */}
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {languageOptions.map((language) => (
                <motion.button
                  key={language.id}
                  onClick={() => {
                    onChange(language.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors',
                    'flex items-center justify-between',
                    value === language.id && 'bg-amber-50'
                  )}
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-center gap-2">
                    <Globe className={cn(
                       'w-4 h-4',
                       value === language.id ? 'text-amber-500' : 'text-gray-400'
                     )} />
                    <div>
                      <p className={cn(
                        'text-sm font-medium',
                        value === language.id ? 'text-amber-700' : 'text-gray-700'
                      )}>
                        {language.name}
                      </p>
                      <p className="text-gray-400 text-xs">{language.description}</p>
                    </div>
                  </div>
                  {value === language.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
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