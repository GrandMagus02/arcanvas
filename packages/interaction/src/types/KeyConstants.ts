/**
 * Key constants based on keycode-js library.
 *
 * Original source: https://github.com/kabirbaidhya/keycode-js
 * License: MIT
 *
 * MIT License
 *
 * Copyright (c) 2016 Kabir Baidhya
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Represents a normalized keyboard key code.
 * These values correspond to KeyboardEvent.key after normalization,
 * not KeyboardEvent.code (physical key codes).
 *
 * @remarks
 * @deprecated KeyboardEvent.key is layout-dependent and can cause issues.
 * Use KeyboardEvent.keyCode (KeyCodeNumbers.ts) or KeyboardEvent.code (KeyCodes.ts) instead.
 * - Layout-dependent: "a" on QWERTY vs "ф" on Russian layout
 * - For layout-independent bindings, use event.code at a different layer
 *
 * Based on keycode-js library (MIT License)
 * Source: https://github.com/kabirbaidhya/keycode-js
 */
export type KeyCode = string;

/**
 * Keyboard key constants for consistent key identification.
 * These constants correspond to normalized KeyboardEvent.key values.
 *
 * @remarks
 * @deprecated KeyboardEvent.key is layout-dependent and can cause issues.
 * Use KeyboardEvent.keyCode constants (KeyCodeNumbers.ts) or KeyboardEvent.code constants (KeyCodes.ts) instead.
 * - These constants match the normalized key names used by the interaction system
 * - They correspond to KeyboardEvent.key (layout-dependent), not KeyboardEvent.code (physical key codes)
 * - For layout-independent key bindings, use KeyboardEvent.code or CODE_* constants from KeyCodes.ts
 * - The values depend on keyboard layout (e.g., "a" on QWERTY vs "ф" on Russian layout)
 */

// Letter keys
export const A: KeyCode = "a";
export const B: KeyCode = "b";
export const C: KeyCode = "c";
export const D: KeyCode = "d";
export const E: KeyCode = "e";
export const F: KeyCode = "f";
export const G: KeyCode = "g";
export const H: KeyCode = "h";
export const I: KeyCode = "i";
export const J: KeyCode = "j";
export const K: KeyCode = "k";
export const L: KeyCode = "l";
export const M: KeyCode = "m";
export const N: KeyCode = "n";
export const O: KeyCode = "o";
export const P: KeyCode = "p";
export const Q: KeyCode = "q";
export const R: KeyCode = "r";
export const S: KeyCode = "s";
export const T: KeyCode = "t";
export const U: KeyCode = "u";
export const V: KeyCode = "v";
export const W: KeyCode = "w";
export const X: KeyCode = "x";
export const Y: KeyCode = "y";
export const Z: KeyCode = "z";

// Number keys (top row)
export const _0: KeyCode = "0";
export const _1: KeyCode = "1";
export const _2: KeyCode = "2";
export const _3: KeyCode = "3";
export const _4: KeyCode = "4";
export const _5: KeyCode = "5";
export const _6: KeyCode = "6";
export const _7: KeyCode = "7";
export const _8: KeyCode = "8";
export const _9: KeyCode = "9";

// Number pad keys
// NOTE: NUM_* constants share the same string values as top-row digits ("0".."9"),
// because they map to the same KeyboardEvent.key. To distinguish physical
// Numpad keys, use event.code ("Numpad0".."Numpad9") or CODE_NUMPAD0..CODE_NUMPAD9 constants.
export const NUM_0: KeyCode = "0";
export const NUM_1: KeyCode = "1";
export const NUM_2: KeyCode = "2";
export const NUM_3: KeyCode = "3";
export const NUM_4: KeyCode = "4";
export const NUM_5: KeyCode = "5";
export const NUM_6: KeyCode = "6";
export const NUM_7: KeyCode = "7";
export const NUM_8: KeyCode = "8";
export const NUM_9: KeyCode = "9";
export const NUM_MULTIPLY: KeyCode = "*";
export const NUM_ADD: KeyCode = "+";
export const NUM_SUBTRACT: KeyCode = "-";
export const NUM_DECIMAL: KeyCode = ".";
export const NUM_DIVIDE: KeyCode = "/";
export const NUM_ENTER: KeyCode = "Enter";
export const NUM_EQUALS: KeyCode = "=";

// Modifier keys
export const SHIFT: KeyCode = "Shift";
export const CONTROL: KeyCode = "Control";
/** Alias for "Control" for convenience in configs. */
export const CTRL: KeyCode = CONTROL;
export const ALT: KeyCode = "Alt";
export const META: KeyCode = "Meta";
/** Alias for "Meta" (Cmd on macOS). */
export const CMD: KeyCode = META;
/** Alias for "Meta" (Cmd on macOS). */
export const COMMAND: KeyCode = META;

// Function keys
export const F1: KeyCode = "F1";
export const F2: KeyCode = "F2";
export const F3: KeyCode = "F3";
export const F4: KeyCode = "F4";
export const F5: KeyCode = "F5";
export const F6: KeyCode = "F6";
export const F7: KeyCode = "F7";
export const F8: KeyCode = "F8";
export const F9: KeyCode = "F9";
export const F10: KeyCode = "F10";
export const F11: KeyCode = "F11";
export const F12: KeyCode = "F12";

// Arrow keys
export const ARROW_UP: KeyCode = "ArrowUp";
export const ARROW_DOWN: KeyCode = "ArrowDown";
export const ARROW_LEFT: KeyCode = "ArrowLeft";
export const ARROW_RIGHT: KeyCode = "ArrowRight";

// Navigation keys
export const HOME: KeyCode = "Home";
export const END: KeyCode = "End";
export const PAGE_UP: KeyCode = "PageUp";
export const PAGE_DOWN: KeyCode = "PageDown";
export const INSERT: KeyCode = "Insert";
export const DELETE: KeyCode = "Delete";

// Editing keys
export const BACKSPACE: KeyCode = "Backspace";
export const ENTER: KeyCode = "Enter";
export const TAB: KeyCode = "Tab";
export const SPACE: KeyCode = "Space";
export const ESCAPE: KeyCode = "Escape";
export const CAPS_LOCK: KeyCode = "CapsLock";

// Punctuation and symbols
export const SEMICOLON: KeyCode = ";";
export const EQUALS: KeyCode = "=";
export const COMMA: KeyCode = ",";
export const MINUS: KeyCode = "-";
export const PERIOD: KeyCode = ".";
export const SLASH: KeyCode = "/";
export const BACKTICK: KeyCode = "`";
export const LEFT_BRACKET: KeyCode = "[";
export const BACKSLASH: KeyCode = "\\";
export const RIGHT_BRACKET: KeyCode = "]";
export const QUOTE: KeyCode = "'";
export const LEFT_BRACE: KeyCode = "{";
export const RIGHT_BRACE: KeyCode = "}";
export const PIPE: KeyCode = "|";
export const PLUS: KeyCode = "+";
export const ASTERISK: KeyCode = "*";
export const LESS_THAN: KeyCode = "<";
export const GREATER_THAN: KeyCode = ">";
export const QUESTION_MARK: KeyCode = "?";
export const COLON: KeyCode = ":";
export const AT: KeyCode = "@";
export const HASH: KeyCode = "#";
export const DOLLAR: KeyCode = "$";
export const PERCENT: KeyCode = "%";
export const CARET: KeyCode = "^";
export const AMPERSAND: KeyCode = "&";
export const UNDERSCORE: KeyCode = "_";
export const TILDE: KeyCode = "~";

// Media and system keys
export const VOLUME_UP: KeyCode = "VolumeUp";
export const VOLUME_DOWN: KeyCode = "VolumeDown";
export const VOLUME_MUTE: KeyCode = "VolumeMute";
export const MEDIA_PLAY_PAUSE: KeyCode = "MediaPlayPause";
export const MEDIA_STOP: KeyCode = "MediaStop";
export const MEDIA_NEXT_TRACK: KeyCode = "MediaNextTrack";
export const MEDIA_PREV_TRACK: KeyCode = "MediaPreviousTrack";

// Browser keys
export const BROWSER_BACK: KeyCode = "BrowserBack";
export const BROWSER_FORWARD: KeyCode = "BrowserForward";
export const BROWSER_REFRESH: KeyCode = "BrowserRefresh";
export const BROWSER_STOP: KeyCode = "BrowserStop";
export const BROWSER_SEARCH: KeyCode = "BrowserSearch";
export const BROWSER_FAVORITES: KeyCode = "BrowserFavorites";
export const BROWSER_HOME: KeyCode = "BrowserHome";

// Context menu key
export const CONTEXT_MENU: KeyCode = "ContextMenu";

// Print screen and scroll lock
export const PRINT_SCREEN: KeyCode = "PrintScreen";
export const SCROLL_LOCK: KeyCode = "ScrollLock";
export const PAUSE: KeyCode = "Pause";

// Lock keys
export const NUM_LOCK: KeyCode = "NumLock";
