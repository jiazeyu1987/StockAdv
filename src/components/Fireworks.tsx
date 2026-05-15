import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  particles: Particle[];
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Fireworks: React.FC<{ show: boolean; onComplete?: () => void }> = ({ show, onComplete }) => {
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  useEffect(() => {
    if (!show) return;

    const createFirework = (id: number): Firework => {
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 60 + 10;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particles: Particle[] = [];
      const particleCount = 20 + Math.floor(Math.random() * 20);

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          id: i,
          angle: (360 / particleCount) * i + Math.random() * 20,
          distance: 50 + Math.random() * 100,
          size: 3 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      return { id, x, y, color, particles };
    };

    const newFireworks: Firework[] = [];
    for (let i = 0; i < 8; i++) {
      newFireworks.push(createFirework(i));
    }
    setFireworks(newFireworks);

    const timer = setTimeout(() => {
      setFireworks([]);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show || fireworks.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {fireworks.map((firework, index) => (
          <motion.div
            key={firework.id}
            className="absolute"
            style={{ left: `${firework.x}%`, top: `${firework.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: index * 0.15, duration: 0.3 }}
          >
            {firework.particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
                  y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
                  opacity: 0,
                  scale: 0.3,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.h2
          className="text-5xl font-bold text-white"
          style={{
            textShadow: '0 0 30px #3b82f6, 0 0 60px #10b981, 0 0 90px #f59e0b',
          }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          欢迎回来！
        </motion.h2>
      </motion.div>
    </div>
  );
};

export default Fireworks;
