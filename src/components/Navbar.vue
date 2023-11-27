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
            <v-btn
                v-if='appStore.isOnline'
                class='mx-1'
                to='/'
                prepend-icon='mdi-home'
            >
                Home
            </v-btn>
        </div>
        <div class='hidden-sm-and-down ml-5'>
            <v-menu
                open-on-hover
            >
                <template v-slot:activator='{ props }'>
                    <v-btn
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
                    <v-list-item v-if='true' prepend-icon='mdi-file-cog'
                                 title='Load Configuration' @click='$emit("openConf")'
                    >
                    </v-list-item>
                    <v-list-item v-if='properties.fileIsLoaded' prepend-icon='mdi-content-save'
                                 title='Save Configuration to Local Storage' @click='$emit("localStorage")'>
                    </v-list-item>
                    <v-list-item v-if='properties.fileIsLoaded' prepend-icon='mdi-download'
                                 title='Download Configuration'
                                 @click='$emit("download")'>
                    </v-list-item>
                    <v-list-item
                        prepend-icon='mdi-export-variant' title='Export options'>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-menu
                open-on-hover
            >
                <template v-slot:activator='{ props }'>
                    <v-btn
                        class='mx-1'
                        prepend-icon='mdi-pencil'
                        v-bind='props'
                    >
                        Edit
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item>
                        <v-menu location='end'>
                            <template v-slot:activator='{ props }'>
                                <v-list-item v-bind='props' prepend-icon='mdi-palette'>
                                    <v-list-item-title>Coloring</v-list-item-title>
                                </v-list-item>
                            </template>
                            <v-list>
                                <v-list-item>
                                    <v-btn
                                        class='mx-1'
                                        prepend-icon='mdi-pencil'
                                        v-bind='props'
                                    >
                                        Edit
                                    </v-btn>
                                </v-list-item>
                                <v-list-item
                                    v-for='(item, i) in itemsColoring'
                                    :key='i'
                                    @click='selectedColoring(i)'
                                >
                                    <v-list-item-title
                                    >{{ item }}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-list-item>
                    <v-list-item>
                        <v-menu offset-y :close-on-content-click='false' location='end'>
                            <template v-slot:activator='{ props }'>
                                <v-list-item v-bind='props' prepend-icon='mdi-eye'>
                                    <v-list-item-title> View</v-list-item-title>
                                </v-list-item>
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
                                    @click="$store.commit('openConstraints', true)"
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
                            </v-list>
                        </v-menu>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-btn
                class='mx-1'
                prepend-icon='mdi-reload'
                :disabled='true'
            >
                Reset
            </v-btn>
            <v-btn
                class='mx-1'
                prepend-icon='mdi-undo'
                :disabled='true'
            >
                Undo
            </v-btn>
            <v-btn
                class='mx-1'
                prepend-icon='mdi-redo'
                :disabled='true'
            >
                Redo
            </v-btn>
            <v-btn
                class='mx-1'
                prepend-icon='mdi-pencil'
                :disabled='true'
            >
                Collaboration
            </v-btn>
            <v-menu
                open-on-hover
            >
                <template v-slot:activator='{ props }'>
                    <v-btn
                        :prepend-icon="properties.serviceIsWorking ? 'mdi-wifi' : 'mdi-wifi-off'"
                        class='mx-1'
                        v-bind='props'
                    >
                        Settings
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item>
                        <v-btn
                            @click="$emit('show-tutorial')"
                            id='tutorial-mode'
                            prepend-icon='mdi-school'
                        >
                            Tutorial
                        </v-btn>
                    </v-list-item>
                    <v-list-item>
                        <v-menu location='end'>
                            <template v-slot:activator='{ props }'>
                                <v-btn
                                    prepend-icon='mdi-vector-arrange-below'
                                    class='mx-1'
                                    v-bind='props'
                                >
                                    Levels and Children
                                </v-btn>
                            </template>
                            <v-list>
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
                    </v-list-item>
                    <v-list-item>
                        <v-menu location='end'>
                            <template v-slot:activator='{ props }'>
                                <v-btn
                                    prepend-icon='mdi-cog'
                                    class='mx-1'
                                    v-bind='props'
                                >
                                    Services
                                </v-btn>
                            </template>
                            <v-list density='compact'>
                                <v-list-item title='Use Flask Backend'>
                                    <template v-slot:prepend>
                                        <v-radio
                                            v-model='properties.serviceIsFlask'
                                            density='compact'
                                            @input='$emit("changeService", false)'
                                        ></v-radio>
                                    </template>
                                </v-list-item>
                                <v-list-item title='Use FeatureIDE Service'>
                                    <template v-slot:prepend>
                                        <v-radio
                                            v-model='properties.serviceIsFeatureIDE'
                                            density='compact'
                                            @input='$emit("changeService", true)'
                                        ></v-radio>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-list-item>
                </v-list>
            </v-menu>

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
            <v-btn v-fullscreen icon>
                <v-icon> mdi-fullscreen</v-icon>
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
            <v-btn
                :class="breakpoints.smAndDown ? 'mr-3' : ''"
                icon='mdi-fullscreen'
            >
            </v-btn>
        </div>
    </v-app-bar>
</template>

<script setup>
import { useAppStore } from '@/store/app';
import { useTheme, useDisplay } from 'vuetify';
import { ref } from 'vue';
import { tr } from 'vuetify/locale';

const appStore = useAppStore();
const theme = useTheme();
const breakpoints = useDisplay();
const drawer = ref(false);

const properties = defineProps({
    fileIsLoaded: Boolean,
    serviceIsWorking: Boolean,
    serviceIsFeatureIDE: Boolean,
    serviceIsFlask: Boolean,
    commandManager: undefined
});

function toggleTheme() {
    theme.global.name.value = theme.global.current.value.dark
        ? 'light'
        : 'dark';
}

</script>
