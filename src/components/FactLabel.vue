<template>
    
    <div v-show="boxPlotBool" style="position: fixed; border-radius: 5%; padding: 1%; border-style: ridge; border-width: thick; border-color: black; background-color: white; right: 110%; width: 110%; z-index: 1000;" :style="{top: divTop +'px'}">
        <canvas ref="chartCanvas"></canvas>
    </div>
    
    <v-card variant="outlined">

        <v-divider class="border-opacity-100"></v-divider>
        <!--  Data Table for MetaData: -->
        <v-data-table :headers="factHeaders" :items="showMetadata" item-value="name">
            <template v-slot:headers>
            </template>
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>{{ name }}</v-toolbar-title>
                    <a :href="fmHref" target="_blank" rel="noopener noreferrer">
                        <v-icon>mdi-link-variant</v-icon>
                    </a>
                </v-toolbar>
                <v-card flat align-center>
                    {{ desc }}
                </v-card>

            </template>
            <template v-slot:no-data>
                No Metadata available
            </template>
            <template v-slot:bottom>
            </template>
        </v-data-table>
        <v-divider class="border-opacity-100" thickness="10"></v-divider>
        <!--  Data Table for Metrics: -->

        
        <v-data-table v-model:expanded="expandedRoot" :headers="expandableHeaders" :items="showMetrics" item-value="name"  @mouseover="hoverFeature" @mouseleave="boxPlotBool=false;" @click="clickItem(showMetrics)">
            <!--<box-plot v-if="boxPlotBool" :data="widget.data"
              class="my-chart"></box-plot>-->
            <!--<box-plot v-if="boxPlotBool" :data="showMetrics[0].value"
              class="my-chart"></box-plot>-->

            
            <!--<canvas ref="chartCanvas"></canvas>-->
            
            <template v-slot:headers>
            </template>
            <template v-slot:expanded-row="{ item, columns }">
                <tr>
                    <td :colspan="columns.length" >
                        <v-data-table v-model:expanded="expandedSubs" :headers="expandableHeaders" :items="item.raw.childs" 
                            item-value="name" :expand-on-click="true" @mouseover="boxPlotBool=false">
                            <template v-slot:headers>
                            </template>
                            <template v-slot:item.data-table-expand="{ item }">
                                <template v-if="item.raw.childs && item.raw.childs.length > 0" >
                                    <v-icon icon="mdi-chevron-down"></v-icon>
                                </template>
                            </template>
                            <template v-slot:expanded-row="{ item, columns }" >
                                <template v-if="item.raw.childs && item.raw.childs.length > 0">
                                    <!-- only print when subitems exist-->
                
                <tr>
                    <td :colspan="columns.length" >
                        <v-data-table :headers="factHeaders" :items="item.raw.childs" item-value="name"
                            :show-expand="false">
                            <template v-slot:headers>
                            </template>

                            <template v-slot:bottom>
                            </template>
                        </v-data-table>

                    </td>
                </tr>
            </template>
            </template>
            <template v-slot:bottom>
            </template>
        </v-data-table>

        </td>
        </tr>
        </template>
        <template v-slot:no-data>
            No Metrics available
        </template>
        <template v-slot:bottom>
        </template>
        </v-data-table>

        <v-divider class="border-opacity-100" thickness="10"></v-divider>
        <!--  Data Table for Analysis: -->
        <v-data-table :headers="factHeaders" :items="showAnalysis" item-value="name" @mouseover="hoverFeature" @mouseleave="resetColorD3"> <!--@mouseleave="boxPlotBool=false"-->
            <template v-slot:headers>
            </template>
            <template v-slot:no-data>
                No Analysis available
            </template>
            <template v-slot:bottom>
            </template>
        </v-data-table>
        <v-divider class="border-opacity-100" thickness="10"></v-divider>
        <v-checkbox-btn v-model="hideMissing" label="Hide Missing">
        </v-checkbox-btn>
    </v-card>
</template>

<script>
import FeatureModelTree from './FeatureModel/FeatureModelTree.vue';
import { getFeatureStats } from '@/classes/BackendAccess/FeatureIDEAccess';
import { jsonToXML } from '@/services/xmlTranspiler.service';
import BoxPlot from "@/components/BoxPlot.vue";
import * as FactLabelFactory from "@/classes/Factlabel/FactLabelFactory"
const FM_CHAR_NAME_DESC = "Name"; // FM Characterization Name Descriptor
const FM_CHAR_HREF_DESC = "Reference";
const FM_CHAR_DESC_DESC = "Description";
const EMPTY_VALUE="";



import {onMounted, ref, watch} from "vue";
import { BoxPlotChart } from "@sgratzl/chartjs-chart-boxplot";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
//import { jsonToXML } from '@/services/xmlTranspiler.service';
import * as update from '@/services/FeatureModel/update.service.js';


export default {
    name: 'FactLabel',

    components: {BoxPlot},

    props: {
        d3Data:{
            type:Array,
            required:false,
        },
        data:{
            type:Array,
            required:false,
        },
        metadata: {
            type: Array,
            required: false,
            default: () => FactLabelFactory.getEmptyFactLabel().metadata,

        },
        analysis: {
            type: Array,
            required: false,
            default: () => FactLabelFactory.getEmptyFactLabel().analysis,

        },
        metrics: {
            type: Array,
            required: false,
            default: () => FactLabelFactory.getEmptyFactLabel().metrics,
        },
    },

    data: () => ({
        name: "",
        fmHref: "",
        desc: "",
        expandedRoot: [],
        expandedSubs: [],
        expandedSubSubs: [],
        factHeaders: [{ key: "name", sortable: false }, { key: "value", sortable: false }],
        expandableHeaders: [{ key: 'data-table-expand' }, { key: "name", sortable: false }, { key: "value", sortable: false }],
        hideMissing: false,
        boxPlotBool: false,//
        //chartCanvas: ref(null),//
        chartCanvas: ref(null),//
        divTop:0,//
    }),
    watch: {},

    computed: {
        showMetadata() {
            if (this.hideMissing) {
                return this.updateMetadata().filter((entry) => {
                    return entry.value !== EMPTY_VALUE;
                });
            } else {
                return this.updateMetadata();
            }

        },
        showMetrics() {
            if (this.hideMissing) {
                return this.updateMetrics().filter((entry) => {
                    return this.checkEntryIfValueSet(entry);
                });
            } else {
                return this.updateMetrics();
            }
        },
        showAnalysis() {
            if (this.hideMissing) {
                return this.updateAnalysis().filter((entry) => {
                    return entry.value !== EMPTY_VALUE;
                });
            } else {
                return this.updateAnalysis();
            }
        }
    },
    created() {

    },
    methods: {
        clickItem2(items){
            console.log("KLCIKEN");
        },
        clickItem(items){
            console.log("CLICK");
            //console.log(item);

            //const targetElement = event.target;
            //const targetText = targetElement.innerText;

            //console.log(targetElement);

            console.log(items);

            //console.log(items[2].name);

            //items[2].value = "3";

            //items[2].name = "3";

            //console.log(items[2].childs[0].name);

            //items[2].childs[0].name = "HALLO";

            //items[2].childs[1].value = "MOGEN";




        },
        async hoverFeature(event){
            const targetElement = event.target;
            const targetText = targetElement.innerText;
            const positionElement = targetElement.getBoundingClientRect();
            this.divTop = positionElement.top - 110;
            //Position
            /*
            const target = event.target; 
            const bounds = target.getBoundingClientRect();
            this.divTop = event.clientY - bounds.y;
            this.divTop = event.clientY;
            */

            //console.log(targetText);

            //console.log(this.data.rootNode.descendants());
            

            let d3 = this.d3Data


            //console.log(d3.root.descendants());
            switch(targetText){
                case "Depth of tree":
                    this.depthFeature()
                    this.boxPlotBool=true;///////////////77
                    break
                case "Features":                    
                    this.NumberFeatures();
                    this.boxPlotBool=true;
                    //console.log("Features");
                    break
                case "Tree relationships":
                    this.boxPlotBool=false;
                    //console.log("Tree relationships");
                    break
                case "Branching factor":
                    this.boxPlotBool=false;
                    //console.log("Branching factor");
                    break
                case "Cross-tree constraints":
                    this.boxPlotBool=false;
                    //console.log("Cross-tree constraints");
                    break
                
                //Untere Hälfte
                case "Core features":
                    //console.log("Core features");
                    this.coreFeatures(d3);
                    break
                case "Dead features":
                    //console.log("Dead features");
                    this.deadFeatures(d3);
                    break
                case "Variant features":
                    //console.log("Variant features");
                    this.resetColorD3(d3);
                    break
                case "False-optional features":
                    //console.log("False-optional features");
                    this.falseOptionalFeatures(d3);
                    break
                case "Configurations":
                    //console.log("Configurations");
                    this.resetColorD3(d3);
                    break
            }

            


            

        },
        resetColorD3(){
            let d3 = this.d3Data;
            
            if (d3!=undefined){
                let data = d3.root.descendants();
                for(let i=0; i<data.length; i++){
                    data[i].data.d3Node.data.isSearched = false;
                }

                update.updateSvg(d3);
            }
            
            this.boxPlotBool=false;

        },
        coreFeatures(d3){
            this.resetColorD3();
            let data = d3.root.descendants();
            for(let i=0; i<data.length; i++){
                if(data[i].data.d3Node.data.core == true){  
                    data[i].data.d3Node.data.isSearched = true;
                    
                }
            }

            update.updateSvg(d3);
        },
        falseOptionalFeatures(d3){
            this.resetColorD3();
            let data = d3.root.descendants();
            for(let i=0; i<data.length; i++){
                if(data[i].data.d3Node.data.falseOptional == true){
                    data[i].data.d3Node.data.isSearched = true;                    
                }
            }

            update.updateSvg(d3);
        },

        deadFeatures(d3){
            this.resetColorD3();
            let data = d3.root.descendants();
            for(let i=0; i<data.length; i++){
                if(data[i].data.d3Node.data.dead == true){
                    data[i].data.d3Node.data.isSearched = true;
                }
            }

            update.updateSvg(d3);
        },

        async depthFeature(){   // Auf welcher Ebene befinden sich viele Features --> Auf Ebene 7 befinden sich nur zwei --> die meisten Features sind auf Ebene 4 oder 5
            let data = this.data.rootNode.descendants();
            let depths=[]
            for(let i=0; i<data.length; i++){
                depths.push(data[i].d3Node.depth);
            }
            depths = depths.sort();
            let lst = {};
            let l=[];
            for(let i=0; i<depths.length; i++){
                l.push(depths[i]);
                if(depths[i] != depths[i+1]){
                    lst[l.length] = depths[i];
                    l = [];
                }
                
            }

            /*
            let data = d3.root.descendants();
            let lst = {};
            let depth = 0;
            let l=[];

            for(let i=0; i<data.length;i++){
                l.push(data[i])
                if(data[i+1] == undefined){
                    //lst[depth] = l;  //Daten des kompletten Nodes werden hinzugefügt
                    lst[depth] = l.length //Anzahl der Nodes mit dieser depth werden hinzugefügt
                    break
                }
                if(data[i+1].depth != depth){
                    //lst[depth] = l;  //Daten des kompletten Nodes werden hinzugefügt
                    lst[depth] = l.length //Anzahl der Nodes mit dieser depth werden hinzugefügt
                    depth+=1;
                    l=[];
                }
            }
            */
            this.drawBoxPlot(Object.values(lst), ["Depth of tree"], 'Number of features');
            
        },
        async NumberFeatures(){   //Pro Tiefe bzw. Ebene des Baums sind es meistens ca ... Features --> Z.B. 20 Features nur auf einer Ebene, meistens sind es so ca 10 Features auf einer Ebene
            let data = this.data.rootNode.descendants();
            let depths=[]
            for(let i=0; i<data.length; i++){
                depths.push(data[i].d3Node.depth);
            }
            depths = depths.sort();
            let lst = {};
            let l=[];
            for(let i=0; i<depths.length; i++){
                l.push(depths[i]);
                if(depths[i] != depths[i+1]){
                    lst[depths[i]] = l.length;
                    l = [];
                }
            }
            this.drawBoxPlot(Object.values(lst), ["Number of Features"], 'Depth of Tree');
            
        },
        drawBoxPlot(data, headLine, label){
            const ctx = this.$refs.chartCanvas.getContext("2d");
            
            // Clear existing chart (if any)
            Chart.getChart(this.$refs.chartCanvas)?.destroy();

            const boxplotData = {
                // define label tree
                //labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                //labels: [1,2,3],
                //labels: Object.keys(data),
                labels: headLine,
                //labels: ["depth"],
                datasets: [{
                    label: label,
                    backgroundColor: 'rgba(255,0,0,0.5)',
                    borderColor: 'red',
                    borderWidth: 1,
                    outlierColor: '#999999',
                    padding: 10,
                    itemRadius: 1,
                    data: [
                    //randomValues(100, 0, 20),
                    //[{0:2514, 1:1816, 2:1179, 3:1409,4:1263, 5:77, 6:772, 7:97}]
                        data
                    ]
                }]
            };

            new BoxPlotChart(ctx, {
                //data: lst,
                data: boxplotData,
                options: {
                responsive: true,
                legend: {
                    position: "top",
                },
                maintainAspectRatio: false,
                layout: {
                    padding: {
                    left: -2,
                    right: 0,
                    top: 0,
                    bottom: 1,
                    },
                },
                scales: {
                    x: {
                    display: true,
                    },
                    y: {
                    display: true,
                    },
                },
                },
            });
        },
        updateMetadata() {
            return this.metadata.filter((entry) => {
                if (entry.name === FM_CHAR_NAME_DESC) {
                    this.name = entry.value; //handle special entry Name which defines Name of FM
                    return false;
                } else if (entry.name === FM_CHAR_HREF_DESC) {
                    this.fmHref = entry.value; //handle special entry Name which defines Name of FM
                    return false;
                } else if (entry.name === FM_CHAR_DESC_DESC) {
                    this.desc = entry.value; //handle special entry Name which defines Name of FM
                    return false;
                } else {
                    return true;
                }
            }).map((entry) => {
                var obj = {}; // temporry JSON object to fill for visualisation of metadata
                obj["name"] = entry.name;
                obj["value"] = this.getDisplayValue(entry);
                return obj;
            });
        },
        updateMetrics() {
            if (this.getMaxLevel > 2) {
                console.error("incompatible Metrics, format only supported until depth of 3");
            }
            let root_entries = this.getEntriesOnLevel(this.metrics, 0);
            let sub_entries = this.getEntriesOnLevel(this.metrics, 1);
            let sub_sub_entries = this.getEntriesOnLevel(this.metrics, 2);
            this.sortInParent(sub_entries, sub_sub_entries);
            this.sortInParent(root_entries, sub_entries);
            return root_entries;
        },
        updateAnalysis() {
            return this.analysis.map((entry) => {
                var obj = {}; // temporry JSON object to fill for visualisation of analysis
                obj["name"] = entry.name;
                // Value depends on if Size and Ratio are set
                obj["value"] = this.getDisplayValue(entry);
                return obj;
            });
        },
        checkEntryIfValueSet(entry) {
            // Iterate over entry, its childs and subchilds and check if some  value is set
            // Return True if any (sub) Value is set
            if(entry.value !== EMPTY_VALUE){
                return true; // own value set just return true
            }else if (entry.childs.length === 0) {
                return false; // No childs and own value not set
            }else{
                let someSubValueSet=false;
                entry.childs.forEach((child)=>{
                    someSubValueSet= someSubValueSet || this.checkEntryIfValueSet(child);
                });
                return someSubValueSet;
            }
        },
        sortInParent(parentArray, childArray) {
            // Iterate over given parentarray and add to each parent all childs with matching parent name
            childArray.forEach((child) => {
                parentArray.forEach((parent) => {
                    if (child.parent === parent.name) {
                        parent.childs.push(child);
                    }
                });
            });
        },
        getEntriesOnLevel(arr, level) {
            // Get all entries on certain level
            let entries = arr.filter((entry) => entry.level === level);
            return entries.map((entry) => {
                var obj = {};
                obj["name"] = entry.name;
                obj["value"] = this.getDisplayValue(entry);
                obj["parent"] = entry.parent;
                obj["childs"] = [];
                return obj;
            });
        },
        getMaxLevel(arr) {
            // Iterate over an Array of metric  entries and return the highest found level
            var maxLevel = 0;
            arr.forEach(function (entry, index) {
                if (entry.level >= maxLevel) {
                    maxLevel = entry.level;
                }
            });
            return maxLevel;
        },
        getDisplayValue(entry) {
            // Determine which value of an entry should be displayed ( size and ratio attributes overwrite value)
            // if no value present set to an empty string
            try {
                var value_str = "";
                if (entry.size !== null) {
                    value_str = "" + entry.size;
                    if (entry.ratio !== null) { // append optional ratio
                        var rounded = Math.round(100 * entry.ratio);
                        value_str = value_str + " (" + rounded + "\%)";
                    }
                } else if (entry.value !== null) {
                    value_str = entry.value;
                }
                return value_str
            } catch (e) {
                console.error(e);
                return "Failed to determine which value to display";
            }

        },
    },
};
</script>

<style scoped></style>
