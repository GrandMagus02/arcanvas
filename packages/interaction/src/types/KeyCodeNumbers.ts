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
 * Represents a numeric keyboard key code.
 * These values correspond to KeyboardEvent.keyCode.
 *
 * @remarks
 * These constants provide numeric key codes that are layout-independent and
 * work consistently across different keyboard layouts. They are the preferred
 * way to identify keys for reliable key binding.
 *
 * Based on keycode-js library (MIT License)
 * Source: https://github.com/kabirbaidhya/keycode-js
 */
export type KeyCodeNumber = number;

/**
 * Numeric key code constants.
 * These correspond to KeyboardEvent.keyCode values.
 *
 * @remarks
 * These constants provide numeric key codes that are layout-independent and
 * work consistently across different keyboard layouts. They are the preferred
 * way to identify keys for reliable key binding.
 *
 * Based on keycode-js library (MIT License)
 * Source: https://github.com/kabirbaidhya/keycode-js
 */

// Special keys
export const KEY_CANCEL: KeyCodeNumber = 3;
export const KEY_HELP: KeyCodeNumber = 6;
export const KEY_BACK_SPACE: KeyCodeNumber = 8;
export const KEY_TAB: KeyCodeNumber = 9;
export const KEY_CLEAR: KeyCodeNumber = 12;
export const KEY_RETURN: KeyCodeNumber = 13;
export const KEY_SHIFT: KeyCodeNumber = 16;
export const KEY_CONTROL: KeyCodeNumber = 17;
export const KEY_ALT: KeyCodeNumber = 18;
export const KEY_PAUSE: KeyCodeNumber = 19;
export const KEY_CAPS_LOCK: KeyCodeNumber = 20;
export const KEY_ESCAPE: KeyCodeNumber = 27;
export const KEY_SPACE: KeyCodeNumber = 32;
export const KEY_PAGE_UP: KeyCodeNumber = 33;
export const KEY_PAGE_DOWN: KeyCodeNumber = 34;
export const KEY_END: KeyCodeNumber = 35;
export const KEY_HOME: KeyCodeNumber = 36;
export const KEY_LEFT: KeyCodeNumber = 37;
export const KEY_UP: KeyCodeNumber = 38;
export const KEY_RIGHT: KeyCodeNumber = 39;
export const KEY_DOWN: KeyCodeNumber = 40;
export const KEY_PRINTSCREEN: KeyCodeNumber = 44;
export const KEY_INSERT: KeyCodeNumber = 45;
export const KEY_DELETE: KeyCodeNumber = 46;

// Number keys (top row)
export const KEY_0: KeyCodeNumber = 48;
export const KEY_1: KeyCodeNumber = 49;
export const KEY_2: KeyCodeNumber = 50;
export const KEY_3: KeyCodeNumber = 51;
export const KEY_4: KeyCodeNumber = 52;
export const KEY_5: KeyCodeNumber = 53;
export const KEY_6: KeyCodeNumber = 54;
export const KEY_7: KeyCodeNumber = 55;
export const KEY_8: KeyCodeNumber = 56;
export const KEY_9: KeyCodeNumber = 57;

// Letter keys
export const KEY_A: KeyCodeNumber = 65;
export const KEY_B: KeyCodeNumber = 66;
export const KEY_C: KeyCodeNumber = 67;
export const KEY_D: KeyCodeNumber = 68;
export const KEY_E: KeyCodeNumber = 69;
export const KEY_F: KeyCodeNumber = 70;
export const KEY_G: KeyCodeNumber = 71;
export const KEY_H: KeyCodeNumber = 72;
export const KEY_I: KeyCodeNumber = 73;
export const KEY_J: KeyCodeNumber = 74;
export const KEY_K: KeyCodeNumber = 75;
export const KEY_L: KeyCodeNumber = 76;
export const KEY_M: KeyCodeNumber = 77;
export const KEY_N: KeyCodeNumber = 78;
export const KEY_O: KeyCodeNumber = 79;
export const KEY_P: KeyCodeNumber = 80;
export const KEY_Q: KeyCodeNumber = 81;
export const KEY_R: KeyCodeNumber = 82;
export const KEY_S: KeyCodeNumber = 83;
export const KEY_T: KeyCodeNumber = 84;
export const KEY_U: KeyCodeNumber = 85;
export const KEY_V: KeyCodeNumber = 86;
export const KEY_W: KeyCodeNumber = 87;
export const KEY_X: KeyCodeNumber = 88;
export const KEY_Y: KeyCodeNumber = 89;
export const KEY_Z: KeyCodeNumber = 90;

// Meta keys
export const KEY_LEFT_CMD: KeyCodeNumber = 91;
export const KEY_RIGHT_CMD: KeyCodeNumber = 92;
export const KEY_CONTEXT_MENU: KeyCodeNumber = 93;

// Numpad keys
export const KEY_NUMPAD0: KeyCodeNumber = 96;
export const KEY_NUMPAD1: KeyCodeNumber = 97;
export const KEY_NUMPAD2: KeyCodeNumber = 98;
export const KEY_NUMPAD3: KeyCodeNumber = 99;
export const KEY_NUMPAD4: KeyCodeNumber = 100;
export const KEY_NUMPAD5: KeyCodeNumber = 101;
export const KEY_NUMPAD6: KeyCodeNumber = 102;
export const KEY_NUMPAD7: KeyCodeNumber = 103;
export const KEY_NUMPAD8: KeyCodeNumber = 104;
export const KEY_NUMPAD9: KeyCodeNumber = 105;
export const KEY_MULTIPLY: KeyCodeNumber = 106;
export const KEY_ADD: KeyCodeNumber = 107;
export const KEY_SUBTRACT: KeyCodeNumber = 109;
export const KEY_DECIMAL: KeyCodeNumber = 110;
export const KEY_DIVIDE: KeyCodeNumber = 111;

// Function keys
export const KEY_F1: KeyCodeNumber = 112;
export const KEY_F2: KeyCodeNumber = 113;
export const KEY_F3: KeyCodeNumber = 114;
export const KEY_F4: KeyCodeNumber = 115;
export const KEY_F5: KeyCodeNumber = 116;
export const KEY_F6: KeyCodeNumber = 117;
export const KEY_F7: KeyCodeNumber = 118;
export const KEY_F8: KeyCodeNumber = 119;
export const KEY_F9: KeyCodeNumber = 120;
export const KEY_F10: KeyCodeNumber = 121;
export const KEY_F11: KeyCodeNumber = 122;
export const KEY_F12: KeyCodeNumber = 123;
export const KEY_F13: KeyCodeNumber = 124;
export const KEY_F14: KeyCodeNumber = 125;
export const KEY_F15: KeyCodeNumber = 126;
export const KEY_F16: KeyCodeNumber = 127;
export const KEY_F17: KeyCodeNumber = 128;
export const KEY_F18: KeyCodeNumber = 129;
export const KEY_F19: KeyCodeNumber = 130;
export const KEY_F20: KeyCodeNumber = 131;
export const KEY_F21: KeyCodeNumber = 132;
export const KEY_F22: KeyCodeNumber = 133;
export const KEY_F23: KeyCodeNumber = 134;
export const KEY_F24: KeyCodeNumber = 135;

// Lock keys
export const KEY_NUM_LOCK: KeyCodeNumber = 144;
export const KEY_SCROLL_LOCK: KeyCodeNumber = 145;

// Punctuation and symbols
export const KEY_SEMICOLON: KeyCodeNumber = 186;
export const KEY_EQUALS: KeyCodeNumber = 187;
export const KEY_COMMA: KeyCodeNumber = 188;
export const KEY_DASH: KeyCodeNumber = 189;
export const KEY_PERIOD: KeyCodeNumber = 190;
export const KEY_SLASH: KeyCodeNumber = 191;
export const KEY_BACK_QUOTE: KeyCodeNumber = 192;
export const KEY_OPEN_BRACKET: KeyCodeNumber = 219;
export const KEY_BACK_SLASH: KeyCodeNumber = 220;
export const KEY_CLOSE_BRACKET: KeyCodeNumber = 221;
export const KEY_QUOTE: KeyCodeNumber = 222;

// Firefox-specific key codes
export const KEY_FIREFOX_ENTER: KeyCodeNumber = 14;
export const KEY_FIREFOX_SEMICOLON: KeyCodeNumber = 59;
export const KEY_FIREFOX_EQUALS: KeyCodeNumber = 61;
export const KEY_FIREFOX_SEPARATOR: KeyCodeNumber = 108;
export const KEY_FIREFOX_META: KeyCodeNumber = 224;
