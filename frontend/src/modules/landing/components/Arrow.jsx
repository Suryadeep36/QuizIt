import { ArrowRight } from "lucide-react";
import { motion } from "motion/react"

export default function Arrow() {
  return (
   <motion.div
      animate={{
        x: [0, 6, 0],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <ArrowRight className="w-8 h-8 text-white" />
    </motion.div>
  );
}
