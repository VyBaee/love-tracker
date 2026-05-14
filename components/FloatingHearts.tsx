'use client';

import { useEffect, useState } from 'react';

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<{ id: number, left: number, delay: number, duration: number, size: number }[]>([]);

  useEffect(() => {
    // Random ra 15 trái tim với thông số khác nhau
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Vị trí ngang (0 - 100vw)
      delay: Math.random() * 5, // Độ trễ lúc bắt đầu rơi (0 - 5s)
      duration: 5 + Math.random() * 10, // Thời gian rơi (5 - 15s)
      size: 10 + Math.random() * 15, // Kích thước (10px - 25px)
    }));
    setHearts(newHearts);
  }, []);

  return (
    // z-0 để tim rơi ở phía sau các hộp thoại, không che mất nội dung
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute text-theme-400 opacity-40 animate-fall drop-shadow-sm"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            fontSize: `${heart.size}px`,
          }}
        >
          ❤
        </div>
      ))}
    </div>
  );
}