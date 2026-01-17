import type { InputState } from "../state/InputState";
import type { NormalizedInputEvent } from "../types/InputEvent";
import { Chord } from "./Chord";
import { parseChord } from "./ChordParser";

/**
 * Matches chords against events and state.
 */
export class ChordMatcher {
  private _chords: Chord[] = [];

  /**
   * Adds a chord to match against.
   */
  addChord(chord: Chord | string): void {
    const chordObj = typeof chord === "string" ? parseChord(chord) : chord;
    this._chords.push(chordObj);
  }

  /**
   * Removes a chord.
   */
  removeChord(chord: Chord | string): void {
    const chordObj = typeof chord === "string" ? parseChord(chord) : chord;
    this._chords = this._chords.filter((c) => !c.equals(chordObj));
  }

  /**
   * Matches an event against all registered chords.
   */
  match(event: NormalizedInputEvent, state?: InputState): Chord | null {
    for (const chord of this._chords) {
      if (chord.matches(event, state)) {
        return chord;
      }
    }
    return null;
  }

  /**
   * Gets all registered chords.
   */
  get chords(): ReadonlyArray<Chord> {
    return [...this._chords];
  }

  /**
   * Clears all chords.
   */
  clear(): void {
    this._chords = [];
  }
}
