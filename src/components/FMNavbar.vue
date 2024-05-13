<template>
    <v-app-bar app>
        <v-app-bar-title style='flex: initial'>
            <v-avatar class='hidden-xs-only mr-3'>
                <v-img
                    :src="
                        theme.global.current.value.dark
                            ? '/ddueruem_logo_dark.svg'
                            : '/ddueruem_logo.svg'
                    "
                    alt='logo'
                />
            </v-avatar>
            variability.dev
        </v-app-bar-title>
        <div class='hidden-sm-and-down ml-5'>
            <v-menu
            >
                <template v-slot:activator='{ props }'>
                    <v-btn
                        id='feature-model-navbar-save'
                        class='mx-1'
                        prepend-icon='mdi-menu'
                        v-bind='props'
                    >
                        File
                    </v-btn>
                </template>

                <v-list density='compact'>
                    <v-list-item prepend-icon='mdi-file-document-plus' title='Open Feature Model'
                                 @click='$emit("openFile")'>
                    </v-list-item>
                    <v-list-item :title='isFileLoaded ? "Open New Model" : "Open Small Model"' prepend-icon='mdi-file'
                                 @click='$emit("newEmptyModel", !isFileLoaded)'>
                    </v-list-item>
                    <v-list-item v-if='isFileLoaded' prepend-icon='mdi-file-cog'
                                 title='Start Configurator' @click='$emit("openConf")'
                    >
                    </v-list-item>
                    <v-list-item v-if='isFileLoaded' :prepend-icon="!isSaveAvailable
                                    ? 'mdi-content-save'
                                    : 'mdi-content-save-edit'"
                                 title='Save Model to Local Storage' @click='$emit("localStorage")'>
                    </v-list-item>

                    <v-menu location='end'
                    >
                        <template v-slot:activator='{ props }'>
                            <v-list-item v-if='isFileLoaded' prepend-icon='mdi-download' title='Download'
                                         v-bind='props'>
                            </v-list-item>
                        </template>
                        <v-list density='compact'>
                            <v-list-item prepend-icon='mdi-download'
                                         title='XML' @click='$emit("download", "xml")'>
                            </v-list-item>
                            <v-list-item prepend-icon='mdi-download'
                                         title='UVL' @click='$emit("download", "uvl")'>
                            </v-list-item>
                            <v-list-item prepend-icon='mdi-download'
                                         title='DIMACS' @click='$emit("download", "dimacs")'>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <v-list-item v-if='isFileLoaded' prepend-icon='mdi-download'
                                 title='Download Model as SVG' @click='$emit("download-svg")'>
                    </v-list-item>
                </v-list>
            </v-menu>
            <view-menu
                :direction='direction'
                :editing='true'
                :is-file-loaded='isFileLoaded'
                :location='"end"'
                @fitToView='$emit("fitToView")'
                @nonSemanticEditing='(value) => $emit("nonSemanticEditing", value)'
                @quickEdit='(value) => $emit("quickEdit", value)'
                @resetView='(levels, maxChildren) => $emit("resetView", levels, maxChildren)'
                @semanticEditing='(value) => $emit("semanticEditing", value)'
                @shortName='(value) => $emit("shortName", value)'
                @spaceBetweenParentChild='(value) => $emit("spaceBetweenParentChild", value)'
                @spaceBetweenSiblings='(value) => $emit("spaceBetweenSiblings", value)'
                @toggleDirection='$emit("toggleDirection")'
            >

            </view-menu>
            <v-btn
                v-if='false'
                :disabled='!isUndoAvailable || !editRights'
                class='mx-1'
                prepend-icon='mdi-backup-restore'
                @click='discardChangesConfirmDialog = true'
            >
                Discard Changes
            </v-btn>
            <v-btn
                id='feature-model-navbar-undo'
                :disabled='!isUndoAvailable || !editRights'
                class='mx-1'
                prepend-icon='mdi-undo'
                @click="$emit('undo')"
            >
                Undo
            </v-btn>
            <v-btn
                :disabled='!isRedoAvailable || !editRights'
                class='mx-1'
                prepend-icon='mdi-redo'
                @click="$emit('redo')"
            >
                Redo
            </v-btn>

            <v-btn
                id='feature-model-navbar-collaboration'
                :disabled='collaborationStatus || !isFileLoaded'
                class='mx-1'
                prepend-icon='mdi-account-multiple'
                @click="$emit('show-collaboration-dialog')"
            >
                Collaboration
            </v-btn>

            <v-btn
                id='tutorial-mode-button'
                :disabled='!isFileLoaded'
                class='mx-1'
                prepend-icon='mdi-school'
                @click="$emit('show-tutorial')"
            >
                Tutorial
            </v-btn>

            <v-btn
                :disabled='!isFileLoaded'
                :prepend-icon="isServiceAvailable ? 'mdi-wifi' : 'mdi-wifi-off'"
                class='mx-1'
                style='pointer-events: none'
            >
                Service Status
            </v-btn>


        </div>
        <v-spacer></v-spacer>
        <div class='hidden-md-and-up'>
            <v-btn
                :icon="
                    theme.global.current.value.dark
                        ? 'mdi-brightness-7'
                        : 'mdi-brightness-4'
                "
                @click='toggleTheme'
            >
            </v-btn>

            <v-menu :close-on-content-click='false'>
                <template v-slot:activator='{ props }'>
                    <v-btn
                        id='feature-model-navbar-save'
                        class='mx-1'
                        prepend-icon='mdi-menu'
                        v-bind='props'
                    >
                    </v-btn>
                </template>
                <v-menu>
                    <template v-slot:activator='{ props }'>
                        <v-btn
                            id='feature-model-navbar-save'
                            class='mx-1'
                            prepend-icon='mdi-menu'
                            v-bind='props'
                        >
                            File
                        </v-btn>
                    </template>

                    <v-list density='compact'>
                        <v-list-item prepend-icon='mdi-file-document-plus' title='Open Feature Model'
                                     @click='$emit("openFile")'>
                        </v-list-item>
                        <v-list-item :title='isFileLoaded ? "Open New Model" : "Open Small Model"'
                                     prepend-icon='mdi-file'
                                     @click='$emit("newEmptyModel", !isFileLoaded)'>
                        </v-list-item>
                        <v-list-item v-if='isFileLoaded' prepend-icon='mdi-file-cog'
                                     title='Switch to Configurator' @click='$emit("openConf")'
                        >
                        </v-list-item>
                        <v-list-item v-if='isFileLoaded' prepend-icon='mdi-content-save'
                                     title='Save Model to Local Storage' @click='$emit("localStorage")'>
                        </v-list-item>
                        <v-list-item v-if='isFileLoaded' prepend-icon='mdi-download'
                                     title='Download Model'
                                     @click='$emit("download")'>
                        </v-list-item>
                        <v-list-item v-if='isFileLoaded' prepend-icon='mdi-download'
                                     title='Download Model as SVG' @click='$emit("download-svg")'>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <view-menu
                    :direction='direction'
                    :editing='true'
                    :is-file-loaded='isFileLoaded'
                    :location='""'
                    @fitToView='$emit("fitToView")'
                    @nonSemanticEditing='(value) => $emit("nonSemanticEditing", value)'
                    @quickEdit='(value) => $emit("quickEdit", value)'
                    @resetView='(levels, maxChildren) => $emit("resetView", levels, maxChildren)'
                    @semanticEditing='(value) => $emit("semanticEditing", value)'
                    @shortName='(value) => $emit("shortName", value)'
                    @spaceBetweenParentChild='(value) => $emit("spaceBetweenParentChild", value)'
                    @spaceBetweenSiblings='(value) => $emit("spaceBetweenSiblings", value)'
                    @toggleDirection='$emit("toggleDirection")'
                >
                </view-menu>

                <v-btn
                    v-if='false'
                    :disabled='!isUndoAvailable || !editRights'
                    class='mx-1'
                    prepend-icon='mdi-backup-restore'
                    @click='discardChangesConfirmDialog = true'
                >
                    Discard Changes
                </v-btn>
                <v-btn
                    id='feature-model-navbar-undo'
                    :disabled='!isUndoAvailable || !editRights'
                    class='mx-1'
                    prepend-icon='mdi-undo'
                    @click="$emit('undo')"
                >
                    Undo
                </v-btn>
                <v-btn
                    :disabled='!isRedoAvailable || !editRights'
                    class='mx-1'
                    prepend-icon='mdi-redo'
                    @click="$emit('redo')"
                >
                    Redo
                </v-btn>

                <v-btn
                    id='feature-model-navbar-collaboration'
                    :disabled='collaborationStatus'
                    class='mx-1'
                    prepend-icon='mdi-account-multiple'
                    @click="$emit('show-collaboration-dialog')"
                >
                    Collaboration
                </v-btn>

                <v-btn
                    id='tutorial-mode-button'
                    :disabled='!isFileLoaded'
                    class='mx-1'
                    prepend-icon='mdi-school'
                    @click="$emit('show-tutorial')"
                >
                    Tutorial
                </v-btn>

                <v-btn
                    :disabled='!isFileLoaded'
                    :prepend-icon="isServiceAvailable ? 'mdi-wifi' : 'mdi-wifi-off'"
                    class='mx-1'
                    style='pointer-events: none'
                >
                    Service Status
                </v-btn>
            </v-menu>
        </div>
        <div class='hidden-sm-and-down'>
            <v-btn
                :icon="
                    theme.global.current.value.dark
                        ? 'mdi-brightness-7'
                        : 'mdi-brightness-4'
                "
                class='mx-3 theme-button'
                @click='toggleTheme'
            >
            </v-btn>
        </div>
    </v-app-bar>


    <v-dialog
        v-model='discardChangesConfirmDialog'
        persistent
        width='400'
    >
        <v-card>
            <v-card-title>Discard changes?</v-card-title>
            <v-card-text
            >Do you really want to discard all changes? This
                action can't be undone!
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color='primary'
                    text
                    @click='discardChangesConfirmDialog = false'
                >Cancel
                </v-btn>
                <v-btn color='primary' text @click="$emit('reset')"
                >Discard
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { useAppStore } from '@/store/app';
import { useTheme, useDisplay } from 'vuetify';
import ViewMenu from '@/components/ViewMenu.vue';


const appStore = useAppStore();
const theme = useTheme();
const breakpoints = useDisplay();


function toggleTheme() {
    theme.global.name.value = theme.global.current.value.dark
        ? 'variabilityLightTheme'
        : 'variabilityDarkTheme';
}

</script>

<script>
export default {
    name: 'FMNavbar',

    components: {},

    props: {
        isFileLoaded: Boolean,
        isUndoAvailable: Boolean,
        isRedoAvailable: Boolean,
        isSaveAvailable: Boolean,
        isServiceAvailable: Boolean,
        direction: String,
        editRights: undefined,
        collaborationStatus: undefined
    },

    data: () => ({
        selectedView: undefined,
        levels: 4,
        maxChildren: 3,
        spaceBetweenParentChild: 75,
        spaceBetweenSiblings: 20,
        itemsColoring: ['Standard', 'Direct Children', 'Total Children'],
        isShortName: false,
        nonSemanticEditing: false,
        semanticEditing: false,
        quickEdit: false,
        drawer: false,
        discardChangesConfirmDialog: false,
        saveDialog: false,
        isColorMenuOpened: false
    }),

    watch: {
        isShortName: function(newValue) {
            this.$emit('shortName', newValue);
        },
        spaceBetweenParentChild: function(newValue) {
            this.$emit('spaceBetweenParentChild', newValue);
        },
        spaceBetweenSiblings: function(newValue) {
            this.$emit('spaceBetweenSiblings', newValue);
        },
        levels: function(newValue) {
            this.$emit('levels', newValue);
        },
        maxChilds: function(newValue) {
            this.$emit('maxChilds', newValue);
        },
        nonSemanticEditing: function(newValue) {
            this.$emit('nonSemanticEditing', newValue);
        },
        semanticEditing: function(newValue) {
            this.$emit('semanticEditing', newValue);
        },
        quickEdit: function(newValue) {
            this.$emit('quickEdit', newValue);
        }
    }
};
</script>
