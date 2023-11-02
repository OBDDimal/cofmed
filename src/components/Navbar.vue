<template>
    <v-app-bar app>
        <v-app-bar-title style="flex: initial">
            <v-avatar class="hidden-xs-only mr-3">
                <v-img
                    :src="
                        theme.global.current.value.dark
                            ? '/ddueruem_logo_dark.svg'
                            : '/ddueruem_logo.svg'
                    "
                    alt="logo"
                />
            </v-avatar>
            variability.dev
        </v-app-bar-title>
        <div class="hidden-sm-and-down ml-5">
            <v-btn
                v-if="appStore.isOnline"
                class="mx-1"
                to="/"
                prepend-icon="mdi-home"
            >
                Home
            </v-btn>
        </div>
        <v-spacer></v-spacer>
        <div class="hidden-md-and-up">
            <v-btn
                    :icon="
                    theme.global.current.value.dark
                        ? 'mdi-brightness-7'
                        : 'mdi-brightness-4'
                "
                    @click="toggleTheme"
            >
            </v-btn>
            <v-btn v-fullscreen icon>
                <v-icon> mdi-fullscreen</v-icon>
            </v-btn>
            <v-btn
                    class="drawer-button"
                    icon="mdi-menu"
                    @click="drawer = !drawer"
            ></v-btn>
        </div>
        <div class="hidden-sm-and-down">
            <v-btn
                    :icon="
                    theme.global.current.value.dark
                        ? 'mdi-brightness-7'
                        : 'mdi-brightness-4'
                "
                    class="mx-3 theme-button"
                    @click="toggleTheme"
            >
            </v-btn>
            <v-btn
                    :class="breakpoints.smAndDown ? 'mr-3' : ''"
                    icon="mdi-fullscreen"
            >
            </v-btn>
        </div>
    </v-app-bar>
</template>

<script setup>
import { useAppStore } from '@/store/app';
import { useTheme, useDisplay } from 'vuetify';
import { ref } from 'vue';

const appStore = useAppStore();
const theme = useTheme();
const breakpoints = useDisplay();
const drawer = ref(false);


function toggleTheme() {
    theme.global.name.value = theme.global.current.value.dark
        ? 'light'
        : 'dark';
}

</script>
