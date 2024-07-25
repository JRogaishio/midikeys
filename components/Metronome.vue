<template>
    <div>
        <v-slider
            v-model="bpm"
            min="20"
            max="200"
            step="1"
            @update:modelValue="onChangeInterval"
        >
            <template #prepend>
                <v-btn
                    icon
                    :class="'metronome ' + (showTick ? 'metronome--tick' : '')"
                    :color="isRunning ? 'red' : ''"
                    @click="onClick"
                    ><v-icon :class="position > 0 ? 'mdi-flip-h' : ''">
                        mdi-metronome
                    </v-icon>
                </v-btn>
            </template>
            <template #append>
                <v-text-field
                    v-model="bpm"
                    density="compact"
                    style="width: 4.75em"
                    type="number"
                    variant="outlined"
                    hide-details
                    min="20"
                    max="200"
                >
                </v-text-field>
                <span class="ml-1">bpm</span>
            </template>
        </v-slider>
    </div>
</template>

<script>
import _ from "lodash";
import * as Tone from "tone";

export default {
    name: "PianoMetronome",
    components: {},
    props: {
        loading: { type: Boolean, required: false, default: false },
        // ToneJS volume works from -30 to 30 where 0 is middle
        volume: { type: Number, required: false, default: 0 },
    },
    data() {
        return {
            bpm: 50,
            beatInterval: null,
            showTick: false,
            position: 0,
        };
    },
    computed: {
        isRunning() {
            return this.beatInterval !== null;
        },
    },
    watch: {
        volume(value) {
            this.$options.synth.volume.value = value;

            if (value > -30) {
                Tone.Master.mute = false;
            } else {
                Tone.Master.mute = true;
            }
        },
    },
    created() {},
    mounted() {
        this.$options.synth = new Tone.NoiseSynth({
            noise: {
                type: "pink",
                playbackRate: 5,
            },
            envelope: {
                attack: 0.001,
                decay: 0.3,
                sustain: 0,
                release: 0.3,
            },
        }).toDestination();

        this.$options.synth.volume.value = this.volume;
    },
    methods: {
        onChangeInterval() {
            // If it's already running then stop and restart with the new interval
            if (this.beatInterval !== null) {
                clearInterval(this.beatInterval);

                // 60,000 seconds in a minute divided by the bpm to get the tick rate
                this.beatInterval = setInterval(
                    this.onTick.bind(this),
                    60000 / this.bpm
                );
            }
        },
        onTick() {
            this.$options.synth.triggerAttackRelease("8n");
            this.showTick = true;
            this.position = this.position > 0 ? 0 : 1;

            setTimeout(() => {
                this.showTick = false;
            }, 100);
        },
        onClick() {
            // Stop
            if (this.beatInterval !== null) {
                clearInterval(this.beatInterval);
                this.beatInterval = null;
            } else {
                // 60,000 seconds in a minute divided by the bpm to get the tick rate
                this.beatInterval = setInterval(
                    this.onTick.bind(this),
                    60000 / this.bpm
                );
            }
        },
    },
};
</script>

<style lang="scss">
.metronome--tick {
    animation: ripple 100ms linear;
}

@keyframes ripple {
    to {
        transform: scale(1.25);
    }
}
</style>
