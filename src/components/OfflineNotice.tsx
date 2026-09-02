import { useEffect, useState } from 'react';

const OfflineNotice = () => {
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setOffline(true);
      setHidden(false);
    };

    const handleOnline = () => {
      setOffline(false);
      setHidden(false);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!offline || hidden) return null;

  return (
    <div className="fixed left-3 right-3 top-20 z-[9999] mx-auto max-w-md rounded-xl border border-yellow-400/50 bg-black/95 px-4 py-3 text-center text-white shadow-2xl">
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Close offline notice"
        className="absolute right-2 top-1 flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-gray-300 hover:bg-white/10 hover:text-white"
      >
        ×
      </button>

      <div className="pr-6 text-sm font-semibold text-yellow-300">
        You’re offline.
      </div>
      <div className="mt-1 text-sm text-gray-200">
        ads and online features may be unavailable.
      </div>
    </div>
  );
};

export default OfflineNotice;
