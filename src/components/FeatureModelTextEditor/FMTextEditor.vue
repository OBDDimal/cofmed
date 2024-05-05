<script>
import MonacoEditor from 'monaco-editor-vue3';

export default {
    components: {
        MonacoEditor,
    },
    data() {
        return {
            options: {
                colorDecorators: true,
                lineHeight: 24,
                tabSize: 4,
            },
            code: '',
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
