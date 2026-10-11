"use client";

import { MotionConfig, motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.2, 0.7, 0.2, 1] as const;

/** Honours prefers-reduced-motion for every motion component below it. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

type Tag = "div" | "section" | "li" | "article" | "p" | "h2" | "ul" | "ol" | "dl";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  as?: Tag;
  delay?: number;
  y?: number;
}

/** Fade + rise when scrolled into view (once). */
export function Reveal({ as = "div", delay = 0, y = 24, children, ...rest }: RevealProps) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, ease, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** Container that staggers `StaggerItem` children as it enters the viewport. */
export function Stagger({
  as = "div",
  gap = 0.08,
  children,
  ...rest
}: RevealProps & { gap?: number }) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  as = "div",
  y = 24,
  children,
  ...rest
}: RevealProps) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** Headline revealed word by word. Plain text is kept for assistive tech and SEO. */
export function WordReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.75, ease, delay: delay + i * 0.06 }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
