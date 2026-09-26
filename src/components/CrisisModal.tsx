import React from 'react';
import { motion } from 'motion/react';
import { PhoneCall, HeartHandshake, ShieldAlert, X, ExternalLink } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121f17] border border-rose-200 dark:border-rose-900/60 p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-start justify-between pb-3 border-b border-rose-100 dark:border-rose-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950 dark:text-rose-100">
                You Are Not Alone
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Immediate, free, and confidential crisis support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-50 text-rose-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-emerald-950 dark:text-emerald-100 my-4 leading-relaxed">
          If you or someone you know is going through a heavy moment or experiencing thoughts of harm, please know there are trained counselors ready to listen with warmth, without judgment.
        </p>

        {/* Hotlines */}
        <div className="space-y-2.5">
          {/* NCMH */}
          <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block uppercase tracking-wide">
              Philippines &bull; National Center for Mental Health (24/7)
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <a
                href="tel:1553"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs hover:bg-rose-700 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Dial 1553 (Toll-Free)</span>
              </a>
              <a
                href="tel:+639178998727"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1c2e22] text-rose-700 dark:text-rose-200 border border-rose-200 text-xs font-semibold hover:bg-rose-50 transition-colors"
              >
                <span>0917-899-8727</span>
              </a>
            </div>
          </div>

          {/* In Touch Community */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-[#172b1f] border border-emerald-200/80 dark:border-emerald-800/40">
            <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block uppercase tracking-wide">
              In Touch Community Services (Crisis Line)
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <a
                href="tel:+63288937603"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>(02) 8893-7603</span>
              </a>
              <a
                href="tel:+639178001123"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1c2e22] text-emerald-800 dark:text-emerald-200 border border-emerald-200 text-xs font-semibold"
              >
                <span>0917-800-1123</span>
              </a>
            </div>
          </div>

          {/* International */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold block text-slate-900 dark:text-slate-100 mb-1">
              International Support:
            </span>
            <p className="text-[11px] leading-relaxed">
              If outside the Philippines, dial <strong>988</strong> in US/Canada, or visit{' '}
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-semibold underline inline-flex items-center gap-0.5"
              >
                findahelpline.com <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              for confidential support worldwide.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-emerald-900 text-white text-xs font-bold hover:bg-emerald-950 transition-colors cursor-pointer"
        >
          Return to Companion Sanctuary
        </button>
      </motion.div>
    </div>
  );
};
