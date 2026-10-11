import type fr from "./fr";

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { -readonly [K in keyof T]: Widen<T[K]> };

/** French is the source of truth; English must match its shape. */
export type Dictionary = Widen<typeof fr>;
