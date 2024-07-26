<template>
    <div
        :class="
            'main-container mt-5 ' + (config.skin ? 'main-container--skin' : '')
        "
        @click="showOverlay = false"
    >
        <v-row class="controls">
            <v-col cols="2">
                <v-select
                    v-model="config.instrument"
                    label="Instrument"
                    :items="instruments"
                    prepend-inner-icon="mdi-waveform"
                    @update:modelValue="onChangeInstrument"
                ></v-select>
            </v-col>
            <v-col cols="2">
                <v-select
                    v-model="config.instrument_preset"
                    label="Instrument Modifier"
                    :items="instrumentPresets"
                    item-title="name"
                    return-object
                    prepend-inner-icon="mdi-tune-vertical"
                    @update:modelValue="onChangeInstrumentPreset"
                ></v-select>
            </v-col>
            <v-col cols="2">
                <v-select
                    v-model="config.input"
                    label="MIDI Inputs"
                    :items="physicalMidiInputs"
                    :loading="loading"
                    item-title="name"
                    item-value="id"
                    prepend-inner-icon="mdi-piano"
                    append-inner-icon="mdi-reload"
                    @click:appendInner="requestMidiAccess"
                ></v-select>
            </v-col>
            <v-col cols="2">
                <v-switch
                    v-model="config.has_velocity"
                    label="MIDI Velocity"
                ></v-switch>
            </v-col>
            <v-col cols="2">
                <v-slider
                    v-model="config.volume"
                    label="Volume"
                    min="0"
                    max="40"
                    :prepend-icon="volumeIcon"
                    @click:prepend="onToggleMute"
                    @update:modelValue="onUpdateVolume"
                ></v-slider>
            </v-col>
            <v-col cols="2">
                <v-range-slider
                    v-model="config.octaves"
                    label="Octaves"
                    step="1"
                    :max="10"
                    :min="1"
                    thumb-label
                ></v-range-slider>
            </v-col>

            <v-col cols="3">
                <Metronome :volume="config.volume - 30"></Metronome>
            </v-col>
            <v-col cols="1">
                Record
                <v-btn
                    icon
                    :color="recording ? 'red' : ''"
                    class="ml-1"
                    @click="onClickRecord"
                    ><v-icon>mdi-record</v-icon></v-btn
                >
            </v-col>
            <v-col cols="2">
                <v-file-input
                    v-model="config.file"
                    label="MIDI File"
                    accept=".mid,.midi"
                    prepend-icon=""
                    prepend-inner-icon="mdi-paperclip"
                    :loading="fileLoading"
                    @change="onFileSelect"
                    @click:clear="onFileSelect"
                ></v-file-input>
            </v-col>
            <v-col cols="2">
                <MusicSheet
                    @note:start="onStartNote"
                    @note:end="onEndNote"
                ></MusicSheet>
            </v-col>
            <v-col cols="2">
                <ConfigDisplay
                    v-model:skin="config.skin"
                    v-model:visualizer="config.visualizer"
                    v-model:key-display="config.key_display"
                ></ConfigDisplay>
            </v-col>
            <v-col cols="2">
                <CurrentNote :value="lastNote"></CurrentNote>
            </v-col>
        </v-row>

        <div
            tabindex="0"
            class="visual-container"
            @keydown="onKeyDown"
            @keyup="onKeyUp"
        >
            <div class="piano-container">
                <NoteVisualizer
                    v-if="config.visualizer"
                    :value="activeKeys"
                    :active-octaves="activeOctaves"
                    :class="showOverlay ? 'disabled' : ''"
                    :loading="fileLoading"
                ></NoteVisualizer>
                <div
                    :class="
                        'piano-key-container ' + (showOverlay ? 'disabled' : '')
                    "
                >
                    <PianoOctave
                        v-for="index in 10"
                        v-show="activeOctaves.includes(index)"
                        :key="index"
                        :octave="index"
                        :active-keys="activeKeys"
                        :key-style="config.key_display"
                        :loading="fileLoading"
                        @mouse:down="onStartNote"
                        @mouse:up="onEndNote"
                    >
                    </PianoOctave>
                </div>
            </div>
        </div>

        <div
            v-if="showOverlay"
            class="piano-interact-overlay"
            role="button"
            @click="showOverlay = false"
        >
            <v-btn @click="showOverlay = false"
                ><v-icon>mdi-play</v-icon></v-btn
            >
        </div>
    </div>
</template>

<script>
import _ from "lodash";
import * as Tone from "tone";
import MIDI from "~/helpers/MIDI";
import Instrument from "~/helpers/Instrument";
import NoteVisualizer from "~/components/NoteVisualizer";
import PianoOctave from "~/components/PianoOctave";
import Metronome from "~/components/Metronome";
import CurrentNote from "~/components/CurrentNote";
import MusicSheet from "~/components/MusicSheet";
import ConfigDisplay from "~/components/Config/Display.vue";
import { Midi } from "@tonejs/midi";
export default {
    name: "Piano",
    components: {
        NoteVisualizer,
        PianoOctave,
        Metronome,
        CurrentNote,
        ConfigDisplay,
        MusicSheet,
    },
    props: {},
    emits: [],
    data() {
        return {
            synth: null,
            showOverlay: true,
            loading: true,
            app: null,
            midi: null,
            fileLoading: false,
            recording: false,
            lastNote: "",
            config: {
                input: null,
                visualizer: true,
                instrument: "Synth",
                instrument_preset: null,
                key_display: "notes",
                skin: false,
                has_velocity: true,
                volume: 15,
                octaves: [1, 10],
                file: null,
                fileSynths: [],
            },
            instruments: [
                "AMSynth",
                "DuoSynth",
                "FMSynth",
                "MembraneSynth",
                "MetalSynth",
                "ModulationSynth",
                "MonoSynth",
                "Synth",
            ],

            activeKeys: [],
            midiInputs: [],
        };
    },
    computed: {
        activeOctaves() {
            const step = 1;
            const start = _.get(this.config.octaves, "[0]", 0);
            const stop = _.get(this.config.octaves, "[1]", 10);
            return Array.from(
                { length: (stop - start) / step + 1 },
                (_, i) => start + i * step
            );
        },
        octaveActive() {
            return (index) => {
                return (
                    index >= _.get(this.config.octaves, "[0]", 0) &&
                    index <= _.get(this.config.octaves, "[1]", 10)
                );
            };
        },
        instrumentPresets() {
            return Instrument.getPresets(this.config.instrument);
        },
        physicalMidiInputs() {
            if (this.midi !== null) {
                const inputs = [];
                for (const entry of this.midiInputs) {
                    if (!entry[1].manufacturer) {
                        continue;
                    }
                    inputs.push(entry[1]);
                    console.log("got midi input", entry[1]);
                }
                return inputs;
            } else {
                return [];
            }
        },
        volumeIcon() {
            if (this.config.volume > 30) {
                return "mdi-volume-high";
            } else if (this.config.volume > 15) {
                return "mdi-volume-medium";
            } else if (this.config.volume > 0) {
                return "mdi-volume-low";
            } else {
                return "mdi-volume-mute";
            }
        },
    },
    created() {},
    mounted() {
        // If a preset is available select the first one
        if (this.instrumentPresets.length > 0) {
            this.config.instrument_preset = this.instrumentPresets[0];
        } else {
            this.config.instrument_preset = null;
        }
        // Tone.js does not work with reactive variables. Use $options so it's available but not reactive
        this.initTone(this.config.instrument);
        this.requestMidiAccess();

        this.$options.fileSynths = [];
    },
    methods: {
        initTone(instrument, preset = {}) {
            console.log("initTone", instrument, preset);

            // An old instrument is already setup, disconnect it first
            if (this.$options.synth) {
                this.$options.synth.disconnect();
            }

            this.$options.synth = new Tone.PolySynth(
                Tone[instrument],
                _.get(preset, "config", {})
            ).toDestination();

            // Set the volume on startup. Normalize from 0 to 60 to -30 to +30 range for ToneJS
            this.$options.synth.volume.value = this.config.volume - 30;

            this.$options.recorder = new Tone.Recorder();
            this.$options.synth.connect(this.$options.recorder);
        },
        onClickRecord() {
            this.recording = !this.recording;

            if (this.recording) {
                this.$options.recorder.start();
            } else {
                console.log("Download recording!");
                setTimeout(async () => {
                    // the recorded audio is returned as a blob
                    const recording = await this.$options.recorder.stop();
                    // download the recording by creating an anchor element and blob url
                    const url = URL.createObjectURL(recording);
                    const anchor = document.createElement("a");
                    anchor.download = "recording.webm";
                    anchor.href = url;
                    anchor.click();
                }, 500);
            }
        },
        onUpdateVolume(value) {
            if (this.config.volume >= 0) {
                Tone.Master.mute = false;
            } else {
                Tone.Master.mute = true;
            }
            // Normalize from 0 to 60 to -30 to +30 for ToneJS
            this.$options.synth.volume.value = value - 30;
        },
        onToggleMute() {
            if (this.config.volume > 0) {
                this.config.volume = 0;
            } else {
                this.config.volume = 30;
            }
            this.onUpdateVolume(this.config.volume);
        },
        onChangeInstrument(value) {
            // If a preset is available select the first one
            if (this.instrumentPresets.length > 0) {
                this.config.instrument_preset = this.instrumentPresets[0];
            } else {
                this.config.instrument_preset = null;
            }
            this.initTone(value);
        },
        onChangeInstrumentPreset(value) {
            this.initTone(value, this.config.instrument_preset);
        },
        onKeyDown(e) {
            const note = MIDI.getKeybindingNote(e.key);
            if (note) {
                this.onStartNote(note);
            }
        },
        onKeyUp(e) {
            const note = MIDI.getKeybindingNote(e.key);
            if (note) {
                this.onEndNote(note);
            }
        },
        requestMidiAccess() {
            this.loading = true;
            navigator
                .requestMIDIAccess()
                .then(this.onMIDISuccess, this.onMIDIFailure);
        },
        onMIDISuccess(midiAccess) {
            console.log("MIDI Access allowed. MIDI driver ready!");
            this.loadMidiDevices(midiAccess);

            midiAccess.onstatechange = (event) => {
                this.loadMidiDevices(midiAccess);

                // Print information about the (dis)connected MIDI controller
                console.log(
                    "onstatechange",
                    midiAccess.inputs,
                    event.port.name,
                    event.port.manufacturer,
                    event.port.state
                );
            };

            this.loading = false;
        },
        loadMidiDevices(midiAccess) {
            this.midi = midiAccess;
            this.midiInputs = this.midi.inputs;

            // If we have a physical input then select it by default
            if (this.physicalMidiInputs.length > 0) {
                this.config.input = this.physicalMidiInputs[0].id;
            } else {
                this.config.input = null;
            }

            midiAccess.inputs.forEach((entry) => {
                entry.onmidimessage = this.onMIDIMessage;
            });
        },
        onMIDIFailure(msg) {
            console.error(`Failed to get MIDI access - ${msg}`);
            alert(`Failed to get MIDI access - ${msg}`);
        },
        onMIDIMessage(event) {
            MIDI.onNote = this.onNote;
            MIDI.handleMIDIMessage(event, this.config.input);
        },
        onStartNote(note) {
            this.onNote(note, 1);
        },
        onEndNote(note) {
            this.onNote(note, -1);
        },
        onNote(note, velocity) {
            /* console.log(
                "onNote event",
                "note index: " + note,
                "note name: " + this.noteMap[noteMapIndex] + octave,
                "velocity: " + velocity
            );*/

            // If velocity is disabled then hard set to 1 for full press
            if (velocity > 0 && !this.config.has_velocity) {
                velocity = 1;
            }

            if (!this.activeKeys[note] && velocity > 0) {
                this.activeKeys[note] = true;
                this.$options.synth.triggerAttack(note, Tone.now(), velocity);

                // Determine the last note even if it's a chord
                const filtered = _.pickBy(this.activeKeys, function (value) {
                    return value;
                });
                this.lastNote = Object.keys(filtered).join("+");
            } else {
                this.activeKeys[note] = false;
                this.$options.synth.triggerRelease(note, Tone.now());
            }
        },
        async onFileSelect(e) {
            this.showOverlay = false;
            await this.clearFileQueue();
            console.log("onFileSelect->e", e);
            console.log("onFileSelect->this.config.file", this.config.file);
            if (this.config.file) {
                const url = URL.createObjectURL(this.config.file);
                const midi = await Midi.fromUrl(url);
                const name = midi.name;
                console.log("url", url, "name", name, "midi", midi);
                this.fileLoading = true;
                //get the tracks
                midi.tracks.forEach((track) => {
                    //console.log("track", track);

                    //create a synth for each track
                    /*const synth = new Tone.PolySynth(Tone.Synth, {
                        envelope: {
                            attack: 0.02,
                            decay: 0.1,
                            sustain: 0.3,
                            release: 1,
                        },
                    }).toDestination();
                    this.$options.fileSynths.push(synth);*/

                    console.log("first note", track, track.notes[0]);
                    //schedule all of the events
                    track.notes.forEach((note) => {
                        //console.log("Scheduling...", note);
                        const noteStart = setTimeout(() => {
                            // Turn off the loading visuals once the song actually starts.
                            // Some midis have their first notes start at x seconds and not 0
                            this.fileLoading = false;
                            this.onNote(note.name, note.velocity);

                            setTimeout(() => {
                                this.onNote(note.name, -1);
                            }, note.duration * 1000);
                        }, note.time * 1000);

                        this.$options.fileSynths.push(noteStart);
                    }, this);
                }, this);
            } else {
                this.clearFileQueue();
            }
        },
        async clearFileQueue() {
            while (this.$options.fileSynths.length) {
                const interval = this.$options.fileSynths.shift();
                await clearInterval(interval);
            }
            this.$options.fileSynths = [];
        },
    },
};
</script>

<style lang="scss" scoped>
.piano-interact-overlay {
    bottom: 0;
    top: -200px;
    padding-top: 1em;
    padding-bottom: 1em;
    position: relative;
    background: #000c;
    z-index: 4;
    text-align: center;
    width: 100%;
}
.disabled {
    opacity: 0.7;
}
.main-container {
    display: block;
    padding: 15px;
}

.main-container--skin {
    background: #111;
    color: #fff;
    border-radius: 15px;

    .controls {
        border: 10px inset #555;
        margin: 1em;
        border-radius: 15px;
    }
}

.piano-config {
    flex-grow: 0;
}
.visual-container {
    overflow-x: auto;
    width: 100%;
}
.piano-container {
    margin-top: 5px;
    display: inline-flex;
    flex: 1 1 auto;
    flex-flow: column;
    max-height: 300px;
    min-width: 100%;
}
.piano-key-container {
    display: flex;
    flex-grow: 0;
    z-index: 1;
}
</style>
