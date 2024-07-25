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
                        placeholder="{TEMPO:120} C4 C5 C6 [C4C5C6]"
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
                </v-card-actions>
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
                            this.$emit("note:start", noteCommand.note);
                            // Hold the note for 100ms
                            setTimeout(() => {
                                this.$emit("note:end", noteCommand.note);
                            }, 100 * noteCommand.duration);
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
            // Parse the notes
            // Convert all spaces into a pause character aka `|`
            const commands = this.sheetText
                .trim()
                .replaceAll(/\n/gi, "")
                .replaceAll(/\s/gi, "|")
                .matchAll(
                    /(?<command>{.*?})|(?<chord>\[(?:[A-G]#?[0-9][0-9]?(?:\^[0-9]+)?)+\])|(?<pause>\|)|(?<note>[A-G]#?[0-9][0-9]?)(?<duration>\^[0-9]+)?/gi
                );

            //console.log("commands", commands);
            for (const command of commands) {
                if (command.groups.chord) {
                    const chordNotes = command.groups.chord.matchAll(
                        /(?<note>[A-G]#?[0-9][0-9]?)(?<duration>\^[0-9]+)?/gi
                    );

                    const notes = [];

                    for (const chordNote of chordNotes) {
                        const duration = chordNote.groups.duration || "^1";
                        notes.push({
                            note: chordNote.groups.note,
                            duration: duration.substr(1),
                        });
                    }

                    this.commands.push({ type: "note", notes: notes });
                } else if (command.groups.note) {
                    const duration = command.groups.duration || "^1";
                    this.commands.push({
                        type: "note",
                        notes: [
                            {
                                note: command.groups.note,
                                duration: duration.substr(1),
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
