<template>
    <div class="current-note-container">
        <v-menu>
            <template #activator="{ props }">
                <v-btn
                    block
                    color="default"
                    v-bind="props"
                    prepend-icon="mdi-monitor-shimmer"
                >
                    Display Settings
                </v-btn>
            </template>
            <v-card>
                <v-card-text>
                    <v-switch
                        :model-value="skin"
                        label="Keyboard Skin"
                        @click="$emit('update:skin', !skin)"
                    >
                    </v-switch>
                    <v-switch
                        :model-value="visualizer"
                        label="Visualizer"
                        @click="$emit('update:visualizer', !visualizer)"
                    ></v-switch>
                </v-card-text>
            </v-card>
        </v-menu>
    </div>
</template>

<script>
export default {
    name: "PianoMetronome",
    components: {},
    props: {
        skin: { type: Boolean, required: false, default: false },
        visualizer: { type: Boolean, required: false, default: false },
    },
    data() {},
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {},
};
</script>
