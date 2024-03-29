<template>
    <v-dialog v-model='showDialog'
              content-class='tutorial-dialog'
              persistent width='400'
              @keydown.esc='exit'
              @click:outside='exit'
    >
        <svg
            v-if='!isMobile && isTop && isLeft'
            height='50px'
            width='400px'
        >
            <polygon
                :style="
                        $vuetify.theme.dark
                            ? 'fill: #121212; stroke: #ffffff; stroke-width: 1px'
                            : 'fill: #ffffff; stroke: #121212; stroke-width: 1px'
                    "
                points='0,0 120,50 220,50'
            />
        </svg>
        <svg
            v-if='!isMobile && isTop && !isLeft'
            height='50px'
            width='400px'
        >
            <polygon
                :style="
                        $vuetify.theme.dark
                            ? 'fill: #121212; stroke: #ffffff; stroke-width: 1px'
                            : 'fill: #ffffff; stroke: #121212; stroke-width: 1px'
                    "
                points='400,0 280,50 180,50'
            />
        </svg>
        <v-card
            v-if='step'
            :style="
                    $vuetify.theme.dark
                        ? 'border: 1px solid white;'
                        : 'border: 1px solid #121212'
                "
            outlined
        >
            <v-card-title>
                <v-layout row>
                    <span>{{ step.title }}</span>
                    <v-spacer></v-spacer>
                    <v-btn icon variant='text' @click='exit' class='d-flex justify-center'>
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-layout>
            </v-card-title>

            <v-card-text>
                {{ step.description }}
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    :disabled='!beforeSteps.length'
                    color='error'
                    text
                    @click='beforeStep'
                >Back
                </v-btn
                >
                <v-btn color='primary' text @click='nextStep'
                >Continue
                </v-btn
                >
            </v-card-actions>
        </v-card>
        <v-card v-else>
            <v-card-title>
                Do you want to start the tutorial?
            </v-card-title>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color='error' text @click="$emit('close')">Close</v-btn>
                <v-btn color='primary' text @click='startTutorial'>Start Tutorial</v-btn>
            </v-card-actions>
        </v-card>
        <svg
            v-if='!isMobile && !isTop && isLeft'
            height='50px'
            width='400px'
        >
            <polygon
                :style="
                        $vuetify.theme.dark
                            ? 'fill: #121212; stroke: #ffffff; stroke-width: 1px'
                            : 'fill: #ffffff; stroke: #121212; stroke-width: 1px'
                    "
                points='120,0 220,0 0,50'
            />
        </svg>
        <svg
            v-if='!isMobile && !isTop && !isLeft'
            height='50px'
            width='400px'
        >
            <polygon
                :style="
                        $vuetify.theme.dark
                            ? 'fill: #121212; stroke: #ffffff; stroke-width: 1px'
                            : 'fill: #ffffff; stroke: #121212; stroke-width: 1px'
                    "
                points='180,0 280,0 400,50'
            />
        </svg>
    </v-dialog>
</template>

<script setup>
import { count } from 'd3';
import { onMounted, ref, computed } from 'vue';

const DIALOG_SELECTOR = '.tutorial-dialog';
const step = ref(undefined);
const beforeSteps = ref([]);
const isTop = ref(false);
const isLeft = ref(false);
const isMobile = ref(false);
const counter = ref(0);
const emit = defineEmits(['close']);
const props = defineProps({
    show: Boolean,
    nextSteps: {
        type: Array,
        required: false,
        default: () => [
            {
                title: 'Welcome to the tutorial!',
                description:
                    'You can restart the tutorial anytime by clicking on this icon on the left.',
                elementCssSelector: '#tutorial-mode-button'
            },
            {
                title: 'Your feature model',
                description:
                    'This is your main workspace. The feature model tree. You can move around and zoom in and out with your mouse or your fingers, depending on your platform.',
                elementCssSelector: '#svg-container'
            },
            {
                title: 'Your feature model',
                description:
                    'Feature model nodes are collapsed and uncollapsed when double-clicking. You can edit individual nodes with a right click and also use the corresponding context menu for other means of interacting with the feature model.',
                elementCssSelector: '#svg-container'
            },
            {
                title: 'Search',
                description:
                    'Feature models can get rather complex. To search for a node an navigate there automatically just click the magnifying glass above and enter your search query. In case there are multiple results you can navigate them with the arrows above.',
                elementCssSelector: '#feature-model-search'
            },
            {
                title: 'Your feature model',
                description:
                    'You may move around individual feature model nodes with \'drag and drop\'️. This does not allow semantic changes by default.',
                elementCssSelector: '#svg-container'
            },
            {
                title: 'Undo and redo',
                description:
                    'When making changes to a feature model it is important to have the possibility to revert changes. On the left you can find the undo and redo button.',
                elementCssSelector: '#feature-model-navbar-undo'
            },
            {
                title: 'File menu',
                description:
                    'Use the file menu to either load new feature models or download your current model.',
                elementCssSelector: '#feature-model-navbar-save'
            },
            {
                title: 'Collaboration',
                description:
                    'You want to show others your feature model, or even edit it together with them? Just click the collaboration button on the left and share your thoughts!',
                elementCssSelector: '#feature-model-navbar-collaboration'
            },
            {
                title: 'Constraints',
                description:
                    'To edit and view all of your cross-tree-constraints just click the button below. You may click individual constraints to highlight the corresponding feature model nodes in the tree above.',
                elementCssSelector: '#feature-model-constraints'
            },
            {
                title: 'View',
                description:
                    'To change defaults and other settings just click on this icon on the left. You may also experiment around with all the other options. Remember the undo option.',
                elementCssSelector: '#feature-model-navbar-view'
            }
        ]
    },
    localStorageIdentifier: {
        type: String,
        required: false,
        default: 'featureModelTutorialCompleted'
    }
});

onMounted(() => {
    reset();
});

function startTutorial() {
    isMobile.value = 'ontouchstart' in window;
    step.value = props.nextSteps[counter.value];
    counter.value++;
    if (!isMobile.value) {
        setBubblePosition();
    }
}

function setBubblePosition() {
    const tutorialDialog = document.querySelector(DIALOG_SELECTOR);
    if (isMobile.value) {
        tutorialDialog.style.position = 'block';
    } else {
        tutorialDialog.style.position = 'absolute';
    }
    if (step.value.elementCssSelector) {
        reset(); /// Reset bubble position until fixed
        const rect = document
            .querySelector(step.value.elementCssSelector)
            .getBoundingClientRect();
        const middleX = (rect.right - rect.left) / 2 + rect.left;
        const middleY = (rect.bottom - rect.top) / 2 + rect.top;
        tutorialDialog.style.left = null;
        tutorialDialog.style.right = null;
        tutorialDialog.style.top = null;
        tutorialDialog.style.bottom = null;
        if (
            middleX + 400 >
            (window.innerWidth || document.documentElement.clientWidth)
        ) {
            tutorialDialog.style.left = `calc(${middleX}px - 400px)`;
            isLeft.value = false;
        } else {
            tutorialDialog.style.left = `calc(${middleX}px + 2rem)`;
            isLeft.value = true;
        }
        if (
            middleY + 200 >
            (window.innerHeight || document.documentElement.clientHeight)
        ) {
            tutorialDialog.style.bottom = `calc(${window.innerHeight - middleY}px)`;
            isTop.value = false;
        } else {
            tutorialDialog.style.top = middleY + 'px';
            isTop.value = true;
        }
    }
}

function nextStep() {
    if (props.nextSteps.length > counter.value) {
        beforeSteps.value.unshift(step.value);
        step.value = props.nextSteps[counter.value];
        counter.value++;
        if (!isMobile.value) {
            setBubblePosition();
        }
    } else {
        exit();
    }
}

function exit() {
    reset();
    step.value = undefined;
    beforeSteps.value = [];
    isTop.value = false;
    isLeft.value = false;
    isMobile.value = false;
    counter.value = 0;
    localStorage[props.localStorageIdentifier] = true;
    emit('close');
}

function beforeStep() {
    counter.value = counter.value - 1;
    step.value = beforeSteps.value.shift();
    if (!isMobile.value) {
        setBubblePosition();
    }
}

function reset() {
    try {
        if (!isMobile.value) {
            const tutorialDialog = document.querySelector(DIALOG_SELECTOR);
            if (tutorialDialog) {
                tutorialDialog.style.left = 0;
                tutorialDialog.style.top = 0;
                tutorialDialog.style.position = 'fixed';
            }
        }
    } catch (error) {
        console.error(error);
    }
}

const showDialog = computed(() => {
    return props.show;
});
</script>

<style lang='scss'>
.tutorial-dialog {
    max-width: 400px;
    transition: all 0.75s;

    > .v-card {
        margin-top: -10px;
    }
}

.v-dialog > .v-overlay__content {
    margin: 0px;
}
</style>
