<template>
    <div
        :class="
            'octave-container ' + (loading ? 'octave-container--loading' : '')
        "
        :style="octaveColorStyle"
    >
        <div class="octave">
            <div
                v-for="note in noteMap"
                :key="note"
                :class="
                    'key ' +
                    (!isSharp(note)
                        ? 'key--normal key--white '
                        : 'key--sharp key--black') +
                    ' ' +
                    (activeKeys[note + octave] ? 'key--active' : '')
                "
                role="button"
                @mousemove="onMouseMove($event, note)"
                @mouseout="onMouseOut(note)"
                @mousedown="onMouseDown(note)"
                @mouseleave="onMouseLeave(note)"
                @mouseup="onMouseUp(note)"
                @touchstart="onMouseDown(note)"
                @touchend="onMouseUp(note)"
            >
                <div class="note-label">
                    {{ noteLabel(note) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import _ from "lodash";
import MIDI from "~/helpers/MIDI.ts";
import Visualizer from "~/helpers/Visualizer";

export default {
    name: "PianoOctave",
    components: {},
    props: {
        octave: { type: Number, required: true },
        activeKeys: { type: Object, required: true },
        keyStyle: { type: String, required: false, default: "notes" },
        loading: { type: Boolean, required: false, default: false },
    },
    emits: ["mouse:down", "mouse:up"],
    data() {
        return {
            noteMap: [
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
            ],
        };
    },
    computed: {
        octaveColorStyle() {
            // Add a top "border" with the center key color for each octave
            return (
                "box-shadow: 0 -5px 0 " +
                Visualizer.keyColor(this.octave * 12 - 6) +
                ";"
            );
        },
        noteLabel() {
            return (note) => {
                if (this.keyStyle === "keys") {
                    return MIDI.getNoteKeybinding(note + this.octave);
                } else if (this.keyStyle === "notes") {
                    return note;
                } else {
                    return "";
                }
            };
        },
    },
    created() {},
    mounted() {},
    methods: {
        isSharp(note) {
            return note.includes("#");
        },
        onMouseMove(e, note) {
            // The key is note active and we're currently holding left click down
            if (!this.activeKeys[note + this.octave] && e.buttons === 1) {
                this.onMouseDown(note);
            }
        },
        onMouseOut(note) {
            // The key is currently active and the mouse left
            if (this.activeKeys[note + this.octave]) {
                this.onMouseUp(note);
            }
        },
        onMouseLeave(note) {
            // The key is currently active and the mouse left
            if (this.activeKeys[note + this.octave]) {
                this.onMouseUp(note);
            }
        },
        onMouseDown(note) {
            this.$emit("mouse:down", note + this.octave);
        },
        onMouseUp(note) {
            //console.log("onMouseUp", note);
            this.$emit("mouse:up", note + this.octave);
        },
    },
};
</script>

<style lang="scss" scoped>
.octave-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
.octave-container--loading {
    opacity: 0.7;
}
.octave {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-height: 200px;
}
.notes-container {
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    display: flex;
    flex: auto;
    border: 1px solid #000;
}
.key {
    display: flex;
    width: 100%;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    transition: background-color 1s;
}
.key--normal {
    min-width: 20px;
    max-width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
}
.key--sharp {
    min-width: 20px;
    max-width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    position: relative;
    margin-left: -10px;
    margin-right: -10px;
}
.key--white {
    border-bottom: 3px inset #ccc;
    background: #fefefe;
    min-height: 150px;
    outline: 1px solid #ccc;
    color: #000;
}
.key--white:hover {
    background: #f0f0f0;
    transition: background-color 0.2s;
}
.key--black {
    border-bottom: 3px inset #111;
    background: #333;
    height: 75px;
    outline: 1px solid #111;
    color: #fff;
}
.key--black:hover {
    background: #555;
    transition: background-color 0.2s;
}
.key--white.key--active {
    background: #ffe9a8 !important;
    transition: background-color 0s;
}
.key--black.key--active {
    background: #5c4a2d !important;
    height: 80px;
    transition: background-color 0s;
}
.note-label {
    align-self: flex-end;
    flex-grow: 1;
    text-align: center;
    user-select: none;
    padding-bottom: 5px;
}
.key--active > .note-label {
    padding-bottom: 0px;
}
</style>
