// src/components/Marong.js
import React, { useState, useEffect } from 'react';
import './Marong.css';

function Marong({ current, page }) {
  const [bark, setBark] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [directionRight, setDirectionRight] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirectionRight((prev) => !prev);
    }, 14000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
    if (directionRight) {
      setBark(true);
      setTimeout(() => setBark(false), 1500);
    }
  };

  const speed = Math.max(5, 20 - current);
  const isFlipped = !directionRight;

  const message =
    page === 'intro'
      ? '준비됐지? 마룽이랑 같이 가자!'
      : page === 'result'
      ? '잘했어! 다음엔 더 침착하게 도전해봐!'
      : '좋아 좋아~ 거의 다 왔어!';

  if (page === 'result') {
    return (
      <div className="dog-container-static">
        <img src="/dog-sit.png" alt="앉은 마룽이" className="dog-sit" />
        <div className="bark-bubble bark-result">{message}</div>
      </div>
    );
  }

  return (
    <div
      className={`dog-container ${isFlipped ? 'flipped' : ''}`}
      style={{ animationDuration: `${speed}s` }}
      onClick={handleClick}
    >
      <img
        src="/dog.png"
        alt="걷는 마룽이"
        className={`dog ${clicked ? 'clicked' : ''}`}
      />
      {bark && directionRight && (
        <div className={`bark-bubble ${isFlipped ? 'flipped' : ''}`}>
          <span>멍멍!</span>
        </div>
      )}
      {!bark && directionRight && (
        <div className={`bark-bubble ${isFlipped ? 'flipped' : ''}`}>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

export default Marong;