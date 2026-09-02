# Interaction Record — Index 71

**Originating Role**: `assistant`
**Referenced User Query Index**: `70`

---

## User Query
````
i believe information is needed for thinking. SO you sould forever alternate between thinking, and then consuming. THe best i could come up right now to separate the "hard" vs "soft" group was to give each a group header, and pressing X would move the item between the two groups? ok?
````
---

## Claude Response (Raw Markdown)

Good — that's a real design decision, and it's the right one over drag-and-drop (drag-and-drop is more code, breaks on mobile/touch, harder to make accessible). Two gaps worth closing now, not later:

**1) "Press X" needs to be a visible, labeled thing, not a bare keybind.**
This is fine if X is a clickable icon on each item (e.g. a small toggle/pin), with a tooltip on hover saying what it does. It breaks the "self-descriptive, no docs needed" rule you set for the UI if X is a keyboard shortcut nobody would discover without being told. Pick: visible icon per item, tooltip explains it on hover, click toggles the group. Not a hidden hotkey.

**2) What group does a new item start in?**
When the recruiter types "5 years Python" and adds it, it has to land in one group by default — undefined right now. Default to **hard**, since most things a recruiter bothers typing are things they actually need; soft becomes the deliberate downgrade, not the default. This also means most items need zero clicks — only the "would be nice but not required" ones need the toggle pressed. Less total interaction than the other way around.

With those two fixed: yes, two-column layout, one toggle per item, moves it between hard/soft — that's the whole mechanism, and it maps directly onto the blocking/non-blocking flag from the schema. Nothing else needed here.
