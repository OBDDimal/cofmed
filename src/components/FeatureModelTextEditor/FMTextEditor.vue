<template>
    <v-col class='text-right'>
        <v-btn
            id='convert-model-to-text'
            :x-large='$vuetify.display.mdAndUp'
            class='ma-2'
            color='primary'
            elevation='2'
            @click='$emit("convertModelToText")'
        >
            <v-icon>mdi-code-less-than</v-icon>
            <v-tooltip
                activator='parent'
                location='bottom'
            >Convert Model to Text
            </v-tooltip>
        </v-btn>
        <v-btn
            id='convert-text-to-model'
            :x-large='$vuetify.display.mdAndUp'
            class='ma-2'
            color='primary'
            elevation='2'
            @click='$emit("convertTextToModel", textCode)'
        >
            <v-icon>mdi-code-greater-than</v-icon>
            <v-tooltip
                activator='parent'
                location='bottom'
            >Convert Text to Model
            </v-tooltip>
        </v-btn>
    </v-col>
    <MonacoEditor
        v-model:value='textCode'
        :options='MONACO_OPTIONS'
        :language='HELLO_LANG_ID()'
        theme='vs-dark'
        @editorDidMount='editorDidMount'
    ></MonacoEditor>
</template>

<script>
import MonacoEditor from 'monaco-editor-vue3';
import { connectToLs, createModel, registerLanguage } from '@/services/languageClient';
import { HELLO_LANG_ID, MONACO_OPTIONS } from '@/classes/constants';

export default {
    computed: {
        MONACO_OPTIONS() {
            return MONACO_OPTIONS
        }
    },
    components: {
        MonacoEditor
    },
    props: {
        code: undefined
    },

    created() {
        this.textCode = this.code;
    },

    data() {
        return {
            textCode: ''
        };
    },
    watch: {
        code() {
            this.textCode = this.code;
        }
    },

    methods: {
        HELLO_LANG_ID() {
            return HELLO_LANG_ID
        },
        editorDidMount(editor) {
            connectToLs();
            registerLanguage();
            const model = createModel();
            editor.setModel(model);
            editor.focus();
        }
    }
};
</script>


<style scoped></style>
