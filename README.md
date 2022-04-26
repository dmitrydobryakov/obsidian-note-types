# Note Types for Obsidian
**Templates** – not only for the contents of notes, but also for the name and location. 

Simplifies the process of creating new notes if you have some semantic structure in your vault (i.e. different types of notes: zettelkasten, daily, study notes, etc). Eliminates the need to move new notes from one folder to another, manually enter names/contents that could be generated, and do that every single time you create a note.

## Three templates – one hotkey

* Dynamically define location for your new notes by using a `location template`. For instance, you can create automatic date-based folder structure for your daily notes and group them by month. Here is the template: `Daily/{{now:"YYYY-MM MMMM"}}`.

* Use `content template` to dynamically define note contents. This is exactly what `Templates` core plugin and some community plugins like [`Templater`](https://github.com/SilentVoid13/Templater) do.

* Use `name template` to generate note name. One well-known use case is Zettelkasten prefix. You can leave it empty if you want to enter the name yourself and still have access to it in the contents template (with `{{name}}`).

Now, combine these three templates into a single `note type`. Next time you create a note, just select the type you want, or even assign some shortcuts.

## Supported template functions

For now, only the set of functions listed below is supported. Integration with specialized template plugins / support for custom functions – is likely to happen in the future.

* Date: `{{now}}` or `{{now:"<format>"}}`
* Currently open note: `{{src-name}}`, `{{src-folder}}`, `{{src-path}}`, `{{src-link}}`, `{{selection}}`, `{{src.<frontmatter-field>}}`
* New note (as specified in the type description): `{{this-name}}`, `{{this-folder}}`, `{{this-path}}`
* Name asked and entered during creation: `{{name}}`
* Clipboard: `{{clipboard}}`
* Content of another note (nested functions are ignored): `{{content:"<path/to/note.md>"}}` or `{{content:[[<obsidian/link>]]}}`

## Features

* Create as many types as you need.
* Shortcuts to create and move notes.
* Select note type when clicking on a non-existent link.
	* Right click in editing mode.
	* Not supported in Live Preview Mode.
* Store templates as files or enter them directly.
