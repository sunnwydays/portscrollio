"use client";

import { createContext } from "react";

/**
 * The slug of the node currently hovered on the explore graph, or null.
 * Edges read this to decide whether to fire (this edge's source is hovered),
 * dim (another node is hovered), or rest (nothing hovered).
 */
export const GraphHoverContext = createContext<string | null>(null);
