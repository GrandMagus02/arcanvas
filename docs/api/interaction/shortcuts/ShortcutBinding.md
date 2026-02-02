# ShortcutBinding

A binding that maps a chord or chord sequence to an action ID.

## Methods

- [matchesChord](#matcheschord)

### matchesChord

Checks if this binding matches a chord.

| Method | Type |
| ---------- | ---------- |
| `matchesChord` | `(chord: Chord) => boolean` |

# Types

- [ChordSequence](#chordsequence)

## ChordSequence

Represents a sequence of chords (for multi-step shortcuts like Ctrl+K then Ctrl+C).

| Type | Type |
| ---------- | ---------- |
| `ChordSequence` | `Chord[]` |

