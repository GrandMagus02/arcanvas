import type { Chord } from "../chords/Chord";

/**
 * Represents a sequence of chords (for multi-step shortcuts like Ctrl+K then Ctrl+C).
 */
export type ChordSequence = Chord[];

/**
 * A binding that maps a chord or chord sequence to an action ID.
 */
export class ShortcutBinding {
  constructor(
    public readonly chord: Chord | ChordSequence,
    public readonly actionId: string,
    public readonly context: string = "global",
    public readonly priority: number = 0,
    public readonly isKeySequence: boolean = false
  ) {}

  /**
   * Checks if this binding matches a chord.
   */
  matchesChord(chord: Chord): boolean {
    if (Array.isArray(this.chord)) {
      // For sequences, we'd need to track state - this is simplified
      return this.chord[this.chord.length - 1]?.equals(chord) ?? false;
    }
    return this.chord.equals(chord);
  }

  /**
   * Checks if this binding is for a sequence.
   */
  get isSequence(): boolean {
    return Array.isArray(this.chord);
  }
}
