import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  onUnlock: () => void;
}

export function PinProtection({ onUnlock }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const correctPin = import.meta.env.VITE_SETTINGS_PIN || '123456';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === correctPin) {
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-sm mx-auto mt-10 w-full animate-in fade-in zoom-in-95">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-blue-600" />
      </div>
      
      <h2 className="text-xl font-bold text-slate-900 mb-2">Protected Area</h2>
      <p className="text-sm text-slate-500 mb-8 text-center">
        Enter the administrative PIN to access the master data configuration.
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <input
            type="password"
            autoFocus
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            placeholder="Enter PIN"
            className={cn(
              "w-full h-12 px-4 bg-slate-50 border rounded-xl text-center text-xl tracking-[0.5em] focus:bg-white focus:ring-2 outline-none transition-all placeholder:tracking-normal",
              error ? "border-red-300 focus:border-red-500 focus:ring-red-100 placeholder-red-300" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100 placeholder-slate-400"
            )}
          />
          {error && (
            <span className="text-xs font-semibold text-red-500 flex items-center justify-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Incorrect PIN
            </span>
          )}
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm"
        >
          Unlock Settings
        </button>
      </form>
    </div>
  );
}
