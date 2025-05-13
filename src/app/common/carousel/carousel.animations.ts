import {
    style,
    animate,
    animation,
    keyframes
  } from "@angular/animations";
  
  
  // =========================
  // Fade
  // =========================
  export const fadeIn = animation([
    style({ opacity: 0 }), // start state
    animate('{{time}}', style({ opacity: 1 }))
  ]);
  
  export const fadeOut = animation([
    animate('{{time}}', style({ opacity: 0 }))
  ]);

  // =========================
// Scale
// =========================
export const scaleIn = animation([
    style({ opacity: 0, transform: "scale(0.5)" }), // start state
    animate(
      "{{time}}",
      style({ opacity: 1, transform: "scale(1)" })
    )
  ]);
  
  export const scaleOut = animation([
    animate(
      "{{time}}",
      style({ opacity: 0, transform: "scale(0.5)" })
    )
  ]);