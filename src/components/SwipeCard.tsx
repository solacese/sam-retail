import type { ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionStyle,
  type Variants,
} from "motion/react";

const variants: Variants = {
  dismiss: (direction: number) => ({
    x: direction * 620,
    opacity: 0,
    transition: { duration: 0.5, ease: [0.32, 0.02, 0.5, 1] },
  }),
};

export function SwipeCard({
  children,
  reduced,
  agentColor,
  onDragX,
  onChoose,
}: {
  children: ReactNode;
  reduced: boolean;
  agentColor: string;
  onDragX: (offset: number) => void;
  onChoose: (choice: "approve" | "reject") => void;
}) {
  const x = useMotionValue(0);
  // A shared position drives both the lift and tilt, including the exit arc.
  const y = useTransform(x, (value) => (reduced ? 0 : -(value * value) / 2200));
  const rotate = useTransform(x, (value) =>
    reduced ? 0 : Math.max(-42, Math.min(42, value * 0.085)),
  );
  return (
    <motion.div
      className="game-card decision-card"
      initial={reduced ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      variants={variants}
      exit={reduced ? undefined : "dismiss"}
      drag={reduced ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      dragMomentum={false}
      dragTransition={{ bounceStiffness: 420, bounceDamping: 28 }}
      whileDrag={reduced ? undefined : { scale: 1.02 }}
      onDrag={(_, info) => onDragX(info.offset.x)}
      onDragEnd={(_, info) => {
        const distance = info.offset.x;
        const velocity = info.velocity.x;
        if (Math.abs(distance) > 65 || Math.abs(velocity) > 650) {
          const direction = Math.abs(distance) > 65 ? distance : velocity;
          onChoose(direction > 0 ? "approve" : "reject");
        }
        onDragX(0);
      }}
      style={
        {
          x,
          y,
          rotate,
          transformOrigin: "50% 85%",
          touchAction: "pan-y",
          "--agent-color": agentColor,
        } as MotionStyle
      }
    >
      {children}
    </motion.div>
  );
}
