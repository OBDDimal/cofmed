<script>
import { defineComponent, ref, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror'
import { xml } from '@codemirror/lang-xml'
import { oneDark } from '@codemirror/theme-one-dark'
import {getLanguageClient} from '@/services/UVLLanguageClient.service'
import {getLanguageServer} from '@/services/LSP.service';

export default defineComponent({
    components: {
        Codemirror
    },

    props: {
        code: String
    },

    watch: {
        code() {
            this.textCode = this.code;
        },
    },

    data() {
        return{

        }
    },

    setup() {
        const textCode = ref(`console.log('Hello, world!')`);
        // this.textCode = this.code;
        const languageClient = getLanguageServer();
        const extensions = [xml(), /*languageClient,*/ oneDark];

        // Codemirror EditorView instance ref
        const view = shallowRef();
        const handleReady = (payload) => {
            view.value = payload.view;
        }

        // Status is available at all times via Codemirror EditorView
        const getCodemirrorStates = () => {
            const state = view.value.state;
            const ranges = state.selection.ranges;
            const selected = ranges.reduce((r, range) => r + range.to - range.from, 0);
            const cursor = ranges[0].anchor;
            const length = state.doc.length;
            const lines = state.doc.lines;
            // more state info ...
            // return ...
        }

        return {
            textCode: textCode,
            extensions,
            handleReady,
            log: console.log
        }
    },

    mounted() {
        this.textCode = this.code;
    }

})
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
    <codemirror
        v-model="textCode"
        placeholder="Code goes here..."
        :style="{ height: '900px' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
        @ready="handleReady"
        @change="log('change', $event)"
        @focus="log('focus', $event)"
        @blur="log('blur', $event)"
    />
</template>

<style scoped></style>
