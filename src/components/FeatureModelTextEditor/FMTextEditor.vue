<script>
import MonacoEditor from 'monaco-editor-vue3';

export default {
    components: {
        MonacoEditor,
    },
    props: {
        code: undefined,
    },

    created() {
        this.textCode = this.code
    },

    data() {
        return {
            options: {
                colorDecorators: true,
                lineHeight: 24,
                tabSize: 4,
            },
            textCode: '',
        };
    },
};
</script>

<template>
    <MonacoEditor
        theme="vs-dark"
        :options="options"
        language="javascript"
        v-model:value="code"
    ></MonacoEditor>
</template>

<style scoped></style>
