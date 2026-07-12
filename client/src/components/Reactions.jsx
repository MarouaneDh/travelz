import { useState } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../api.js';

const EMOJIS = ['😍', '🤤', '🧳', '🔥', '👏'];

export default function Reactions({ momentId, initial }) {
  const [counts, setCounts] = useState(initial || {});
  const [busy, setBusy] = useState(false);

  const react = async (emoji, e) => {
    if (busy) return;
    setBusy(true);
    // Optimistic bump.
    setCounts((c) => ({ ...c, [emoji]: (c[emoji] || 0) + 1 }));

    // Confetti burst from the button.
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 40,
      spread: 55,
      startVelocity: 28,
      scalar: 0.9,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
    });

    try {
      const { reactions } = await api.react(momentId, emoji);
      setCounts(reactions);
    } catch {
      // Roll back on failure.
      setCounts((c) => ({ ...c, [emoji]: Math.max(0, (c[emoji] || 1) - 1) }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="reactions" aria-label="React to this moment">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          className="reaction-btn"
          onClick={(e) => react(emoji, e)}
          aria-label={`React ${emoji}`}
        >
          <span className="reaction-emoji">{emoji}</span>
          {counts[emoji] ? <span className="reaction-count">{counts[emoji]}</span> : null}
        </button>
      ))}
    </div>
  );
}
