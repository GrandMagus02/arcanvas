# Chord

Represents a chord - a simultaneous combination of keys and/or mouse buttons with modifiers.

## Methods

- [matches](#matches)
- [toString](#tostring)
- [equals](#equals)

### matches

Checks if this chord matches the given event or state.

| Method | Type |
| ---------- | ---------- |
| `matches` | `(event: NormalizedInputEvent, state?: InputState or undefined) => boolean` |

### toString

Serializes the chord to a string representation.

| Method | Type |
| ---------- | ---------- |
| `toString` | `() => string` |

### equals

Checks if two chords are equal.

| Method | Type |
| ---------- | ---------- |
| `equals` | `(other: Chord) => boolean` |
