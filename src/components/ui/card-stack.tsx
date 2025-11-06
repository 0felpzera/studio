
"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";

export type Card = {
  id: number;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
  currentStep,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
  currentStep: MotionValue<number>;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    setCards(items);
  }, [items]);
  
  const step = useMotionValue(0);
  
   useEffect(() => {
    return currentStep.on("change", (latest) => {
        step.set(latest);
    })
  }, [currentStep, step]);


  return (
    <div className="relative h-full w-full">
      {cards.map((card, index) => {
        const canShow = index >= step.get();
        const motionStyle = {
            top: useTransform(step, (val) => (index - val) * -CARD_OFFSET),
            scale: useTransform(step, (val) => 1 - (index - val) * SCALE_FACTOR),
            zIndex: cards.length - (index - step.get()),
            opacity: useTransform(step, (val) => (index >= val ? 1 : 0)),
        };

        return (
          <motion.div
            key={card.id}
            className="absolute dark:bg-black bg-card h-full w-full rounded-3xl p-4 shadow-xl border border-border flex flex-col justify-center"
            style={{
              transformOrigin: "top center",
              ...motionStyle
            }}
          >
            <div className="font-normal text-card-foreground">
              {card.content}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
