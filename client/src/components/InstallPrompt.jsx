import { useEffect, useState } from 'react';

const DISMISS_KEY = 'installPromptDismissed';
const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
const isStandalone =
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

export default function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferredEvent(e);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, '1');
  }

  async function handleInstall() {
    if (!deferredEvent) return;
    deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
  }

  if (isStandalone || dismissed) return null;
  if (!isIos && !deferredEvent) return null;

  return (
    <div className="install-banner">
      {isIos ? (
        <p>
          Is app ko home screen par add karne ke liye: neeche <strong>Share</strong> button dabayein, phir{' '}
          <strong>"Add to Home Screen"</strong> chunein.
        </p>
      ) : (
        <p>Is app ko apne phone ki home screen par add karein — bilkul ek normal app jaisa chalega.</p>
      )}
      <div className="install-actions">
        {!isIos && <button onClick={handleInstall}>App Install Karein</button>}
        <button className="danger" onClick={dismiss}>
          Band Karein
        </button>
      </div>
    </div>
  );
}
