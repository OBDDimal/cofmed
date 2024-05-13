<template>
    <div>
        <v-card v-if='legendShow' location='right center' position='fixed' width='180px' elevation='3'>
            <v-card-title>
                Legend:
            </v-card-title>

            <v-card-text>
                <div v-for='item in legendItemsVue' class='pa-1 border-t-sm' >
                    <div class='pt-1'>{{ item.description }}</div>
                    <v-img
                        :height='CONSTANTS.LEGEND_IMG_HEIGHT'
                        :src='item.image'
                        :width='CONSTANTS.LEGEND_IMG_WIDTH'>
                    </v-img>
                </div>
                <div class='border-t-sm'></div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>


import { FeatureNode } from '@/classes/FeatureNode';
import * as legendItems from '@/classes/Legend/LegendItemFactory';
import * as CONSTANTS from '@/classes/constants';

export default {
    name: 'FeatureModelLegend',

    props: {
        d3Data: undefined,
        legendShow: Boolean
    },

    computed: {
        CONSTANTS() {
            return CONSTANTS;
        },
        legendItemsVue() {
            let legendItemsList = [];
            if (this.d3Data === undefined || this.d3Data.flexlayout === undefined) {
                return legendItemsList;
            }
            const visibleD3Nodes = this.d3Data.flexlayout(this.d3Data.root).descendants();
            let mandatoryPresent, optionalPresent, abstractPresent, concretePresent, orGroupPresent,
                alternativeGroupPresent = false;
            visibleD3Nodes.forEach(d3Node => {
                if (d3Node.data instanceof FeatureNode) {
                    if (d3Node.data.isAbstract) {
                        abstractPresent = true;
                    } else {
                        concretePresent = true;
                    }
                    if (d3Node.data.isMandatory) {
                        mandatoryPresent = true;
                    } else {
                        optionalPresent = true;
                    }
                    if (!d3Node.data.isRoot && d3Node.data.parent.isOr()) {
                        orGroupPresent = true;
                    }
                    if (!d3Node.data.isRoot && d3Node.data.parent.isAlt()) {
                        alternativeGroupPresent = true;
                    }
                }
            });

            if (mandatoryPresent) {
                legendItemsList.push(legendItems.getMandatoryFeature());
            }
            if (optionalPresent) {
                legendItemsList.push(legendItems.getOptionalFeature());
            }
            if (abstractPresent) {
                legendItemsList.push(legendItems.getAbstractFeature());
            }
            if (concretePresent) {
                legendItemsList.push(legendItems.getConcreteFeature());
            }
            if (orGroupPresent) {
                legendItemsList.push(legendItems.getOrGroup());
            }
            if (alternativeGroupPresent) {
                legendItemsList.push(legendItems.getAltGroup());
            }
            return legendItemsList;
        }
    }
};


</script>

<style scoped>

</style>
