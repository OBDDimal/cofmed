<template>
    <input
        id='filePicker'
        accept='.xml'
        class='d-none'
        type='file'
        @change='onFileInputChanged'
    >
    <div class='texteditor'>
        <MonacoEditor
            theme='vs-dark'
            :options='options'
            language='javascript'
            v-model:value='test'
        ></MonacoEditor>
    </div>

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
    },

    methods: {
        onFileInputChanged() {
            return;
        }
    }
};
</script>
<style lang='scss' scoped>

.texteditor {
    width: 10%;
    height: 100%;
    overflow: hidden;
}
</style>
