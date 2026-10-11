<!-- Generated from the settings model; edit the setting definitions, not this file. -->

### General

| Setting | Description | Default | Values |
| --- | --- | --- | --- |
| Type of Change to Flag | Which changes are flagged. Ignored when the improvement direction is neutral. | Both | • Both (`both`)<br>• Improvement (`improvement`)<br>• Deterioration (`deterioration`) |
| Improvement Direction | Whether higher or lower values are better. Neutral flags both sides in the neutral colours. | Increase | • Increase (`increase`)<br>• Neutral (`neutral`)<br>• Decrease (`decrease`) |

### Astronomical Points

| Setting | Description | Default | Values |
| --- | --- | --- | --- |
| Highlight Astronomical Points | Flags points beyond the chosen limit. | Off | On or Off |
| Limit for Astronomical Points | Limit a point must be beyond. Specification needs the specification lines shown. | 3 Sigma | • `1 Sigma`<br>• `2 Sigma`<br>• `3 Sigma`<br>• `Specification` |
| Imp. Ast. Colour | Colour for astronomical points that are an improvement. | `#00B0F0` | Colour |
| Det. Ast. Colour | Colour for astronomical points that are a deterioration. | `#E46C0A` | Colour |
| Neutral (Low) Ast. Colour | Colour for points beyond the lower limit when the improvement direction is neutral. | `#490092` | Colour |
| Neutral (High) Ast. Colour | Colour for points beyond the upper limit when the improvement direction is neutral. | `#490092` | Colour |

### Shifts

| Setting | Description | Default | Values |
| --- | --- | --- | --- |
| Highlight Shifts | Flags runs of points on one side of the centreline. | Off | On or Off |
| Shift Points | Points needed for a shift; points on the centreline neither count nor break it. | 7 | Whole number, at least 1 |
| Imp. Shift Colour | Colour for shifts that are an improvement. | `#00B0F0` | Colour |
| Det. Shift Colour | Colour for shifts that are a deterioration. | `#E46C0A` | Colour |
| Neutral (Low) Shift Colour | Colour for shifts below the centreline when the improvement direction is neutral. | `#490092` | Colour |
| Neutral (High) Shift Colour | Colour for shifts above the centreline when the improvement direction is neutral. | `#490092` | Colour |

### Trends

| Setting | Description | Default | Values |
| --- | --- | --- | --- |
| Highlight Trends | Flags runs of steadily rising or falling points. | Off | On or Off |
| Trend Points | Points needed for a trend, including its first; repeated values count once. | 5 | Whole number, at least 2 |
| Imp. Trend Colour | Colour for trends that are an improvement. | `#00B0F0` | Colour |
| Det. Trend Colour | Colour for trends that are a deterioration. | `#E46C0A` | Colour |
| Neutral (Low) Trend Colour | Colour for falling trends when the improvement direction is neutral. | `#490092` | Colour |
| Neutral (High) Trend Colour | Colour for rising trends when the improvement direction is neutral. | `#490092` | Colour |

### Two-In-Three

| Setting | Description | Default | Values |
| --- | --- | --- | --- |
| Highlight Two-in-Three | Flags two of three consecutive points beyond the same warning limit. | Off | On or Off |
| Highlight all in Pattern | Also flags the third point in the window, unless it is beyond the opposite limit. | Off | On or Off |
| Warning Limit for Two-in-Three | Limit the points must be beyond. Specification needs the specification lines shown. | 2 Sigma | • `1 Sigma`<br>• `2 Sigma`<br>• `3 Sigma`<br>• `Specification` |
| Imp. Two-in-Three Colour | Colour for two-in-three points that are an improvement. | `#00B0F0` | Colour |
| Det. Two-in-Three Colour | Colour for two-in-three points that are a deterioration. | `#E46C0A` | Colour |
| Neutral (Low) Two-in-Three Colour | Colour for two-in-three patterns at the lower limit when the improvement direction is neutral. | `#490092` | Colour |
| Neutral (High) Two-in-Three Colour | Colour for two-in-three patterns at the upper limit when the improvement direction is neutral. | `#490092` | Colour |
