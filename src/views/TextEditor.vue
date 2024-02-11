<template>
    <input
        id='filePicker'
        accept='.xml'
        class='d-none'
        type='file'
        @change='onFileInputChanged'
    >
    <MonacoEditor
        theme='vs-dark'
        :options='options'
        language='javascript'
        :width=innerWidth
        :height=innerHeight
        v-model:value='test'
    ></MonacoEditor>
</template>

<script>
import MonacoEditor from 'monaco-editor-vue3';

export default {
    name: 'FeatureModel',

    components: {
        MonacoEditor
    },

    props: {
        id: undefined,
        collaborationKey: undefined
    },

    data() {
        return {
            options: {
                colorDecorators: true,
                lineHeight: 24,
                tabSize: 2
            },
            test: ''
        };
    }
};
</script>
<style lang='scss' scoped></style>
