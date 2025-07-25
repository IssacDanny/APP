// src/runtime/effectLibrary.js

/**
 * A library of reusable animation presets for Framer Motion.
 */
export const effectLibrary = {
  // --- Page/Container Effects ---
  fadeInUp: {
    initial: { opacity: 0, y: 30 }, // Start a bit lower
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },  // Exit by sliding up and fading out
    transition: { 
      duration: 0.5, // A slightly longer, more graceful duration
      ease: [0.4, 0, 0.2, 1], // A custom cubic bezier for a premium feel
    },
  },
  
  // A fade-in-and-slide-up effect
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeInOut' },
  },

  // Our "mind-blowing" cascade effect for lists
  cascadeIn: {
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.07, // The magic delay
        },
      },
    },
    initial: 'hidden',
    animate: 'visible',
  },

  // --- NEW: Modal Effects ---
  modalBackdrop: {
    variants: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    initial: 'hidden',
    animate: 'visible',
    exit: 'hidden',
  },
  modalContent: {
    variants: {
      hidden: { scale: 0.95, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
      exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } },
    },
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
  },

  /// --- REVISED: Polished Button Hover/Press Effect ---
  buttonPress: {
    whileHover: { 
      y: -4,         // A more noticeable lift
      scale: 1.03,   // Make it pop towards the user
      boxShadow: "0 10px 20px -5px rgb(0 0 0 / 0.15)", // A softer, more prominent shadow
    },
    whileTap: { 
      scale: 0.97,   // A slightly more subtle press
      y: -2,
    },
    // The key change: switch from 'spring' to a fast 'tween'
    transition: { 
      duration: 0.15, 
      ease: "easeOut" 
    },
  },

  // --- NEW: The "After" Effect ---
  clickJiggle: {
    variants: {
      // The state the button is in normally
      rest: {
        rotate: 0,
      },
      // The state we will animate TO
      jiggle: {
        rotate: [0, -5, 5, -5, 5, 0], // A keyframe animation for the jiggle
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    initial: "rest", // Start in the 'rest' state
  },

  // --- NEW: Mind-Blowing 3D Tilt Effect ---
  interactiveTilt: {
    whileHover: {
      scale: 1.05, // Make the card slightly larger
      // The magic happens here: rotate based on hover
      rotateX: 10, // Tilts back
      rotateY: 0,  // No side-to-side tilt by default
      boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", // A deeper shadow
    },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },

  // --- NEW: Form Field Validation Effect ---
  fieldErrorShake: {
    variants: {
      // The default, resting state
      rest: { x: 0 },
      // The state we animate to when an error occurs
      shake: {
        x: [0, -8, 8, -8, 8, 0], // Keyframe animation for a horizontal shake
        transition: { duration: 0.4, ease: "easeInOut" },
      },
    },
    initial: "rest",
  },

  // --- NEW: Smooth Dropdown for Navigation Folders ---
  smoothDropdown: {
    variants: {
      hidden: {
        opacity: 0,
        height: 0,
        transition: {
          when: "afterChildren", // Animate out after children have animated out
          staggerChildren: 0.05,
          staggerDirection: -1,
        }
      },
      visible: {
        opacity: 1,
        height: "auto", // Automatically adjust to the height of the content
        transition: {
          when: "beforeChildren", // Animate in before children start animating
          staggerChildren: 0.07,
        }
      },
    },
    initial: "hidden",
    animate: "visible",
    exit: "hidden",
  },
};