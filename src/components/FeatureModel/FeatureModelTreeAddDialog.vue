<template>
    <div class='text-center'>
        <v-dialog v-model='showDialog' persistent width='500'>
            <v-card>
                <v-card-title class='text-h5'> Add Feature</v-card-title>

                <v-divider></v-divider>

                <v-form ref='form' @submit.prevent='add'>
                    <v-card-text>
                        <div>
                            <v-text-field
                                v-model='name'
                                :rules="[(value) => !!value || 'Required.']"
                                label='Name'
                            ></v-text-field>
                        </div>

                        <div v-if='showMandatorySelection' class='my-2'>
                            <v-btn-toggle
                                v-model='mandatory'
                                color='primary'
                                dense
                                mandatory
                                tile
                            >
                                <v-btn text> mandatory</v-btn>
                                <v-btn text> optional</v-btn>
                            </v-btn-toggle>
                        </div>

                        <v-checkbox
                            v-model='abstract'
                            hide-details
                            label='Abstract'
                        ></v-checkbox>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color='secondary' text @click='discard'>
                            Discard
                        </v-btn
                        >
                        <v-tooltip :disabled='!isNameAvailable' location='bottom'>
                            <template v-slot:activator='{ props }'>
                                <div class='d-inline-block' v-bind='props'>
                                    <v-btn
                                        :disabled='!name || isNameAvailable'
                                        color='primary'
                                        text
                                        type='submit'
                                    >
                                        Add
                                    </v-btn
                                    >
                                </div>
                            </template>
                            <span>You need to choose a name that is not used already.</span>
                        </v-tooltip>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: 'FeatureModelTreeAddDialog',

    data: () => ({
        name: '',
        mandatory: 1,
        abstract: false
    }),

    props: {
        parent: Object,
        show: Boolean
    },

    computed: {
        showDialog: {
            get() {
                return this.show;
            }
        },

        showMandatorySelection() {
            if (this.parent) {
                return this.parent.isAnd();
            }
            return false;
        },

        isNameAvailable() {
            return this.parent.getRootNode().descendants().map(f => f.name).includes(this.name);
        }
    },

    methods: {
        discard() {
            this.name = '';
            this.mandatory = false;
            this.abstract = false;

            this.$emit('close');

            // to reset form validation and error messages
            this.$refs.form.reset();
        },

        add() {
            const data = {
                name: this.name,
                groupType: 'and',
                mandatory: this.mandatory === 0,
                abstract: this.abstract
            };
            this.name = '';
            this.mandatory = false;
            this.abstract = false;
            this.$emit('add', data, this.parent);

            // to reset form validation and error messages
            this.$refs.form.reset();
        }
    }
};
</script>
