export default class MIDI {
    public static noteMap = [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    ];

    public static keybindingMap = {
        C1: null,
        "C#1": null,
        D1: null,
        "D#1": null,
        E1: null,
        F1: null,
        "F#1": null,
        G1: null,
        "G#1": null,
        A1: null,
        "A#1": null,
        B1: null,
        C2: "1",
        "C#2": "!",
        D2: "2",
        "D#2": "@",
        E2: "3",
        F2: "4",
        "F#2": "$",
        G2: "5",
        "G#2": "%",
        A2: "6",
        "A#2": "^",
        B2: "7",
        C3: "8",
        "C#3": "*",
        D3: "9",
        "D#3": "(",
        E3: "0",
        F3: "q",
        "F#3": "Q",
        G3: "w",
        "G#3": "W",
        A3: "e",
        "A#3": "E",
        B3: "r",
        C4: "t",
        "C#4": "T",
        D4: "y",
        "D#4": "Y",
        E4: "u",
        F4: "i",
        "F#4": "I",
        G4: "o",
        "G#4": "O",
        A4: "p",
        "A#4": "P",
        B4: "a",
        C5: "s",
        "C#5": "S",
        D5: "d",
        "D#5": "D",
        E5: "f",
        F5: "g",
        "F#5": "G",
        G5: "h",
        "G#5": "H",
        A5: "j",
        "A#5": "J",
        B5: "k",
        C6: "l",
        "C#6": "L",
        D6: "z",
        "D#6": "Z",
        E6: "x",
        F6: "c",
        "F#6": "C",
        G6: "v",
        "G#6": "V",
        A6: "b",
        "A#6": "B",
        B6: "n",
        C7: "m",
        "C#7": null,
        D7: null,
        "D#7": null,
        E7: null,
        F7: null,
        "F#7": null,
        G7: null,
        "G#7": null,
        A7: null,
        "A#7": null,
        B7: null,
        C8: null,
        "C#8": null,
        D8: null,
        "D#8": null,
        E8: null,
        F8: null,
        "F#8": null,
        G8: null,
        "G#8": null,
        A8: null,
        "A#8": null,
        B8: null,
        C9: null,
        "C#9": null,
        D9: null,
        "D#9": null,
        E9: null,
        F9: null,
        "F#9": null,
        G9: null,
        "G#9": null,
        A9: null,
        "A#9": null,
        B9: null,
        C10: null,
        "C#10": null,
        D10: null,
        "D#10": null,
        E10: null,
        F10: null,
        "F#10": null,
        G10: null,
        "G#10": null,
        A10: null,
        "A#10": null,
        B10: null,
    };

    public static getNoteMap() {
        return this.noteMap;
    }

    public static getKeybindingMap() {
        return this.keybindingMap;
    }

    public static getNoteKeybinding(note) {
        return this.keybindingMap[note] || null;
    }

    public static getKeybindingNote(key) {
        //return this.keybindingMap.
        const note = Object.keys(this.keybindingMap).find((boundKey) => {
            if (this.keybindingMap[boundKey] === key) {
                return true;
            }
        });
        return note || null;
    }

    public static parseMIDIMessage(message) {
        return {
            command: message.data[0] >> 4,
            channel: message.data[0] & 0xf,
            note: this.noteFromIndex(message.data[1]),
            noteIndex: message.data[1],
            velocity: message.data[2] / 127,
        };
    }

    public static noteFromIndex(noteIndex, includeOctave = true) {
        const noteMapIndex = noteIndex % 12;
        // If we're on a C note then we need to move up an octave
        const octave =
            noteMapIndex > 0
                ? Math.ceil(noteIndex / 12)
                : Math.ceil(noteIndex / 12) + 1;
        return this.noteMap[noteMapIndex] + (includeOctave ? octave : "");
    }

    public static noteToIndex(note) {
        // ([A-G]#?)([0-9]+)
        const noteMatch = note.match(/(?<note>[A-G]#?)(?<octave>[0-9]+)/i);
        let noteIndex = 0;
        if (
            noteMatch &&
            noteMatch.groups &&
            noteMatch.groups.note &&
            noteMatch.groups.octave
        ) {
            const mapIndex = this.noteMap.indexOf(noteMatch.groups.note);
            noteIndex = mapIndex + (noteMatch.groups.octave - 1) * 12;
        } else {
            console.error("Could not determine note index");
        }

        /*const noteMapIndex = noteIndex % 12;
        // If we're on a C note then we need to move up an octave
        const octave =
            noteMapIndex > 0
                ? Math.ceil(noteIndex / 12)
                : Math.ceil(noteIndex / 12) + 1;
        return this.noteMap[noteMapIndex] + (includeOctave ? octave : "");*/

        return noteIndex;
    }

    public static onNote(note, velocity) {}
    public static onPad(pad, velocity) {}
    public static onPitchBend(value) {}
    public static onModWheel(value) {}

    /**
     * Handle a MIDI message from a MIDI input.
     */
    public static handleMIDIMessage(message, activeInputId = null) {
        // Skip the message if it's for a midi input that's not actively selected
        if (!activeInputId || activeInputId !== message.target.id) {
            return;
        }
        // Parse the MIDIMessageEvent.
        const { command, channel, note, noteIndex, velocity } =
            this.parseMIDIMessage(message);

        // Stop command.
        // Negative velocity is an upward release rather than a downward press.
        if (command === 8) {
            if (channel === 0) this.onNote(note, -velocity);
            else if (channel === 9) this.onPad(note, -velocity);
        }

        // Start command.
        else if (command === 9) {
            if (channel === 0) this.onNote(note, velocity);
            else if (channel === 9) this.onPad(note, velocity);
        }

        // Knob command.
        else if (command === 11) {
            if (noteIndex === 1) this.onModWheel(velocity);
        }

        // Pitch bend command.
        else if (command === 14) {
            this.onPitchBend(velocity);
        }
    }
}
