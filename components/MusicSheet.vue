<template>
    <div class="sheet-container">
        <v-menu :close-on-content-click="false">
            <template #activator="{ props }">
                <v-btn
                    block
                    color="default"
                    v-bind="props"
                    prepend-icon="mdi-music"
                >
                    Paste Music
                </v-btn>
            </template>
            <v-card>
                <v-card-text>
                    <v-textarea
                        v-model="sheetText"
                        label="Music in MusTex format"
                        placeholder="{TEMPO:120} C4 C5 C6 [C4C5C6]"
                        persistent-placeholder
                    ></v-textarea>
                    <v-progress-linear
                        :model-value="(commandIndex / commands.length) * 100"
                    ></v-progress-linear>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="onClickPlay">
                        <span v-if="playInterval !== null">Pause</span>
                        <span
                            v-if="playInterval === null && commandIndex === 0"
                        >
                            Play
                        </span>
                        <span v-if="playInterval === null && commandIndex > 0">
                            Resume
                        </span>
                    </v-btn>
                    <v-btn
                        :disabled="commandIndex === 0"
                        @click="onClickRestart"
                        >Restart
                    </v-btn>
                    <v-btn
                        :disabled="playInterval === null"
                        @click="onClickStop"
                        >Stop
                    </v-btn>
                    <v-btn variant="text" @click="showHelp = !showHelp"
                        >MusTex Help</v-btn
                    >
                </v-card-actions>
                <v-card-text v-if="showHelp" class="note-help">
                    <p>
                        <v-table>
                            <thead>
                                <tr>
                                    <th class="text-left">Example</th>
                                    <th class="text-left">How it sounds</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>{TEMPO:100}</code></td>
                                    <td>Change the tempo or bpm to 100</td>
                                </tr>
                                <tr>
                                    <td><code>C5</code></td>
                                    <td>Play the C note of the 5th octave</td>
                                </tr>
                                <tr>
                                    <td><code>C#5</code></td>
                                    <td>
                                        Play the C&sharp; note of the 5th octave
                                    </td>
                                </tr>
                                <tr>
                                    <td><code>[C5C6C7]</code></td>
                                    <td>Play notes together</td>
                                </tr>
                                <tr>
                                    <td><code>C5C6C7</code></td>
                                    <td>Play notes one after the other</td>
                                </tr>
                                <tr>
                                    <td><code>C5 C6 C7</code></td>
                                    <td>
                                        Play notes one after the other with a
                                        short pause in between
                                    </td>
                                </tr>
                                <tr>
                                    <td><code>C5|C6|C7</code></td>
                                    <td>
                                        Play notes one after the other with a
                                        long pause in between
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <code>C5&para;<br />C6</code>
                                    </td>
                                    <td>
                                        Paragraph breaks create a medium pause
                                        in between notes
                                    </td>
                                </tr>
                                <tr>
                                    <td><code>C5^2</code></td>
                                    <td>
                                        Play and hold the C note for twice as
                                        long. You can go up to
                                        <code>C5^99</code>
                                    </td>
                                </tr>
                                <tr>
                                    <td><code>C5^0.5</code></td>
                                    <td>
                                        Play and hold the C note for half as
                                        long. You can go down to
                                        <code>C5^0.2</code>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </p>
                </v-card-text>
            </v-card>
        </v-menu>
    </div>
</template>

<script>
export default {
    name: "MusicSheet",
    components: {},
    props: {},
    data() {
        return {
            sheetText: "",
            playInterval: null,
            commandIndex: 0,
            tempo: 100,
            commands: [],
            showHelp: false,
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {
        onTick() {
            if (typeof this.commands[this.commandIndex] !== "undefined") {
                const command = this.commands[this.commandIndex];

                this.commandIndex++;

                switch (command.type) {
                    case "note":
                        // console.log("Sending notes ", command.notes);
                        for (const noteCommand of command.notes) {
                            const modifier = noteCommand.modifier || {
                                key: null,
                                value: null,
                            };

                            let duration = 1;

                            // `^` = Note hold modifier. Make sure the value is a valid number and greater than 0.2
                            // We have a minimum hold of 20ms
                            if (
                                modifier.key === "^" &&
                                !isNaN(modifier.value)
                            ) {
                                duration = modifier.value;
                            }

                            // Normalize the duration from 0.2 to 99
                            duration = duration >= 0.2 ? duration : 0.2;
                            duration = duration <= 99 ? duration : 99;

                            this.$emit("note:start", noteCommand.note);
                            // Hold the note for 100ms
                            setTimeout(() => {
                                this.$emit("note:end", noteCommand.note);
                            }, 100 * duration);
                        }
                        break;
                    case "pause":
                        // console.log("PAUSE");
                        // Do nothing
                        break;
                    case "command":
                        if (command.action === "TEMPO") {
                            // Set the temp, and reset the interval timing
                            this.tempo = command.value;
                            // console.log("Set tempo to ", command.value);
                            clearInterval(this.playInterval);
                            this.playInterval = setInterval(
                                this.onTick.bind(this),
                                60000 / (this.tempo * 3)
                            );
                        }

                        // Immediately call the next position since commands shouldn't interfere with timing
                        this.onTick();
                        break;
                }
            } else {
                console.warn("Reached the end of the music");
                clearInterval(this.playInterval);
                this.playInterval = null;
                this.commands = [];
                this.commandIndex = 0;
            }
        },
        parseSheet() {
            this.commands = [];
            this.commandIndex = 0;

            // Sheet parsing regex for various allowed commands
            const regex = {
                command: `(?<command>{.*?})`,
                chord: `(?<chord>\\[(?:[A-G]#?[0-9][0-9]?(?:\\^[0-9\\.]+)?)+\\])`,
                pause: `(?<pause>\\|)`,
                note: `(?<note>[A-G]#?[0-9][0-9]?)`,
                noteModifier: `(?<modifier>(?<modifier_key>[\\^\\+\\-])(?<modifier_value>[0-9\\.]+))?`,
                flags: `gi`,
            };

            const exp = new RegExp(
                `${regex.command}|${regex.chord}|${regex.pause}|${regex.note}${regex.noteModifier}`,
                regex.flags
            );

            // Parse the notes
            // Convert all spaces into a pause character aka `|`
            const commands = this.sheetText
                .trim()
                .replaceAll(/\|/gi, "|||") // Convert pause characters to a long pause aka triple beat pause
                .replaceAll(/\s/gi, "|") // Convert spaces to single short pause characters
                .replaceAll(/\n/gi, "||") // Convert newlines to a medium pause aka double beat pause
                .matchAll(exp);

            //console.log("commands", commands);
            for (const command of commands) {
                if (command.groups.chord) {
                    const noteExp = new RegExp(
                        `${regex.note}${regex.noteModifier}`,
                        regex.flags
                    );
                    const chordNotes = command.groups.chord.matchAll(
                        noteExp,
                        regex.flags
                    );

                    const notes = [];

                    for (const chordNote of chordNotes) {
                        notes.push({
                            note: chordNote.groups.note,
                            modifier: {
                                key: chordNote.groups.modifier_key || null,
                                value: chordNote.groups.modifier_value || null,
                            },
                        });
                    }

                    this.commands.push({ type: "note", notes: notes });
                } else if (command.groups.note) {
                    this.commands.push({
                        type: "note",
                        notes: [
                            {
                                note: command.groups.note,
                                modifier: {
                                    key: command.groups.modifier_key || null,
                                    value:
                                        command.groups.modifier_value || null,
                                },
                            },
                        ],
                    });
                } else if (command.groups.command) {
                    const commandMatch = command.groups.command.match(
                        /^{(?<action>[A-Z]+)\:(?<value>.*?)}$/i
                    );
                    this.commands.push({
                        type: "command",
                        action: commandMatch.groups.action,
                        value: commandMatch.groups.value,
                    });
                } else if (command.groups.pause) {
                    this.commands.push({ type: "pause" });
                }
            }
        },
        onClickStop() {
            if (this.playInterval !== null) {
                clearInterval(this.playInterval);
                this.playInterval = null;
            }
            this.commands = [];
            this.commandIndex = 0;
        },
        onClickRestart() {
            if (this.playInterval !== null) {
                clearInterval(this.playInterval);
                this.playInterval = null;
            }
            // Restart from beginning
            this.parseSheet();
            this.playInterval = setInterval(
                this.onTick.bind(this),
                60000 / (this.tempo * 3)
            );
        },
        onClickPlay() {
            // Pause
            if (this.playInterval !== null) {
                clearInterval(this.playInterval);
                this.playInterval = null;
            } else if (
                this.commandIndex === 0 &&
                this.commandIndex - 1 <= this.commands.length
            ) {
                // Play
                this.parseSheet();
                this.playInterval = setInterval(
                    this.onTick.bind(this),
                    60000 / (this.tempo * 3)
                );
            } else {
                // Resume
                this.playInterval = setInterval(
                    this.onTick.bind(this),
                    60000 / (this.tempo * 3)
                );
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.note-help {
    max-height: 200px;
    overflow: hidden;
    overflow-y: scroll;
}
</style>
