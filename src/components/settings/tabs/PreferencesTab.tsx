'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreferencesTabProps {
  initialPreferences?: {
    assignments?: boolean;
    sessions?: boolean;
    resources?: boolean;
    announcements?: boolean;
    feedback?: boolean;
  } | null;
}

const PREFERENCE_ITEMS = [
  {
    key: 'assignments' as const,
    title: 'Assignments & Project Deadlines',
    desc: 'Alerts when new assignments are published or submissions are received.',
  },
  {
    key: 'sessions' as const,
    title: 'Live Sessions & Reminders',
    desc: 'Notifications when scheduled workshops, guest lectures, or office hours are booked.',
  },
  {
    key: 'resources' as const,
    title: 'Learning Resources',
    desc: 'Alerts when mentors post slides, guides, videos, or code boilerplates.',
  },
  {
    key: 'announcements' as const,
    title: 'Cohort Bulletins & Notices',
    desc: 'General announcements and track-wide broadcast notices from mentors and admins.',
  },
  {
    key: 'feedback' as const,
    title: 'Submission Grading & Review Feedback',
    desc: 'Instant notifications when your assignment receives an evaluation or review remarks.',
  },
];

export function PreferencesTab({ initialPreferences }: PreferencesTabProps) {
  const [prefs, setPrefs] = useState({
    assignments: initialPreferences?.assignments !== false,
    sessions: initialPreferences?.sessions !== false,
    resources: initialPreferences?.resources !== false,
    announcements: initialPreferences?.announcements !== false,
    feedback: initialPreferences?.feedback !== false,
  });
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsFeedback, setPrefsFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSavePreferences = async () => {
    setPrefsSaving(true);
    setPrefsFeedback(null);

    try {
      const res = await fetch('/api/settings/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();

      if (!res.ok) {
        setPrefsFeedback({ type: 'error', message: data.error || 'Failed to save preferences' });
      } else {
        setPrefsFeedback({ type: 'success', message: 'Notification preferences saved!' });
      }
    } catch {
      setPrefsFeedback({ type: 'error', message: 'A network error occurred.' });
    } finally {
      setPrefsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#E5DFD0] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="border-b border-[#E5DFD0] pb-4">
          <h3 className="text-lg font-black text-[#0D0E11]">In-App Notification Preferences</h3>
          <p className="text-xs text-[#5F6368] font-medium">
            Control which optional activity notifications appear in your bell dropdown and feed.
          </p>
        </div>

        {prefsFeedback && (
          <div
            className={cn(
              'p-4 rounded-2xl text-xs font-semibold flex items-center gap-3',
              prefsFeedback.type === 'success'
                ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20'
                : 'bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20'
            )}
          >
            {prefsFeedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{prefsFeedback.message}</span>
          </div>
        )}

        <div className="space-y-3">
          {PREFERENCE_ITEMS.map((item) => {
            const enabled = prefs[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-2xl border border-[#E5DFD0] bg-[#FAF7EE] hover:bg-white transition-colors"
              >
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-black text-[#0D0E11] block">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[#5F6368] font-medium block">
                    {item.desc}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                  }
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    enabled ? 'bg-[#34A853]' : 'bg-[#E5DFD0]'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 text-xs text-[#4285F4] flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Critical System Alerts:</span>
            <span className="text-[11px] opacity-90 block">
              Account security notices, password changes, and track enrollment confirmations are critical alerts and are always delivered.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-[#E5DFD0]">
          <button
            type="button"
            onClick={handleSavePreferences}
            disabled={prefsSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D0E11] text-[#FAF7EE] hover:bg-[#0D0E11]/85 transition-all shadow-2xs disabled:opacity-50"
          >
            {prefsSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}
