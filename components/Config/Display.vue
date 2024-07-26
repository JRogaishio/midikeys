<template>
    <div class="current-note-container">
        <v-menu :close-on-content-click="false">
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
                    <v-select
                        :model-value="keyDisplay"
                        label="Key style"
                        :items="[
                            { id: 'notes', name: 'Show Notes' },
                            {
                                id: 'note_octaves',
                                name: 'Show Notes and Octaves',
                            },
                            { id: 'keys', name: 'Show Keybindings' },
                            {
                                id: 'key_octaves',
                                name: 'Show Keybindings and Octaves',
                            },
                            {
                                id: 'octaves',
                                name: 'Show Octaves',
                            },
                            { id: 'none', name: 'Blank' },
                        ]"
                        item-title="name"
                        item-value="id"
                        prepend-inner-icon="mdi-cog"
                        @update:modelValue="$emit('update:key-display', $event)"
                    ></v-select>
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
        keyDisplay: { type: String, required: false, default: "notes" },
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
