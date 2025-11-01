
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
  currentStep: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    setCards(items);
  }, [items]);

  return (
    <div className="relative h-full w-full">
      {cards.map((card, index) => {
        const canShow = index >= currentStep;

        return (
          <motion.div
            key={card.id}
            className="absolute dark:bg-black bg-card h-full w-full rounded-3xl p-4 shadow-xl border border-border flex flex-col justify-between"
            style={{
              transformOrigin: "top center",
            }}
            initial={{
                top: (index - currentStep) * -CARD_OFFSET,
                scale: 1 - (index - currentStep) * SCALE_FACTOR,
                zIndex: cards.length - (index - currentStep),
            }}
            animate={{
              top: (index - currentStep) * -CARD_OFFSET,
              scale: 1 - (index - currentStep) * SCALE_FACTOR,
              zIndex: cards.length - (index - currentStep),
              opacity: canShow ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
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
