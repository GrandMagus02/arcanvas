import { Chord } from "../chords/Chord";
import { parseChord, parseChordExpression, parseKeySequence } from "../chords/ChordParser";
import type { InputState } from "../state/InputState";
import type { NormalizedInputEvent } from "../types/InputEvent";
import { ShortcutBinding } from "./ShortcutBinding";
import { ShortcutContext, matchesContext } from "./ShortcutContext";

/**
 * Action event emitted when a shortcut is matched.
 */
export interface ActionEvent {
  actionId: string;
  context: string;
  chord: Chord;
  timestamp: number;
}

/**
 * Options for ShortcutEngine.
 */
export interface ShortcutEngineOptions {
  sequenceTimeout?: number; // Max time between chords in a sequence (default: 1000ms)
  currentContext?: string; // Current active context (default: "global")
}

/**
 * Engine that processes input events and state to emit action events from shortcut bindings.
 */
export class ShortcutEngine {
  private _bindings: ShortcutBinding[] = [];
  private _sequenceTimeout: number;
  private _currentContext: string;
  private _sequenceState: {
    chords: Chord[];
    timestamp: number;
    isKeySequence: boolean;
  } | null = null;
  private _actionListeners: Array<(event: ActionEvent) => void> = [];

  constructor(
    private _state: InputState,
    options: ShortcutEngineOptions = {}
  ) {
    this._sequenceTimeout = options.sequenceTimeout ?? 1000;
    this._currentContext = options.currentContext ?? ShortcutContext.Global;
  }

  /**
   * Binds a chord or chord sequence to an action ID.
   * Supports key sequences like "A + S + D" which require keys to be pressed in order.
   */
  bind(chord: Chord | string | (Chord | string)[], actionId: string, context: string = "global", priority: number = 0): void {
    let chordObj: Chord | Chord[];
    let isKeySequence = false;
    let isOrExpression = false;

    if (Array.isArray(chord)) {
      chordObj = chord.map((c) => (typeof c === "string" ? parseChord(c) : c));
    } else if (typeof chord === "string") {
      // Check if it contains OR operator (|) or parentheses - use expression parser
      const hasOrOperator = /(?<!\\)\|/.test(chord);
      const hasParentheses = /(?<!\\)[()]/.test(chord);

      if (hasOrOperator || hasParentheses) {
        // Use expression parser which handles OR, parentheses, and escape sequences
        const alternatives = parseChordExpression(chord);
        isOrExpression = alternatives.length > 1;

        if (isOrExpression) {
          // Create a binding for each alternative
          for (const altChord of alternatives) {
            const binding = new ShortcutBinding(altChord, actionId, context, priority, false);
            this._bindings.push(binding);
          }
          // Sort by priority (higher first)
          this._bindings.sort((a, b) => b.priority - a.priority);
          return;
        } else {
          // Single chord after parsing (parentheses were just for grouping)
          const firstAlt = alternatives[0];
          if (!firstAlt) {
            return; // No valid chord found
          }
          chordObj = firstAlt;
        }
      } else {
        // Check if it's a key sequence (multiple single keys separated by +, no modifiers)
        // Need to handle escaped + characters
        const unescaped = chord.replace(/\\(.)/g, "$1");
        const parts = unescaped
          .split("+")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        if (parts.length > 1) {
          // Check if all parts are single keys (no modifiers)
          const hasModifiers = parts.some((part) => {
            const lower = part.toLowerCase();
            return ["ctrl", "control", "shift", "alt", "meta", "cmd", "command", "leftclick", "rightclick", "middleclick", "left", "right", "middle", "back", "forward"].includes(lower);
          });
          if (!hasModifiers) {
            // It's a key sequence
            chordObj = parseKeySequence(chord);
            isKeySequence = true;
          } else {
            // It's a regular chord
            chordObj = parseChord(chord);
          }
        } else {
          chordObj = parseChord(chord);
        }
      }
    } else {
      chordObj = chord;
    }

    const binding = new ShortcutBinding(chordObj, actionId, context, priority, isKeySequence);
    this._bindings.push(binding);
    // Sort by priority (higher first)
    this._bindings.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Unbinds a shortcut.
   */
  unbind(actionId: string, context?: string): void {
    this._bindings = this._bindings.filter((b) => {
      if (b.actionId !== actionId) return true;
      if (context !== undefined && b.context !== context) return true;
      return false;
    });
  }

  /**
   * Processes an input event and emits action events if shortcuts match.
   */
  process(event: NormalizedInputEvent): void {
    // Update state
    this._state.update(event);

    // Check for sequence timeout
    if (this._sequenceState) {
      const elapsed = event.timestamp - this._sequenceState.timestamp;
      if (elapsed > this._sequenceTimeout) {
        this._sequenceState = null;
      }
    }

    // For key sequences, handle keyup events to reset if wrong key is released
    if (this._sequenceState?.isKeySequence && event.type === "keyup" && event.key) {
      const currentIndex = this._sequenceState.chords.length;
      const sequenceBindings = this._bindings.filter((b) => b.isKeySequence && matchesContext(b.context, this._currentContext));

      for (const binding of sequenceBindings) {
        const sequence = binding.chord as Chord[];
        if (currentIndex < sequence.length) {
          const expectedKey = sequence[currentIndex].keys?.[0]?.toLowerCase();
          const releasedKey = event.key.toLowerCase();
          // If a key is released that's not the expected next key, reset sequence
          if (expectedKey && releasedKey !== expectedKey) {
            // Check if it's a key from the sequence that was pressed earlier
            const isFromSequence = sequence.some((chord, idx) => idx < currentIndex && chord.keys?.[0]?.toLowerCase() === releasedKey);
            if (!isFromSequence) {
              this._sequenceState = null;
              return;
            }
          }
        }
      }
    }

    // Only process keydown/pointerdown events for shortcuts
    if (event.type !== "keydown" && event.type !== "mousedown" && event.type !== "pointerdown") {
      return;
    }

    // Try to match a chord
    const chord = this._extractChord(event);
    if (!chord) return;

    // Check for sequence continuation
    if (this._sequenceState) {
      // For key sequences, ensure keys are pressed one at a time (not simultaneously)
      if (this._sequenceState.isKeySequence) {
        // Check if the expected next key matches
        const expectedNext = this._getExpectedNextKey(this._sequenceState.chords.length - 1);
        if (expectedNext && chord.keys?.[0]?.toLowerCase() !== expectedNext.toLowerCase()) {
          // Wrong key pressed - reset and try to start new sequence
          this._sequenceState = null;
          const sequenceStart = this._findKeySequenceStart(chord);
          if (sequenceStart) {
            this._sequenceState = {
              chords: [chord],
              timestamp: event.timestamp,
              isKeySequence: true,
            };
          }
          return;
        }
      }

      this._sequenceState.chords.push(chord);
      this._sequenceState.timestamp = event.timestamp;

      // Try to match sequence
      const sequenceMatch = this._matchSequence(this._sequenceState.chords, this._sequenceState.isKeySequence);
      if (sequenceMatch) {
        this._emitAction(sequenceMatch, chord);
        this._sequenceState = null;
        return;
      }

      // If sequence doesn't match and we have a single-chord match, use that (only for non-key-sequences)
      if (!this._sequenceState.isKeySequence) {
        const singleMatch = this._matchSingle(chord);
        if (singleMatch) {
          this._emitAction(singleMatch, chord);
          this._sequenceState = null;
          return;
        }
      }
    } else {
      // Check for single chord match
      const singleMatch = this._matchSingle(chord);
      if (singleMatch) {
        this._emitAction(singleMatch, chord);
        return;
      }

      // Check if this could be the start of a sequence
      const sequenceStart = this._findSequenceStart(chord);
      if (sequenceStart) {
        this._sequenceState = {
          chords: [chord],
          timestamp: event.timestamp,
          isKeySequence: sequenceStart.isKeySequence,
        };
        return;
      }
    }
  }

  /**
   * Sets the current context.
   */
  setContext(context: string): void {
    this._currentContext = context;
  }

  /**
   * Gets the current context.
   */
  get context(): string {
    return this._currentContext;
  }

  /**
   * Registers a listener for action events.
   */
  onAction(listener: (event: ActionEvent) => void): () => void {
    this._actionListeners.push(listener);
    return () => {
      this._actionListeners = this._actionListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Extracts a chord from an event.
   */
  private _extractChord(event: NormalizedInputEvent): Chord | null {
    if (event.type === "keydown" && event.key) {
      return new Chord(event.modifiers, [event.key]);
    }
    if ((event.type === "mousedown" || event.type === "pointerdown") && event.buttons.length > 0) {
      return new Chord(event.modifiers, undefined, event.buttons[0]);
    }
    return null;
  }

  /**
   * Matches a single chord against bindings.
   */
  private _matchSingle(chord: Chord): ShortcutBinding | null {
    for (const binding of this._bindings) {
      if (binding.isSequence) continue;
      if (!matchesContext(binding.context, this._currentContext)) continue;
      if (binding.matchesChord(chord)) {
        return binding;
      }
    }
    return null;
  }

  /**
   * Matches a chord sequence against bindings.
   */
  private _matchSequence(chords: Chord[], isKeySequence: boolean = false): ShortcutBinding | null {
    for (const binding of this._bindings) {
      if (!binding.isSequence) continue;
      if (binding.isKeySequence !== isKeySequence) continue;
      if (!matchesContext(binding.context, this._currentContext)) continue;
      const sequence = binding.chord as Chord[];
      if (sequence.length !== chords.length) continue;

      let matches = true;
      for (let i = 0; i < sequence.length; i++) {
        if (!sequence[i].equals(chords[i])) {
          matches = false;
          break;
        }
      }

      if (matches) {
        return binding;
      }
    }
    return null;
  }

  /**
   * Finds if a chord could be the start of any sequence binding.
   */
  private _findSequenceStart(chord: Chord): { isKeySequence: boolean } | null {
    for (const binding of this._bindings) {
      if (!binding.isSequence) continue;
      if (!matchesContext(binding.context, this._currentContext)) continue;
      const sequence = binding.chord as Chord[];
      if (sequence.length > 0 && sequence[0].equals(chord)) {
        return { isKeySequence: binding.isKeySequence };
      }
    }
    return null;
  }

  /**
   * Finds if a chord could be the start of a key sequence binding.
   */
  private _findKeySequenceStart(chord: Chord): boolean {
    for (const binding of this._bindings) {
      if (!binding.isSequence || !binding.isKeySequence) continue;
      if (!matchesContext(binding.context, this._currentContext)) continue;
      const sequence = binding.chord as Chord[];
      if (sequence.length > 0 && sequence[0].equals(chord)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets the expected next key in the current key sequence.
   */
  private _getExpectedNextKey(currentIndex: number): string | null {
    if (!this._sequenceState?.isKeySequence) return null;

    // Find the binding that matches the current sequence so far
    for (const binding of this._bindings) {
      if (!binding.isSequence || !binding.isKeySequence) continue;
      if (!matchesContext(binding.context, this._currentContext)) continue;
      const sequence = binding.chord as Chord[];

      // Check if the current sequence matches the beginning of this binding
      if (currentIndex + 1 < sequence.length) {
        let matches = true;
        for (let i = 0; i <= currentIndex; i++) {
          if (!sequence[i].equals(this._sequenceState.chords[i])) {
            matches = false;
            break;
          }
        }
        if (matches) {
          return sequence[currentIndex + 1].keys?.[0] ?? null;
        }
      }
    }
    return null;
  }

  /**
   * Emits an action event.
   */
  private _emitAction(binding: ShortcutBinding, chord: Chord): void {
    const actionEvent: ActionEvent = {
      actionId: binding.actionId,
      context: binding.context,
      chord,
      timestamp: Date.now(),
    };

    for (const listener of this._actionListeners) {
      listener(actionEvent);
    }
  }
}
