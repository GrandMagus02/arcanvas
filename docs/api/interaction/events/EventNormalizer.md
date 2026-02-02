# Functions

- [normalizeEvent](#normalizeevent)

## normalizeEvent

Normalizes a DOM event into a NormalizedInputEvent.

| Function | Type |
| ---------- | ---------- |
| `normalizeEvent` | `(event: Event, target?: Element or undefined) => NormalizedInputEvent or null` |


# EventNormalizer

Event normalizer class for batch processing.

## Methods

- [normalize](#normalize)
- [normalizeBatch](#normalizebatch)

### normalize

Normalizes a single event.

| Method | Type |
| ---------- | ---------- |
| `normalize` | `(event: Event, target?: Element or undefined) => NormalizedInputEvent or null` |

### normalizeBatch

Normalizes multiple events.

| Method | Type |
| ---------- | ---------- |
| `normalizeBatch` | `(events: Event[], target?: Element or undefined) => NormalizedInputEvent[]` |
