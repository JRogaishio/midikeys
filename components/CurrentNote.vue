<template>
    <div class="current-note-container">
        <span class="note-label">Last Note</span>
        <span class="note">{{ value || "---" }}</span>
    </div>
</template>

<script>
export default {
    name: "PianoMetronome",
    components: {},
    props: {
        value: { type: String, required: false, default: "" },
    },
    data() {},
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {},
};
</script>

<style lang="scss" scoped>
.current-note-container {
    outline: 5px solid #111;
    background: #222;
    border-radius: 5px;
    text-align: center;
    min-height: 40px;
}
.note-label {
    color: #fff;
    font-size: 0.75em;
    float: left;
    margin-top: 10px;
    margin-left: 15px;
}
.note {
    color: #ff9100;
    text-shadow: #000 1px 1px 1px;
    font-size: 1.5em;
    font-weight: bold;

    display: block;
    max-width: 5em;
    overflow: hidden;
    text-overflow: ellipsis;
    float: right;
    margin-right: 1em;
}
</style>
