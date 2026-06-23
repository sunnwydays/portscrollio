"use client";

import { createContext } from "react";

/**
 * The graph's firing state. `current` is the node the signal sits on (a hovered
 * tile, or the head of an autoplay cascade). `prev` is the node it just came
 * from, so the edge back to it can stay dim instead of sweeping the signal
 * straight back one layer.
 *
 * Edges read this to decide whether to fire (an endpoint is `current` and the
 * other endpoint is not `prev`), dim (another node is firing), or rest.
 */
export interface GraphHoverState {
  current: string | null;
  prev: string | null;
}

export const GraphHoverContext = createContext<GraphHoverState>({
  current: null,
  prev: null,
});
