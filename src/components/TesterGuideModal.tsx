import React from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, Heart, Sparkles, BookOpen, Users, Compass, Shield } from 'lucide-react';

interface TesterGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TesterGuideModal: React.FC<TesterGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1411]/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#182a22] border border-emerald-200 dark:border-emerald-800 p-6 shadow-2xl overflow-y-auto max-h-[88vh]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/60">
          <div>
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
              Prototype &amp; Testing Guide
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              How to evaluate Hangin as a mental health self-care companion
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-emerald-950 dark:text-emerald-100 leading-relaxed">
          {/* Section 1 */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-[#182a22] border border-emerald-100 dark:border-emerald-800/40">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              1. 3D Animal Companion Mechanics (Dog &amp; Cat)
            </h4>
            <ul className="space-y-1 list-disc list-inside text-emerald-800 dark:text-emerald-300">
              <li><strong>Interactive 3D Viewport:</strong> Tap directly on the animal to pet it (triggers wagging, purrs, and floating 3D hearts).</li>
              <li><strong>3D Orbit &amp; Tracking:</strong> Click/touch &amp; drag to rotate the camera around the pet; moving your cursor makes the head softly look toward you.</li>
              <li><strong>Care Loops:</strong> Feeding brings real snacks, bathing triggers animated bubbles and shakes, and tucking them in triggers a curled sleeping posture with floating Zzz particles.</li>
              <li><strong>3D Wearables:</strong> Equip Salakot hats, beanies, or sunglasses in the Market to see them instantly appear on the 3D model!</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-[#182a22] border border-teal-100 dark:border-teal-800/40">
            <h4 className="font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5 mb-1.5">
              <Compass className="w-4 h-4 text-teal-600" />
              2. Evidence-Based Mental Health Modules
            </h4>
            <ul className="space-y-1 list-disc list-inside text-teal-900 dark:text-teal-300">
              <li><strong>Box Breathing (4-4-4-4):</strong> Clinically grounded parasympathetic nervous system regulator.</li>
              <li><strong>5-4-3-2-1 Sensory Grounding:</strong> Anchors racing thoughts during acute anxiety or sensory overload.</li>
              <li><strong>Sanctuary Mode:</strong> Timed digital detox sessions to reduce screen-time fatigue.</li>
              <li><strong>Encrypted Private Journal:</strong> 4-digit PIN lock ensures safety and personal vulnerability space.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
            <h4 className="font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5 mb-1.5">
              <Shield className="w-4 h-4 text-rose-600" />
              3. Crisis Intercept &amp; Safety Protocol
            </h4>
            <p className="text-rose-900 dark:text-rose-300">
              Any high-risk phrase typed in the Journal or Bayanihan Circle feed triggers the compassionate safety banner and provides direct 24/7 access to the Philippine National Center for Mental Health (Dial 1553) and global hotlines.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
            <h4 className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              4. Non-Exploitative Economy
            </h4>
            <p className="text-amber-900 dark:text-amber-300">
              Wellness Points (WP) are only earned through actual healthy real-world habits and mindful grounding. No gambling, loot boxes, or predatory retention loops.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors cursor-pointer"
        >
          Close Guide &amp; Return to App
        </button>
      </motion.div>
    </div>
  );
};
