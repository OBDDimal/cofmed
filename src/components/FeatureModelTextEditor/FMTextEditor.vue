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
                tabSize: 2,
            },
            test: '',
        };
    },
};
</script>

<template>
    <h3>Monaco Editor Vue3</h3>
    <MonacoEditor
        theme="vs-dark"
        :options="options"
        language="javascript"
        :width="800"
        :height="600"
        v-model:value="test"
    ></MonacoEditor>
</template>

<style scoped></style>
