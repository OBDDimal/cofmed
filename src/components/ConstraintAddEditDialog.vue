<template>
    <div class='text-center'>
        <v-dialog v-model='showDialog' persistent width='80%'>
            <v-card>
                <v-card-title class='text-h5'>
                    {{ mode }} Constraint
                </v-card-title>

                <v-divider></v-divider>

                <v-form @submit.prevent='save'>
                    <v-card-text>
                        <v-combobox
                            ref='allNodes'
                            v-model='selectedFeatureNode'
                            :disabled='isFeatureAvailable'
                            :items='allNodes'
                            item-title='name'
                            label='Select FeatureNode'
                            @update:modelValue='appendFeatureNode(selectedFeatureNode)'
                        ></v-combobox>

                        <v-row justify='space-between'>
                            <v-col cols='6' sm='auto'>
                                <v-btn
                                    :disabled='isGroupAvailable'
                                    variant='outlined'
                                    @click="appendGroupOperator('AND')"
                                >and
                                </v-btn>
                            </v-col>
                            <v-col cols='6' sm='auto'>
                                <v-btn
                                    :disabled='isGroupAvailable'
                                    variant='outlined'
                                    @click="appendGroupOperator('OR')"
                                >or
                                </v-btn>
                            </v-col>
                            <v-col cols='6' sm='auto'>
                                <v-btn
                                    :disabled='isGroupAvailable'
                                    variant='outlined'
                                    @click="appendGroupOperator('IMPLIES')"
                                >implies
                                </v-btn>
                            </v-col>
                            <v-col cols='6' sm='auto'>
                                <v-btn
                                    :disabled='isGroupAvailable'
                                    variant='outlined'
                                    @click="appendGroupOperator('EQUI')"
                                >equi
                                </v-btn>
                            </v-col>
                            <v-col cols='6' sm='auto'>
                                <v-btn
                                    :disabled='isNotAvailable'
                                    variant='outlined'
                                    @click='appendNotOperator()'
                                >not
                                </v-btn>
                            </v-col>
                            <v-col cols='6' sm='auto'>
                                <v-btn
                                    :disabled='isOpenBracketAvailable'
                                    variant='outlined'
                                    @click="appendBracket('(')"
                                >(
                                </v-btn>
                            </v-col>
                            <v-col cols='6' sm='auto'>
                                <v-btn
                                    :disabled='isClosedBracketAvailable'
                                    variant='outlined'
                                    @click="appendBracket(')')"
                                >)
                                </v-btn>
                            </v-col>
                            <v-col cols='6' sm='auto'>
                                <v-btn
                                    :disabled='undoAvailable'
                                    variant='outlined'
                                    @click='undoLastAction'
                                >&#129044;
                                </v-btn>
                            </v-col>

                        </v-row>

                        <v-row class='my-2'>
                            <v-col class='pt-0' cols='12'>
                                <v-text-field
                                    ref='inputField'
                                    v-model='constraintText'
                                    clearable
                                    hide-details
                                    label='Constraint'
                                    readonly
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color='secondary' variant='text' @click='discard'
                        >Discard
                        </v-btn>
                        <v-tooltip :disabled='isValid' location='top'>
                            <template v-slot:activator='{ props }'>
                                <div class='d-inline-block' v-bind='props'>
                                    <v-btn
                                        :disabled='!isAddAvailable'
                                        color='primary'
                                        type='submit'
                                        variant='text'
                                    >{{ mode }}
                                    </v-btn>
                                </div>
                            </template>
                            <span>{{ tooltipText }}</span>
                        </v-tooltip>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { FeatureNode } from '@/classes/FeatureNode';
import { parse } from '@/services/booleanExpressionParser.service';

export default {
    name: 'ConstraintAddEditDialog',

    data: () => ({
        constraintText: '',
        selectedFeatureNode: undefined,
        isValid: false,
        errorText: '',
        lastOperator: [],
        openBrackets: 0
    }),

    props: {
        show: Boolean,
        allNodes: undefined,
        constraint: undefined,
        mode: undefined
    },

    watch: {
        constraint() {
            if (this.constraint) {
                this.constraintText = this.constraint.toStringForEdit();
                let splitted = this.constraintText.split(' ');
                splitted.forEach(
                    (element) => {
                        if (element.startsWith('(')) {
                            this.lastOperator.push('BRACKETOPENED');
                        }
                        if (element === 'AND' || element === 'OR' || element === 'IMPLIES' || element === 'EQUI') {
                            this.lastOperator.push('GROUP');
                        } else if (element === 'NOT') {
                            this.lastOperator.push('NOT');
                        } else {
                            this.lastOperator.push('FEATURE');
                        }
                        if (element.endsWith(')')) {
                            this.lastOperator.push('BRACKETCLOSED');
                        }
                    }
                );
            } else {
                this.constraintText = '';
            }
        },

        constraintText(newValue) {
            if (newValue === null) {
                this.constraintText = '';
                this.lastOperator = [];
                this.openBrackets = 0;
            }
        }
    },

    computed: {
        showDialog: {
            get() {
                return this.show;
            }
        },
        isFeatureAvailable() {
            return !(this.lastOperator.slice(-1)[0] !== 'FEATURE' && this.lastOperator.slice(-1)[0] !== 'BRACKETCLOSED');
        },
        isGroupAvailable() {
            return !(this.lastOperator.slice(-1)[0] === 'FEATURE' || this.lastOperator.slice(-1)[0] === 'BRACKETCLOSED');
        },
        isNotAvailable() {
            return !(this.lastOperator.slice(-1)[0] !== 'FEATURE' && this.lastOperator.slice(-1)[0] !== 'BRACKETCLOSED');
        },
        isOpenBracketAvailable() {
            return !(this.lastOperator.slice(-1)[0] !== 'FEATURE' && this.lastOperator.slice(-1)[0] !== 'BRACKETCLOSED');
        },
        isClosedBracketAvailable() {
            return !(this.openBrackets > 0 && (this.lastOperator.slice(-1)[0] === 'FEATURE' || this.lastOperator.slice(-1)[0] === 'BRACKETCLOSED'));
        },
        isAddAvailable() {
            return this.openBrackets === 0 && this.lastOperator.slice(-1)[0] !== 'GROUP' && this.lastOperator.slice(-1)[0] !== 'NOT';
        },
        undoAvailable() {
            return !this.lastOperator.length > 0;
        },
        tooltipText() {
            if (this.openBrackets > 0) {
                return 'Missing one or more closing brackets';
            } else if (this.lastOperator.slice(-1)[0] === 'GROUP') {
                return 'Missing a second constraint item for the last group constraint.';
            } else if (this.lastOperator.slice(-1)[0] === 'NOT') {
                return 'Missing a constraint item for the last not constraint';
            } else {
                return '';
            }
        }
    },
    methods: {
        discard() {
            this.constraintText = '';
            this.lastOperator = [];
            this.$emit('close');
        },

        save() {
            try {
                const newConstraintItem = parse(
                    this.constraintText,
                    this.allNodes
                );
                this.constraintText = '';
                this.lastOperator = [];
                this.$emit('save', newConstraintItem);
            } catch (e) {
                console.log(e);
            }
        },

        checkParse(value) {
            try {
                parse(value, this.allNodes);
                this.errorText = '';
                this.isValid = true;
                return true;
            } catch (e) {
                this.errorText = e.message;
                this.isValid = false;
                return false;
            }
        },

        appendFeatureNode(featureNode) {
            if (!featureNode) return;
            let name = featureNode.name;
            let regex = /\s/;
            if (regex.test(name)) {
                name = `"${name}"`;
            }
            this.constraintText = this.constraintText + name + ' ';
            this.lastOperator.push('FEATURE');
            this.$refs.allNodes.internalSearch = '';
            this.selectedFeatureNode = undefined;
        },

        appendGroupOperator(operator) {
            if (!operator) return;
            this.constraintText = this.constraintText + operator + ' ';
            this.lastOperator.push('GROUP');
        },

        appendNotOperator() {
            this.constraintText = this.constraintText + 'NOT' + ' ';
            this.lastOperator.push('NOT');
        },

        appendBracket(bracket) {
            if (!bracket) return;
            if (bracket === '(') {
                this.openBrackets += 1;
                this.constraintText = this.constraintText + bracket;
                this.lastOperator.push('BRACKETOPENED');
            } else {
                this.openBrackets -= 1;
                this.constraintText = this.constraintText.slice(0, -1) + bracket + ' ';
                this.lastOperator.push('BRACKETCLOSED');
            }

        },

        undoLastAction() {
            let operator = this.lastOperator.pop();
            if (operator === 'BRACKETCLOSED') {
                this.constraintText = this.constraintText.slice(0, -2);
                this.openBrackets = this.openBrackets + 1;
            } else if (operator === 'BRACKETOPENED') {
                this.constraintText = this.constraintText.slice(0, -1);
                this.openBrackets = this.openBrackets - 1;
            } else {
                let lastIndex = this.constraintText.slice(0, -1).lastIndexOf(' ');
                if (this.lastOperator.slice(-1)[0] === 'BRACKETOPENED') {
                    if (lastIndex === -1) {
                        this.constraintText = '(';
                    } else {
                        this.constraintText = this.constraintText.slice(0, lastIndex + 2);
                    }
                } else {
                    if (lastIndex === -1) {
                        this.constraintText = '';
                    } else {
                        this.constraintText = this.constraintText.slice(0, lastIndex + 1);
                    }
                }

            }
        },

        appendText(text, addSpaceBefore, addSpaceAfter) {
            if (!text) return;
            this.$refs.allNodes.internalSearch = '';
            this.$refs.allNodes.internalSearch = '';
            if (!this.constraintText) {
                this.constraintText = '';
            }

            // Add space if there do not exist one.
            const pos = this.$refs.inputField.selectionStart;
            let textToInsert = '';
            if (
                addSpaceBefore &&
                pos !== 0 &&
                this.constraintText.length >= pos &&
                this.constraintText.charAt(pos - 1) !== ' ' &&
                this.constraintText.charAt(pos - 1) !== '('
            ) {
                textToInsert += ' ';
            }
            textToInsert += text;
            if (
                addSpaceAfter &&
                this.constraintText.length >= pos + 1 &&
                this.constraintText.charAt(pos) !== ' '
            ) {
                textToInsert += ' ';
            }

            this.constraintText =
                this.constraintText.slice(0, pos) +
                textToInsert +
                this.constraintText.slice(pos);
            this.selectedFeatureNode = undefined;
        }
    }
};
</script>
