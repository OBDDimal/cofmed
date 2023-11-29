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
                open-on-hover

            >
                <template v-slot:activator='{ props }'>
                    <v-btn
                        class='mx-1'
                        prepend-icon='mdi-menu'
                        v-bind='props'
                        id='feature-model-navbar-save'
                    >
                        File
                    </v-btn>
                </template>

                <v-list density='compact'>
                    <v-list-item prepend-icon='mdi-file-document-plus' title='Open Feature Model'
                                 @click='$emit("openFile")'>
                    </v-list-item>
                    <v-list-item prepend-icon='mdi-file' :title='isFileLoaded ? "Open New Model" : "Open Small Model"'
                                 @click='$emit("newEmptyModel")'>
                    </v-list-item>
                    <v-list-item v-if='isFileLoaded' prepend-icon='mdi-file-cog'
                                 title='Start Configurator' @click='$emit("openConf")'
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
            <v-menu offset-y :close-on-content-click='false' class='mx-1'
            >
                <template v-slot:activator='{ props }'>
                    <v-btn
                        class='mx-1'
                        prepend-icon='mdi-eye'
                        v-bind='props'
                        id='feature-model-navbar-view'
                        :disabled='!isFileLoaded'
                    >
                        View
                    </v-btn>
                </template>
                <v-list>
                    <v-list-subheader>View</v-list-subheader>

                    <v-list-item
                        class='clickable'
                        @click="$emit('fitToView')"
                    >
                        <v-list-item-title> Fit to view</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        class='clickable'
                        @click="$emit('toggleDirection')"
                    >
                        <v-list-item-title>
                            {{
                                direction === 'v'
                                    ? 'Change direction to horizontally'
                                    : 'Change direction to vertically'
                            }}
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        class='clickable'
                        @click="$emit('resetView', levels, maxChildren)"
                    >
                        <v-list-item-title> Reset view</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                        class='clickable'
                        @click="$emit('open-constraints')"
                    >
                        <v-list-item-title>
                            Show Constraints
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                        <template v-slot:prepend='{ active }'>
                            <v-list-item-action start>
                                <v-checkbox-btn
                                    v-model='isShortName'
                                    :input-value='active'
                                    color='primary'
                                ></v-checkbox-btn>
                            </v-list-item-action>

                            <v-list-item-title>
                                Short Name
                            </v-list-item-title>
                        </template>
                    </v-list-item>
                    <v-list-subheader>
                        Space parent -> child
                    </v-list-subheader
                    >
                    <v-list-item>
                        <v-slider
                            v-model='spaceBetweenParentChild'
                            hide-details
                            max='300'
                            min='40'
                            style='width: 200px'
                        ></v-slider>
                    </v-list-item>
                    <v-list-subheader
                    >Space between siblings
                    </v-list-subheader
                    >
                    <v-list-item>
                        <v-slider
                            v-model='spaceBetweenSiblings'
                            hide-details
                            max='300'
                            min='5'
                            style='width: 200px'
                        ></v-slider>
                    </v-list-item>

                    <v-list-subheader>Adjust Levels</v-list-subheader>

                    <v-list-item>
                        <v-text-field
                            v-model='levels'
                            class='mt-0 pt-0'
                            min='0'
                            type='number'
                            @change="
                                    $emit('resetView', levels, maxChildren)
                                "
                        ></v-text-field>
                    </v-list-item>
                    <v-list-subheader>Adjust Max Children</v-list-subheader>

                    <v-list-item>
                        <v-text-field
                            v-model='maxChildren'
                            class='mt-0 pt-0'
                            min='0'
                            type='number'
                            @change="
                                    $emit('resetView', levels, maxChildren)
                                "
                        ></v-text-field>
                    </v-list-item>

                    <v-list-item>
                        <template v-slot:prepend='{ active }'>
                            <v-list-item-action start>
                                <v-checkbox-btn
                                    v-model='nonSemanticEditing'
                                    :input-value='active'
                                    color='primary'
                                ></v-checkbox-btn>
                            </v-list-item-action>

                            <v-list-item-title>
                                Non semantic editing
                            </v-list-item-title>
                        </template>
                    </v-list-item>

                    <v-list-item>
                        <template v-slot:prepend='{ active }'>
                            <v-list-item-action start>
                                <v-checkbox-btn
                                    v-model='semanticEditing'
                                    :input-value='active'
                                    color='primary'
                                ></v-checkbox-btn>
                            </v-list-item-action>

                            <v-list-item-title>
                                Semantic editing
                            </v-list-item-title>
                        </template>
                    </v-list-item>
                    <v-list-item>
                        <template v-slot:prepend='{ active }'>
                            <v-list-item-action start>
                                <v-checkbox-btn
                                    v-model='quickEdit'
                                    :input-value='active'
                                    color='primary'
                                ></v-checkbox-btn>
                            </v-list-item-action>

                            <v-list-item-title>
                                Quick edit
                            </v-list-item-title>
                        </template>
                    </v-list-item>


                </v-list>
            </v-menu>

            <v-btn
                v-if='false'
                class='mx-1'
                :disabled='!isUndoAvailable || !editRights'
                prepend-icon='mdi-backup-restore'
                @click='discardChangesConfirmDialog = true'
            >
                Discard Changes
            </v-btn>
            <v-btn
                class='mx-1'
                :disabled='!isUndoAvailable || !editRights'
                @click="$emit('undo')"
                prepend-icon='mdi-undo'
                id='feature-model-navbar-undo'
            >
                Undo
            </v-btn>
            <v-btn
                class='mx-1'
                :disabled='!isRedoAvailable || !editRights'
                @click="$emit('redo')"
                prepend-icon='mdi-redo'
            >
                Redo
            </v-btn>

            <v-btn
                class='mx-1'
                prepend-icon='mdi-account-multiple'
                @click="$emit('show-collaboration-dialog')"
                :disabled='collaborationStatus'
                id='feature-model-navbar-collaboration'
            >
                Collaboration
            </v-btn>

            <v-btn
                class='mx-1'
                prepend-icon='mdi-school'
                @click="$emit('show-tutorial')"
                id='tutorial-mode-button'
                :disabled='!isFileLoaded'
            >
                Tutorial
            </v-btn>

            <v-btn
                :prepend-icon="isServiceAvailable ? 'mdi-wifi' : 'mdi-wifi-off'"
                class='mx-1'
                :disabled='!isFileLoaded'
                style="pointer-events: none"
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
            <v-btn
                class='drawer-button'
                icon='mdi-menu'
                @click='drawer = !drawer'
            ></v-btn>
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
    name: 'Navbar',

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
    },

    computed: {},

    methods: {
        selectedColoring(newValue) {
            this.$emit('coloring', newValue);
        }
    }
};
</script>
