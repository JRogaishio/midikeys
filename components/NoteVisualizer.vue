<template>
    <div ref="pixiContainer" class="notes-container animated-background">
        <v-progress-circular
            v-if="loading"
            class="my-8"
            indeterminate
            size="64"
        ></v-progress-circular>
        <div v-show="!loading" ref="pixiNotes"></div>
    </div>
</template>

<script>
import _ from "lodash";
import {
    Application,
    Sprite,
    Graphics,
    FillGradient,
    Assets,
    Texture,
    BlurFilter,
} from "pixi.js";
import MIDI from "~/helpers/MIDI";
import Visualizer from "~/helpers/Visualizer";

export default {
    name: "Piano",
    components: {},
    props: {
        value: { type: Array, required: true },
        activeOctaves: {
            type: Array,
            required: false,
            default: () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
        loading: { type: Boolean, required: false, default: false },
    },
    emits: [],
    data() {
        return {
            app: null,
            canvas: null,
            activeNotes: [],
            frameState: {
                addNote: false,
            },
        };
    },
    watch: {
        loading(val) {
            if (!val) {
                this.initPixi();
            }
        },
    },
    created() {},
    mounted() {
        this.initPixi();
    },
    methods: {
        async initPixi() {
            if (this.$refs.pixiNotes) {
                if (this.app) {
                    // Remove the old canvas so it doesn't stick around
                    this.$refs.pixiNotes.removeChild(this.canvas);
                    this.app.destroy();
                }
                // The application will create a renderer using WebGL, if possible,
                // with a fallback to a canvas render. It will also setup the ticker
                // and the root stage PIXI.Container
                this.app = new Application();

                // Wait for the Renderer to be available
                await this.app.init({
                    backgroundAlpha: 0,
                    resizeTo: this.$refs.pixiContainer,
                });

                // The application will create a canvas element for you that you
                // can then insert into the DOM
                this.canvas = this.$refs.pixiNotes.appendChild(this.app.canvas);

                // Listen for frame updates
                this.app.ticker.add(this.renderFrame);
            } else {
                console.warn(
                    "Container for Piano NoteVisualizer is not ready!"
                );
            }
        },
        renderFrame() {
            // Check for any new notes that we need to add
            for (const keyIndex in this.value) {
                // if (this.value[keyIndex] && this.frameState.addNote) {
                if (this.value[keyIndex]) {
                    this.addNoteSprite(MIDI.noteToIndex(keyIndex));
                }
            }
            // Only add another note sprite every other frame if we're actively holding a key down
            // this.frameState.addNote = !this.frameState.addNote;

            // each frame we spin the noteSprite around a bit
            //noteSprite.rotation += 0.01;
            for (const noteIndex in this.activeNotes) {
                this.activeNotes[noteIndex].y -= 20;
                if (this.activeNotes[noteIndex].y < -60) {
                    this.activeNotes[noteIndex].destroy();
                    this.activeNotes.splice(noteIndex, 1);
                    continue;
                }
            }
        },
        addNoteSprite(keyIndex = 0) {
            // This creates a texture from a 'noteSprite.png' image
            //const noteSprite = new Sprite(Texture.WHITE);
            //noteSprite.height = 20;
            //noteSprite.width = 20;
            const noteSprite = new Graphics()
                .roundRect(0, 0, 20, 50, 5)
                .fill("#ffffff");

            // 12 notes per octave
            const totalKeys = this.activeOctaves.length * 12;
            // Offset the x value by where the first octave starts
            const x = keyIndex - (this.activeOctaves[0] * 12 - 12);

            noteSprite.x = (x / totalKeys) * this.app.renderer.width;
            noteSprite.y = this.app.renderer.height + 10;
            noteSprite.width = this.app.renderer.width / totalKeys;
            noteSprite.height = 50;
            noteSprite.tint = Visualizer.keyColor(keyIndex);

            // Add the noteSprite to the scene we are building
            this.app.stage.addChild(noteSprite);
            this.activeNotes.push(noteSprite);
        },
    },
};
</script>

<style lang="scss" scoped>
.notes-container {
    height: 150px;
    text-align: center;
}
.animated-background {
    background: linear-gradient(220deg, #639b36, #36779b);
    background-size: 400% 400%;
    animation: ScrollingBackground 20s ease infinite;
    max-height: 25%;
}

@keyframes ScrollingBackground {
    0% {
        background-position: 0% 51%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 51%;
    }
}
</style>
