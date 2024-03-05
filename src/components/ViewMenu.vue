<template>
    <v-menu :close-on-content-click='false' class='mx-1' :location="location" offset-y
    >
        <template v-slot:activator='{ props }'>
            <v-btn
                id='feature-model-navbar-view'
                :disabled='!isFileLoaded'
                class='mx-1'
                prepend-icon='mdi-eye'
                v-bind='props'
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

            <v-list-item v-if='editing'>
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

            <v-list-item v-if='editing'>
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
            <v-list-item v-if='editing'>
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
</template>

<script>
export default {
    name: 'ViewMenu',

    props: {
        isFileLoaded: Boolean,
        direction: String,
        location: undefined,
        editing: Boolean
    },

    data: () => ({
        levels: 4,
        maxChildren: 3,
        spaceBetweenParentChild: 75,
        spaceBetweenSiblings: 20,
        isShortName: false,
        nonSemanticEditing: false,
        semanticEditing: false,
        quickEdit: false,
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
};
</script>

<style scoped>

</style>
