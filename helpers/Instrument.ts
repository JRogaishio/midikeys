export default class Instrument {
    public static presets = {
        AMSynth: [
            { name: "Default", config: {} },
            {
                name: "Harmonics",
                config: {
                    harmonicity: 3.999,
                    oscillator: {
                        type: "square",
                    },
                    envelope: {
                        attack: 0.03,
                        decay: 0.3,
                        sustain: 0.7,
                        release: 0.8,
                    },
                    modulation: {
                        volume: 12,
                        type: "square6",
                    },
                    modulationEnvelope: {
                        attack: 2,
                        decay: 3,
                        sustain: 0.8,
                        release: 0.1,
                    },
                },
            },
        ],
        DuoSynth: [{ name: "Default", config: {} }],
        FMSynth: [
            { name: "Default", config: {} },
            {
                name: "ElectricCello",
                config: {
                    harmonicity: 3.01,
                    modulationIndex: 14,
                    oscillator: {
                        type: "triangle",
                    },
                    envelope: {
                        attack: 0.2,
                        decay: 0.3,
                        sustain: 0.1,
                        release: 1.2,
                    },
                    modulation: {
                        type: "square",
                    },
                    modulationEnvelope: {
                        attack: 0.01,
                        decay: 0.5,
                        sustain: 0.2,
                        release: 0.1,
                    },
                },
            },
        ],
        MembraneSynth: [{ name: "Default", config: {} }],
        MetalSynth: [{ name: "Default", config: {} }],
        ModulationSynth: [{ name: "Default", config: {} }],
        MonoSynth: [
            { name: "Default", config: {} },
            {
                name: "Piano",
                config: {
                    oscillator: {
                        type: "sawtooth",
                    },
                    filter: {
                        Q: 2,
                        type: "lowpass",
                        rolloff: -12,
                    },
                    envelope: {
                        attack: 0.005,
                        decay: 3,
                        sustain: 0,
                        release: 0.45,
                    },
                    filterEnvelope: {
                        attack: 0.001,
                        decay: 0.32,
                        sustain: 0.9,
                        release: 3,
                        baseFrequency: 700,
                        octaves: 2.3,
                    },
                },
            },
            {
                name: "BassGuitar",
                config: {
                    oscillator: {
                        type: "fmsquare5",
                        modulationType: "triangle",
                        modulationIndex: 2,
                        harmonicity: 0.501,
                    },
                    filter: {
                        Q: 1,
                        type: "lowpass",
                        rolloff: -24,
                    },
                    envelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.4,
                        release: 2,
                    },
                    filterEnvelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.8,
                        release: 1.5,
                        baseFrequency: 50,
                        octaves: 4.4,
                    },
                },
            },
        ],
        Synth: [
            { name: "Default", config: {} },
            {
                name: "Marimba",
                config: {
                    oscillator: {
                        partials: [1, 0, 2, 0, 3],
                    },
                    envelope: {
                        attack: 0.001,
                        decay: 1.2,
                        sustain: 0,
                        release: 1.2,
                    },
                },
            },
            {
                name: "Steelpan",
                config: {
                    oscillator: {
                        type: "fatcustom",
                        partials: [0.2, 1, 0, 0.5, 0.1],
                        spread: 40,
                        count: 3,
                    },
                    envelope: {
                        attack: 0.001,
                        decay: 1.6,
                        sustain: 0,
                        release: 1.6,
                    },
                },
            },
            {
                name: "TreeTrunk",
                config: {
                    oscillator: {
                        type: "sine",
                    },
                    envelope: {
                        attack: 0.001,
                        decay: 0.1,
                        sustain: 0.1,
                        release: 1.2,
                    },
                },
            },
        ],
    };

    public static getPresets(instrument) {
        return this.presets[instrument] || [];
    }
}
