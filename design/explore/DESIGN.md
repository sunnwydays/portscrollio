# Design System Specification

## 1. Overview & Creative North Star: "Luminous Logic"

This design system moves away from the cliché "hacker" aesthetic of software engineering—harsh terminal fonts and high-contrast neon—and moves toward an editorial, high-end digital product experience. The Creative North Star is **"Luminous Logic."**

We treat code and engineering as an art form. The layout should feel like a premium gallery: spacious, intentional, and structured. We break the traditional "boxed" grid by utilizing **intentional asymmetry**—offsetting large display typography against centered content or letting imagery bleed off-canvas. This creates a rhythmic, non-linear flow that signals a sophisticated architectural mind.

---

## 2. Colors & Surface Philosophy

The palette is anchored in deep midnight tones (`#0b1326`), utilizing the emerald and blue accents as "light sources" within a dark environment.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections. Boundaries must be established through background color shifts or tonal transitions. To separate a "Hero" from a "Features" section, transition from `surface` (`#0b1326`) to `surface_container_low` (`#131b2e`).

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials.
*   **Base:** `surface` (`#0b1326`) is your canvas.
*   **Recessed Elements:** Use `surface_container_lowest` (`#060e20`) for secondary input areas or code blocks to create a "carved out" feel.
*   **Elevated Elements:** Use `surface_container_high` (`#222a3d`) or `highest` (`#2d3449`) for cards and floating menus to bring them closer to the user.

### The "Glass & Gradient" Rule
To inject "soul" into the technical layout:
*   **Glassmorphism:** For navigation bars or floating action buttons, use semi-transparent `surface_variant` (`#2d3449` at 60% opacity) with a `backdrop-blur` of 20px.
*   **Signature Gradients:** Main CTAs should not be flat. Use a subtle linear gradient from `primary` (`#4edea3`) to `primary_container` (`#10b981`) at a 135-degree angle.

---

## 3. Typography: Editorial Authority

We use a dual-sans-serif approach to balance personality with utility.

*   **Display & Headlines (Manrope):** This is our "Editorial" voice. Manrope’s wider stance and geometric curves feel modern and high-tech. Use `display-lg` (3.5rem) for hero statements with tight letter-spacing (-0.02em) to create a high-impact, "locked-in" look.
*   **Body & Labels (Inter):** Inter is the workhorse. It provides maximum legibility for technical descriptions. Use `body-md` (0.875rem) for long-form text to maintain a sophisticated, slightly smaller-than-average "pro" feel.

**Hierarchy Note:** Always pair a `display-sm` headline with a `label-md` uppercase sub-header using the `secondary` (`#adc6ff`) color to create a clear, technical hierarchy.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "standard." We achieve depth through light and material.

*   **The Layering Principle:** Instead of a shadow, place a `surface_container_low` card on top of a `surface_dim` background. The subtle 2-3% shift in lightness is enough to define the edge for a premium audience.
*   **Ambient Shadows:** If a floating element (like a modal) requires a shadow, use a large blur (30px-40px) at 10% opacity using the `surface_container_lowest` color. This mimics a soft, natural occlusion rather than a "pasted on" shadow.
*   **The "Ghost Border":** For accessibility in high-density areas, use a "Ghost Border"—the `outline_variant` (`#3c4a42`) at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Background gradient (`primary` to `primary_container`), `on_primary` text. Shape: `md` (0.75rem). 
*   **Secondary:** Ghost style. No background, `outline` border at 20% opacity, `primary` text.
*   **Interaction:** On hover, the `primary_fixed` (`#6ffbbe`) should create a subtle outer glow (0px 0px 15px).

### Chips
*   Used for tech stacks (e.g., "React", "Rust"). Use `surface_container_high` backgrounds with `secondary` text. Shape: `full` (9999px) to contrast with the `md` roundness of the cards.

### Input Fields
*   Background: `surface_container_lowest`. 
*   Border: None, except for a 2px bottom-accent of `outline_variant` that transforms into `primary` on focus.
*   Shape: `sm` (0.25rem) on the top corners to keep it feeling precise.

### Cards & Projects
*   **Forbid Dividers.** Use Spacing `12` (3rem) to separate project entries. 
*   Use a `surface_container_low` background for the card body. On hover, transition the background to `surface_container_high` and slightly scale the image (1.02x) for a high-end "lift."

### Engineering Accents (The "Modern" Touch)
*   **Progress Indicators:** Use the `secondary` (`#adc6ff`) color for slim (2px) loading bars or scroll-progress indicators at the very top of the viewport.
*   **Code Snippets:** Use `surface_container_lowest` with `primary` text. Avoid the "matrix" green; keep it emerald and clean.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. For example, a 66% width column for text offset to the right, leaving a "power" void on the left for `display` typography.
*   **Do** use `secondary_container` (`#0566d9`) for very subtle background "glows" (large, 400px diameter blurred circles at 5% opacity) to break up large dark sections.
*   **Do** prioritize vertical rhythm using the Spacing Scale `8` (2rem) and `16` (4rem).

### Don’t
*   **Don’t** use 100% white text. Use `on_surface` (`#dae2fd`) to reduce eye strain and keep the "midnight" vibe.
*   **Don’t** use standard 0.5rem "card shadows." If the tonal shift isn't working, increase the background contrast between `surface` and `surface_container`.
*   **Don’t** use monospace for anything other than actual code. Your "identity" is built on the Manrope/Inter pairing.