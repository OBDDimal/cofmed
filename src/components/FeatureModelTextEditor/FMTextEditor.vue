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
    watch: {
        code() {
            this.textCode = this.code
        },
    },
};
</script>

<template>
    <v-col class="text-right">
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
                activator="parent"
                location="bottom"
            >Convert Model to Text</v-tooltip>
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
                activator="parent"
                location="bottom"
            >Convert Text to Model</v-tooltip>
        </v-btn>
    </v-col>
    <MonacoEditor
        theme="vs-dark"
        :options="options"
        language="xml"
        v-model:value="textCode"
    ></MonacoEditor>
</template>

<style scoped></style>
