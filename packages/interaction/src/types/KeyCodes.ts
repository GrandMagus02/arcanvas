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
 * Represents a physical keyboard key code.
 * These values correspond to KeyboardEvent.code (layout-independent).
 *
 * @remarks
 * Physical key codes are layout-independent. "KeyA" always refers to
 * the physical A key, regardless of keyboard layout.
 *
 * Based on keycode-js library (MIT License)
 * Source: https://github.com/kabirbaidhya/keycode-js
 */
export type KeyCodeType = string;

/**
 * Physical key code constants.
 * These correspond to KeyboardEvent.code values (layout-independent).
 *
 * @remarks
 * Based on keycode-js library (MIT License)
 * Source: https://github.com/kabirbaidhya/keycode-js
 */

// Special keys
export const CODE_UNIDENTIFIED: KeyCodeType = "Unidentified";
export const CODE_ESCAPE: KeyCodeType = "Escape";
export const CODE_BACK_SPACE: KeyCodeType = "Backspace";
export const CODE_TAB: KeyCodeType = "Tab";
export const CODE_ENTER: KeyCodeType = "Enter";
export const CODE_RETURN: KeyCodeType = "Enter";
export const CODE_PAUSE: KeyCodeType = "Pause";
export const CODE_CAPS_LOCK: KeyCodeType = "CapsLock";
export const CODE_SPACE: KeyCodeType = "Space";

// Modifier keys
export const CODE_SHIFT_LEFT: KeyCodeType = "ShiftLeft";
export const CODE_SHIFT_RIGHT: KeyCodeType = "ShiftRight";
export const CODE_CONTROL_LEFT: KeyCodeType = "ControlLeft";
export const CODE_CONTROL_RIGHT: KeyCodeType = "ControlRight";
export const CODE_ALT_LEFT: KeyCodeType = "AltLeft";
export const CODE_ALT_RIGHT: KeyCodeType = "AltRight";
export const CODE_META_LEFT: KeyCodeType = "MetaLeft";
export const CODE_OS_LEFT: KeyCodeType = "OSLeft";
export const CODE_META_RIGHT: KeyCodeType = "MetaRight";
export const CODE_OS_RIGHT: KeyCodeType = "OSRight";

// Navigation keys
export const CODE_PAGE_UP: KeyCodeType = "PageUp";
export const CODE_PAGE_DOWN: KeyCodeType = "PageDown";
export const CODE_END: KeyCodeType = "End";
export const CODE_HOME: KeyCodeType = "Home";
export const CODE_LEFT: KeyCodeType = "ArrowLeft";
export const CODE_UP: KeyCodeType = "ArrowUp";
export const CODE_RIGHT: KeyCodeType = "ArrowRight";
export const CODE_DOWN: KeyCodeType = "ArrowDown";
export const CODE_PRINTSCREEN: KeyCodeType = "PrintScreen";
export const CODE_INSERT: KeyCodeType = "Insert";
export const CODE_DELETE: KeyCodeType = "Delete";

// Number keys (top row)
export const CODE_0: KeyCodeType = "Digit0";
export const CODE_1: KeyCodeType = "Digit1";
export const CODE_2: KeyCodeType = "Digit2";
export const CODE_3: KeyCodeType = "Digit3";
export const CODE_4: KeyCodeType = "Digit4";
export const CODE_5: KeyCodeType = "Digit5";
export const CODE_6: KeyCodeType = "Digit6";
export const CODE_7: KeyCodeType = "Digit7";
export const CODE_8: KeyCodeType = "Digit8";
export const CODE_9: KeyCodeType = "Digit9";

// Letter keys
export const CODE_A: KeyCodeType = "KeyA";
export const CODE_B: KeyCodeType = "KeyB";
export const CODE_C: KeyCodeType = "KeyC";
export const CODE_D: KeyCodeType = "KeyD";
export const CODE_E: KeyCodeType = "KeyE";
export const CODE_F: KeyCodeType = "KeyF";
export const CODE_G: KeyCodeType = "KeyG";
export const CODE_H: KeyCodeType = "KeyH";
export const CODE_I: KeyCodeType = "KeyI";
export const CODE_J: KeyCodeType = "KeyJ";
export const CODE_K: KeyCodeType = "KeyK";
export const CODE_L: KeyCodeType = "KeyL";
export const CODE_M: KeyCodeType = "KeyM";
export const CODE_N: KeyCodeType = "KeyN";
export const CODE_O: KeyCodeType = "KeyO";
export const CODE_P: KeyCodeType = "KeyP";
export const CODE_Q: KeyCodeType = "KeyQ";
export const CODE_R: KeyCodeType = "KeyR";
export const CODE_S: KeyCodeType = "KeyS";
export const CODE_T: KeyCodeType = "KeyT";
export const CODE_U: KeyCodeType = "KeyU";
export const CODE_V: KeyCodeType = "KeyV";
export const CODE_W: KeyCodeType = "KeyW";
export const CODE_X: KeyCodeType = "KeyX";
export const CODE_Y: KeyCodeType = "KeyY";
export const CODE_Z: KeyCodeType = "KeyZ";

// Context menu
export const CODE_CONTEXT_MENU: KeyCodeType = "ContextMenu";

// Numpad keys
export const CODE_NUMPAD0: KeyCodeType = "Numpad0";
export const CODE_NUMPAD1: KeyCodeType = "Numpad1";
export const CODE_NUMPAD2: KeyCodeType = "Numpad2";
export const CODE_NUMPAD3: KeyCodeType = "Numpad3";
export const CODE_NUMPAD4: KeyCodeType = "Numpad4";
export const CODE_NUMPAD5: KeyCodeType = "Numpad5";
export const CODE_NUMPAD6: KeyCodeType = "Numpad6";
export const CODE_NUMPAD7: KeyCodeType = "Numpad7";
export const CODE_NUMPAD8: KeyCodeType = "Numpad8";
export const CODE_NUMPAD9: KeyCodeType = "Numpad9";
export const CODE_NUMPAD_MULTIPLY: KeyCodeType = "NumpadMultiply";
export const CODE_NUMPAD_ADD: KeyCodeType = "NumpadAdd";
export const CODE_NUMPAD_SUBTRACT: KeyCodeType = "NumpadSubtract";
export const CODE_NUMPAD_DECIMAL: KeyCodeType = "NumpadDecimal";
export const CODE_NUMPAD_DIVIDE: KeyCodeType = "NumpadDivide";
export const CODE_NUMPAD_ENTER: KeyCodeType = "NumpadEnter";

// Function keys
export const CODE_F1: KeyCodeType = "F1";
export const CODE_F2: KeyCodeType = "F2";
export const CODE_F3: KeyCodeType = "F3";
export const CODE_F4: KeyCodeType = "F4";
export const CODE_F5: KeyCodeType = "F5";
export const CODE_F6: KeyCodeType = "F6";
export const CODE_F7: KeyCodeType = "F7";
export const CODE_F8: KeyCodeType = "F8";
export const CODE_F9: KeyCodeType = "F9";
export const CODE_F10: KeyCodeType = "F10";
export const CODE_F11: KeyCodeType = "F11";
export const CODE_F12: KeyCodeType = "F12";
export const CODE_F13: KeyCodeType = "F13";
export const CODE_F14: KeyCodeType = "F14";
export const CODE_F15: KeyCodeType = "F15";
export const CODE_F16: KeyCodeType = "F16";
export const CODE_F17: KeyCodeType = "F17";
export const CODE_F18: KeyCodeType = "F18";
export const CODE_F19: KeyCodeType = "F19";
export const CODE_F20: KeyCodeType = "F20";
export const CODE_F21: KeyCodeType = "F21";
export const CODE_F22: KeyCodeType = "F22";
export const CODE_F23: KeyCodeType = "F23";
export const CODE_F24: KeyCodeType = "F24";

// Lock keys
export const CODE_NUM_LOCK: KeyCodeType = "NumLock";
export const CODE_SCROLL_LOCK: KeyCodeType = "ScrollLock";

// Punctuation and symbols
export const CODE_MINUS: KeyCodeType = "Minus";
export const CODE_DASH: KeyCodeType = "Minus";
export const CODE_EQUALS: KeyCodeType = "Equal";
export const CODE_SEMICOLON: KeyCodeType = "Semicolon";
export const CODE_COMMA: KeyCodeType = "Comma";
export const CODE_PERIOD: KeyCodeType = "Period";
export const CODE_SLASH: KeyCodeType = "Slash";
export const CODE_BACK_QUOTE: KeyCodeType = "Backquote";
export const CODE_OPEN_BRACKET: KeyCodeType = "BracketLeft";
export const CODE_BACK_SLASH: KeyCodeType = "Backslash";
export const CODE_CLOSE_BRACKET: KeyCodeType = "BracketRight";
export const CODE_QUOTE: KeyCodeType = "Quote";
