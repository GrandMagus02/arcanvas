# ChordMatcher

Matches chords against events and state.

## Methods

- [addChord](#addchord)
- [removeChord](#removechord)
- [match](#match)
- [clear](#clear)

### addChord

Adds a chord to match against.

| Method | Type |
| ---------- | ---------- |
| `addChord` | `(chord: string or Chord) => void` |

### removeChord

Removes a chord.

| Method | Type |
| ---------- | ---------- |
| `removeChord` | `(chord: string or Chord) => void` |

### match

Matches an event against all registered chords.

| Method | Type |
| ---------- | ---------- |
| `match` | `(event: NormalizedInputEvent, state?: InputState or undefined) => Chord or null` |

### clear

Clears all chords.

| Method | Type |
| ---------- | ---------- |
| `clear` | `() => void` |
