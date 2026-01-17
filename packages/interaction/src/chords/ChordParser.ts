import {
  _0,
  _1,
  _2,
  _3,
  _4,
  _5,
  _6,
  _7,
  _8,
  _9,
  A,
  AMPERSAND,
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  ASTERISK,
  AT,
  B,
  BACKSLASH,
  BACKSPACE,
  BACKTICK,
  C,
  CAPS_LOCK,
  CARET,
  COLON,
  COMMA,
  D,
  DELETE,
  DOLLAR,
  E,
  END,
  ENTER,
  EQUALS,
  ESCAPE,
  F,
  F1,
  F10,
  F11,
  F12,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  G,
  GREATER_THAN,
  H,
  HASH,
  HOME,
  I,
  INSERT,
  J,
  K,
  L,
  LEFT_BRACE,
  LEFT_BRACKET,
  LESS_THAN,
  M,
  MINUS,
  N,
  O,
  P,
  PAGE_DOWN,
  PAGE_UP,
  PERCENT,
  PERIOD,
  PIPE,
  PLUS,
  Q,
  QUESTION_MARK,
  QUOTE,
  R,
  RIGHT_BRACE,
  RIGHT_BRACKET,
  S,
  SEMICOLON,
  SLASH,
  SPACE,
  T,
  TAB,
  TILDE,
  U,
  UNDERSCORE,
  V,
  W,
  X,
  Y,
  Z,
} from "../types/KeyConstants";
import { ModifierKey } from "../types/ModifierKey";
import { MouseButton } from "../types/MouseButton";
import { Chord } from "./Chord";

/**
 * Map from key strings (including variations and symbols) to normalized key constants.
 */

const keyNormalizationMap: Record<string, string> = {
  // Letters (case-insensitive)
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H,
  i: I,
  j: J,
  k: K,
  l: L,
  m: M,
  n: N,
  o: O,
  p: P,
  q: Q,
  r: R,
  s: S,
  t: T,
  u: U,
  v: V,
  w: W,
  x: X,
  y: Y,
  z: Z,
  // Numbers
  "0": _0,
  "1": _1,
  "2": _2,
  "3": _3,
  "4": _4,
  "5": _5,
  "6": _6,
  "7": _7,
  "8": _8,
  "9": _9,
  // Function keys
  f1: F1,
  f2: F2,
  f3: F3,
  f4: F4,
  f5: F5,
  f6: F6,
  f7: F7,
  f8: F8,
  f9: F9,
  f10: F10,
  f11: F11,
  f12: F12,
  // Arrow keys
  arrowup: ARROW_UP,
  arrowdown: ARROW_DOWN,
  arrowleft: ARROW_LEFT,
  arrowright: ARROW_RIGHT,
  up: ARROW_UP,
  down: ARROW_DOWN,
  left: ARROW_LEFT,
  right: ARROW_RIGHT,
  // Navigation
  home: HOME,
  end: END,
  pageup: PAGE_UP,
  pagedown: PAGE_DOWN,
  insert: INSERT,
  delete: DELETE,
  del: DELETE,
  // Editing
  backspace: BACKSPACE,
  enter: ENTER,
  return: ENTER,
  tab: TAB,
  space: SPACE,
  " ": SPACE,
  escape: ESCAPE,
  esc: ESCAPE,
  capslock: CAPS_LOCK,
  // Punctuation and symbols
  ";": SEMICOLON,
  "=": EQUALS,
  ",": COMMA,
  "-": MINUS,
  ".": PERIOD,
  "/": SLASH,
  "`": BACKTICK,
  "[": LEFT_BRACKET,
  "\\": BACKSLASH,
  "]": RIGHT_BRACKET,
  "'": QUOTE,
  "{": LEFT_BRACE,
  "}": RIGHT_BRACE,
  "|": PIPE,
  "+": PLUS,
  "*": ASTERISK,
  "<": LESS_THAN,
  ">": GREATER_THAN,
  "?": QUESTION_MARK,
  ":": COLON,
  "@": AT,
  "#": HASH,
  $: DOLLAR,
  "%": PERCENT,
  "^": CARET,
  "&": AMPERSAND,
  _: UNDERSCORE,
  "~": TILDE,
};

/**
 * Unescapes a string, handling backslash escape sequences.
 * Examples: "\\+" -> "+", "\\(" -> "(", "\\\\" -> "\\"
 */
function unescapeString(str: string): string {
  let result = "";
  let i = 0;
  while (i < str.length) {
    if (str[i] === "\\" && i + 1 < str.length) {
      // Escape sequence
      result += str[i + 1];
      i += 2;
    } else {
      result += str[i];
      i += 1;
    }
  }
  return result;
}

/**
 * Splits a string by a delimiter, respecting escape sequences and parentheses.
 * Returns an array of tokens.
 */
function smartSplit(str: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;
  let i = 0;

  while (i < str.length) {
    if (str[i] === "\\" && i + 1 < str.length) {
      // Escape sequence - add both characters
      const nextChar = str[i + 1];
      if (nextChar !== undefined) {
        current += str[i] + nextChar;
      }
      i += 2;
    } else if (str[i] === "(") {
      current += str[i];
      depth++;
      i++;
    } else if (str[i] === ")") {
      current += str[i];
      depth--;
      i++;
    } else if (str[i] === delimiter && depth === 0) {
      // Found delimiter at top level
      if (current.trim().length > 0) {
        result.push(current.trim());
      }
      current = "";
      i++;
    } else {
      current += str[i];
      i++;
    }
  }

  if (current.trim().length > 0) {
    result.push(current.trim());
  }

  return result;
}

/**
 * Parses a string representation of a chord into a Chord object.
 * Supports formats like "Ctrl+Shift+H" or "Ctrl+LeftClick" or "⌘+S".
 * Also supports escaped characters like "Ctrl+\\+" for Ctrl+Plus key.
 */
export function parseChord(chordString: string): Chord {
  // First, unescape the string to handle escape sequences
  const unescaped = unescapeString(chordString);

  const parts = smartSplit(unescaped, "+")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const modifiers: ModifierKey[] = [];
  const keys: string[] = [];
  let mouseButton: MouseButton | undefined;

  const modifierMap: Record<string, ModifierKey> = {
    ctrl: ModifierKey.Ctrl,
    control: ModifierKey.Ctrl,
    shift: ModifierKey.Shift,
    alt: ModifierKey.Alt,
    meta: ModifierKey.Meta,
    cmd: ModifierKey.Cmd,
    command: ModifierKey.Cmd,
    "⌘": ModifierKey.Cmd, // macOS command symbol
  };

  const mouseButtonMap: Record<string, MouseButton> = {
    leftclick: MouseButton.Left,
    left: MouseButton.Left,
    rightclick: MouseButton.Right,
    right: MouseButton.Right,
    middleclick: MouseButton.Middle,
    middle: MouseButton.Middle,
    backclick: MouseButton.Back,
    back: MouseButton.Back,
    forwardclick: MouseButton.Forward,
    forward: MouseButton.Forward,
  };

  for (const part of parts) {
    const lower = part.toLowerCase();

    // Check if it's a modifier (including ⌘ symbol)
    const modifier = modifierMap[part] || modifierMap[lower];
    if (modifier) {
      modifiers.push(modifier);
      continue;
    }

    // Check if it's a mouse button
    if (mouseButtonMap[lower]) {
      mouseButton = mouseButtonMap[lower];
      continue;
    }

    // Normalize the key using the key constants map
    const normalizedKey = keyNormalizationMap[lower] || keyNormalizationMap[part] || part;
    keys.push(normalizedKey);
  }

  return new Chord(modifiers, keys.length > 0 ? keys : undefined, mouseButton);
}

/**
 * Parses a mouse chord string (e.g., "Ctrl+LeftClick").
 */
export function parseMouseChord(chordString: string): Chord {
  return parseChord(chordString);
}

/**
 * Parses a key sequence string (e.g., "A + S + D") into an array of single-key chords.
 * Key sequences require keys to be pressed in order, one at a time.
 * Supports escaped characters like "\\+" for the plus key.
 */
export function parseKeySequence(sequenceString: string): Chord[] {
  const unescaped = unescapeString(sequenceString);
  const parts = smartSplit(unescaped, "+")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return parts.map((key) => {
    const lower = key.toLowerCase();
    // Normalize the key using the key constants map
    const normalizedKey = keyNormalizationMap[lower] || keyNormalizationMap[key] || key;
    return new Chord([], [normalizedKey], undefined);
  });
}

/**
 * Parses a chord expression that may contain OR operators (|) and parentheses.
 * Examples:
 * - "shift | ctrl + a" -> returns [Chord(shift), Chord(ctrl+a)]
 * - "(shift + a) | (ctrl + a)" -> returns [Chord(shift+a), Chord(ctrl+a)]
 * - "ctrl + \\+" -> returns [Chord(ctrl+plus)]
 *
 * Returns an array of Chord alternatives. If no OR operator is present, returns a single-element array.
 */
export function parseChordExpression(expression: string): Chord[] {
  const trimmed = expression.trim();

  // Handle empty string
  if (trimmed.length === 0) {
    return [];
  }

  // Split by OR operator (|), respecting parentheses and escape sequences
  const alternatives = smartSplit(trimmed, "|");

  if (alternatives.length === 1) {
    // No OR operator - might have parentheses to remove
    const firstAlt = alternatives[0];
    if (!firstAlt) {
      return [];
    }
    let chordStr = firstAlt.trim();

    // Remove outer parentheses if present
    if (chordStr.startsWith("(") && chordStr.endsWith(")")) {
      // Check if it's a complete parenthesized expression
      let depth = 0;
      let isComplete = true;
      for (let i = 0; i < chordStr.length; i++) {
        if (chordStr[i] === "\\" && i + 1 < chordStr.length) {
          i++; // Skip escaped character
          continue;
        }
        if (chordStr[i] === "(") {
          depth++;
          if (i === 0) continue; // Skip first opening paren
        } else if (chordStr[i] === ")") {
          depth--;
          if (i === chordStr.length - 1 && depth === 0) continue; // Skip last closing paren
        }
        if (depth < 0 || (i > 0 && i < chordStr.length - 1 && depth === 0)) {
          isComplete = false;
          break;
        }
      }

      if (isComplete && depth === 0) {
        chordStr = chordStr.slice(1, -1).trim();
      }
    }

    return [parseChord(chordStr)];
  }

  // Multiple alternatives - parse each one
  return alternatives.map((alt) => {
    let altStr = alt.trim();

    // Remove outer parentheses if present
    if (altStr.startsWith("(") && altStr.endsWith(")")) {
      let depth = 0;
      let isComplete = true;
      for (let i = 0; i < altStr.length; i++) {
        if (altStr[i] === "\\" && i + 1 < altStr.length) {
          i++;
          continue;
        }
        if (altStr[i] === "(") {
          depth++;
          if (i === 0) continue;
        } else if (altStr[i] === ")") {
          depth--;
          if (i === altStr.length - 1 && depth === 0) continue;
        }
        if (depth < 0 || (i > 0 && i < altStr.length - 1 && depth === 0)) {
          isComplete = false;
          break;
        }
      }

      if (isComplete && depth === 0) {
        altStr = altStr.slice(1, -1).trim();
      }
    }

    return parseChord(altStr);
  });
}
