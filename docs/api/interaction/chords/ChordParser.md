# Functions

- [parseChord](#parsechord)
- [parseMouseChord](#parsemousechord)
- [parseKeySequence](#parsekeysequence)
- [parseChordExpression](#parsechordexpression)

## parseChord

Parses a string representation of a chord into a Chord object.
Supports formats like "Ctrl+Shift+H" or "Ctrl+LeftClick" or "⌘+S".
Also supports escaped characters like "Ctrl+\\+" for Ctrl+Plus key.

| Function | Type |
| ---------- | ---------- |
| `parseChord` | `(chordString: string) => Chord` |

## parseMouseChord

Parses a mouse chord string (e.g., "Ctrl+LeftClick").

| Function | Type |
| ---------- | ---------- |
| `parseMouseChord` | `(chordString: string) => Chord` |

## parseKeySequence

Parses a key sequence string (e.g., "A + S + D") into an array of single-key chords.
Key sequences require keys to be pressed in order, one at a time.
Supports escaped characters like "\\+" for the plus key.

| Function | Type |
| ---------- | ---------- |
| `parseKeySequence` | `(sequenceString: string) => Chord[]` |

## parseChordExpression

Parses a chord expression that may contain OR operators (|) and parentheses.
Examples:
- "shift | ctrl + a" -> returns [Chord(shift), Chord(ctrl+a)]
- "(shift + a) | (ctrl + a)" -> returns [Chord(shift+a), Chord(ctrl+a)]
- "ctrl + \\+" -> returns [Chord(ctrl+plus)]

Returns an array of Chord alternatives. If no OR operator is present, returns a single-element array.

| Function | Type |
| ---------- | ---------- |
| `parseChordExpression` | `(expression: string) => Chord[]` |


