
"use client"
import * as React from "react"
import { motion, PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface Testimonial {
  id: number | string
  name: string
  avatar: string
  description: string
}

interface TestimonialCarouselProps
  extends React.HTMLAttributes<HTMLDivElement> {
  testimonials: Testimonial[]
  showArrows?: boolean
  showDots?: boolean
}

const TestimonialCarousel = React.forwardRef<
  HTMLDivElement,
  TestimonialCarouselProps
>(
  (
    { className, testimonials, showArrows = true, showDots = true, ...props },
    ref,
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [exitX, setExitX] = React.useState<number>(0)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleDragEnd = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      resetInterval();
      if (Math.abs(info.offset.x) > 50) {
        setExitX(info.offset.x < 0 ? -200 : 200);
        setTimeout(() => {
          setCurrentIndex((prev) => (info.offset.x < 0 ? (prev + 1) : (prev - 1 + testimonials.length)) % testimonials.length)
          setExitX(0)
        }, 150)
      }
    }
    
    const nextCard = () => {
      setExitX(-200);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setExitX(0);
      }, 150);
    };

    const prevCard = () => {
      setExitX(200);
       setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setExitX(0);
      }, 150);
    }
    
    const resetInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(nextCard, 4000);
    };

    React.useEffect(() => {
      resetInterval();
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [testimonials.length]);


    return (
      <div
        ref={ref}
        className={cn(
          "h-72 w-full flex items-center justify-center",
          className
        )}
        {...props}
      >
        <div className="relative w-80 h-64">
          {testimonials.map((testimonial, index) => {
            const isCurrentCard = index === currentIndex
            const isPrevCard =
              index === (currentIndex - 1 + testimonials.length) % testimonials.length
            const isNextCard =
              index === (currentIndex + 1) % testimonials.length
            
            const getZIndex = () => {
                if (isCurrentCard) return 3;
                if(isNextCard) return 2;
                if(isPrevCard) return 1;
                return 0;
            }
            
            const getScale = () => {
                if (isCurrentCard) return 1;
                return 0.95;
            }

            const getOpacity = () => {
                if (isCurrentCard) return 1;
                if (isNextCard || isPrevCard) return 0.6;
                return 0;
            }

            const getY = () => {
                if(isCurrentCard) return 0;
                if(isNextCard) return 8;
                if(isPrevCard) return 8;
                return 16;
            }
            
            const getRotate = () => {
                if(isCurrentCard) return exitX / 20;
                if(isNextCard) return 2;
                if(isPrevCard) return -2;
                return 0;
            }

            if (!isCurrentCard && !isPrevCard && !isNextCard) return null

            return (
              <motion.div
                key={testimonial.id}
                className={cn(
                  "absolute w-full h-full rounded-2xl cursor-grab active:cursor-grabbing",
                  "bg-card/10 backdrop-blur-lg border border-white/10 shadow-lg",
                )}
                style={{
                  zIndex: getZIndex(),
                }}
                drag={isCurrentCard ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={isCurrentCard ? handleDragEnd : undefined}
                initial={{
                  scale: 0.95,
                  opacity: 0,
                  y: 16,
                  rotate: -4,
                }}
                animate={{
                  scale: getScale(),
                  opacity: getOpacity(),
                  x: isCurrentCard ? exitX : 0,
                  y: getY(),
                  rotate: getRotate(),
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                {showArrows && isCurrentCard && (
                  <div className="absolute inset-x-0 top-2 flex justify-between px-4">
                    <span onClick={prevCard} className="text-2xl select-none cursor-pointer text-gray-300 hover:text-gray-400 dark:text-muted-foreground dark:hover:text-primary">
                      &larr;
                    </span>
                    <span onClick={nextCard} className="text-2xl select-none cursor-pointer text-gray-300 hover:text-gray-400 dark:text-muted-foreground dark:hover:text-primary">
                      &rarr;
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col items-center text-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">
                        {testimonial.name}
                    </h3>
                    <p className="text-center text-sm text-muted-foreground">
                        {testimonial.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
          {showDots && (
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors cursor-pointer",
                    index === currentIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },
)
TestimonialCarousel.displayName = "TestimonialCarousel"

export { TestimonialCarousel, type Testimonial }

    