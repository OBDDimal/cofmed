<template>
    <div>
       <!-- <v-navigation-drawer
            v-model="drawer"
            temporary           
            location="end"
        >-->
        <v-navigation-drawer
            v-model="drawer"
            permanent       
            location="end"
            :width="290"
            floating
        >
        <v-list-item
          nav
        >
          <template v-slot:append>
            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              @click.stop="drawer = !drawer"
            ></v-btn>
          </template>
        </v-list-item>
        <fact-label
        :metadata="metadata"
        :metrics="metrics"
        :analysis="analysis"
        :d3Data="d3Data"
        :data="data">
        </fact-label>
        </v-navigation-drawer>
    </div>
</template>

<script>
import FactLabel from '../FactLabel.vue';
export default {
    name: 'FeatureModelFactLabelBar',

    components: {
        FactLabel,
    },

    props: {
        data:Array,
        d3Data: Array,
        isOpen: Boolean,
        metadata: Array,
        metrics: Array,
        analysis: Array,
    },

    data: () => ({
    }),


    computed: {
        drawer: {
            get() {
                return this.isOpen;
            },
            set() {this.$emit('close'); },
        },},

    methods: {

    },
};
</script>

<style scoped>
.clickable {
    cursor: pointer;
}

@media only screen and (max-width: 1800px) {
    .v-toolbar {
        width: 100%;
    }
}


</style>
