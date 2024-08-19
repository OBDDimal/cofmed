<template>
    
    <div v-show="boxPlotBool" style="position: fixed; border-radius: 5%; padding: 1%; border-style: ridge; border-width: thick; border-color: black; background-color: white; right: 110%; width: 110%; z-index: 1000;" :style="{top: divTop +'px'}">
        <canvas ref="chartCanvas"></canvas>
    </div>

    <div v-show="pieChart" style="position: fixed; border-radius: 5%; padding: 1%; border-style: ridge; border-width: thick; border-color: black; background-color: white; right: 110%; width: 110%; z-index: 1000;" :style="{top: divTop +'px'}">
        <!--<Pie :data="dataPieChart" :options="options" />-->
        <canvas ref="pieChartCanvas"></canvas>
    </div>
    
    <v-card variant="elevated">

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

        
        <v-data-table v-model:expanded="expandedRoot" :headers="expandableHeaders" :items="showMetrics" item-value="name"  @mouseover="hoverFeature" @mouseleave="() => {boxPlotBool=false; pieChart=false;}">
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
                            item-value="name" :expand-on-click="true" @mouseover="boxPlotBool=false; pieChart=false;" > <!--:expand-on-click="true"-->
                            <template v-slot:headers>
                            </template>
                            
                            
                            <template v-slot:item.data-table-expand="{ item }">
                                <template v-if="item.raw.childs && item.raw.childs.length > 0" >
                                    <!--<v-icon icon="mdi-chevron-down"></v-icon>-->
                                    <!--<v-btn icon="mdi-chevron-down" variant="text"> </v-btn>-->  
                                   <!--<v-btn
                                        icon="mdi-chevron-down"
                                        variant="text">
                                    </v-btn>-->
                                    
                                    <!--<v-btn
                                        icon='mdi-chevron-down'
                                        variant="text"
                                        @click="toggleItem"
                                        ></v-btn>-->

                                        
                                        <!--<v-icon
                                        @click="handleExpansion(item, isExpanded)"
                                        >{{ isExpanded ? 'mdi-close' : 'mdi-pencil' }}</v-icon>-->
                                        <!--<v-icon >{{icon}}</v-icon>-->

                                        <!--<v-icon icon="mdi-chevron-down" @click="toggleItem"></v-icon>-->
                                    
                                        
                                        
                                        
                                        <v-btn v-if="toggleButton(item)"
                                        icon='mdi-chevron-up'
                                        variant="text"
                                        @click="clickToggle(item)"
                                        ></v-btn>

                                        <v-btn v-else
                                        icon='mdi-chevron-down'
                                        variant="text"
                                        @click="clickToggle(item);"
                                        ></v-btn>
                                    

                                        <!--@click="clickToggle(item)"-->


                                </template>
                            </template>
                            <template v-slot:expanded-row="{ item, columns }">
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
        <v-data-table :headers="factHeaders" :items="showAnalysis" item-value="name" @mouseover="hoverFeature" @mouseleave="() => { boxPlotBool = false; pieChart = false; resetColorD3(); }"> <!--@mouseleave="boxPlotBool=false"-->
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


import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'


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

        pieChart: false,
        //dataPieChart: [],
        pieChartCanvas: ref(null),//

        expandedItems:[],

        
    }),

    /*data() {
    

        return {
        name: "",
        fmHref: "",
        desc: "",
        expandedRoot: [],
        expandedSubs: [],
        expandedSubSubs: [],
        factHeaders: [{ key: "name", sortable: false }, { key: "value", sortable: false }],
        expandableHeaders: [{ key: 'data-table-expand' }, { key: "name", sortable: false }, { key: "value", sortable: false }],
        hideMissing: false,
        boxPlotBool: false,
        chartCanvas: ref(null),
        divTop: 0,

        // Setzen Sie die geänderten Metriken in die Daten Ihrer Komponente
        metrics: emptyMetrics
        };
    },*/
    watch: {},
    updated(){
        this.initializeAnalysis();
    },
    mounted(){
        this.initializeMetaData();
        this.initializeMetrics();
        
        
    },

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
    
    methods: {
        /*toggleItem(event) {
            const targetElement = event.target;
            //const targetText = targetElement.innerText;
            //const positionElement = targetElement.getBoundingClientRect();
            console.log(targetElement.classList.value);
            console.log(targetElement.classList[0]);

            if(targetElement.classList[0] == 'mdi-chevron-down'){
                targetElement.classList.value = "mdi-chevron-up mdi v-icon notranslate v-theme--variabilityLightTheme v-icon--size-default v-icon--clickable";
            }

            else{
                targetElement.classList.value = "mdi-chevron-down mdi v-icon notranslate v-theme--variabilityLightTheme v-icon--size-default v-icon--clickable";
            }

            
            

            //targetElement.icon = ""
            
            //this.$set(item, 'isExpanded', true);
            
            //this.isExpanded = !this.isExpanded;
            
        },*/
        toggleButton(item){
            //console.log(item.value);
            

            if(this.expandedItems.includes(item.value)){
                return true;
            }
            else{
                //this.expandedItems.push(item.value);
                return false;
            }

            

        },
        clickToggle(item){
            console.log(item);

            console.log(item.columns["data-table-expand"]);
            
            //item.columns["data-table-expand"] = item.raw.childs;
            item["data-table-expand"] = item.raw.childs;

            if(!this.expandedItems.includes(item.value)){
                this.expandedItems.push(item.value);
            }
            else{
                for(let i=0; i<this.expandedItems.length; i++){
                    if(this.expandedItems[i] == item.value){
                        this.expandedItems.splice(i,1);
                        break;
                    }
                }
                
            }

        },
        initializeMetaData(){
            let emptyMetaData = this.metadata;

            let data = this.data.rootNode.descendants();

            //console.log(this.data);

            emptyMetaData[0].value = data[0].name;


        },
        initializeMetrics(){
            let emptyMetrics = this.metrics;

            let data = this.data.rootNode.descendants();

            console.log(data);

            emptyMetrics[0].value = data.length;


            emptyMetrics[1].value = this.abstractFeature(data);
            emptyMetrics[2].value = this.concreteFeature(data);


            emptyMetrics[9].value = this.mandatoryCount(data);
            emptyMetrics[10].value = this.optionalCount(data); //Stimmt noch nicht


            emptyMetrics[16].value = this.maxDepth(data);
            emptyMetrics[17].value = this.meanDepth(data);
            emptyMetrics[18].value = this.medianDepth(data);


            emptyMetrics[20].value = this.avgChildren(data);
            emptyMetrics[21].value = this.minChildren(data);
            emptyMetrics[22].value = this.maxChildren(data);

            emptyMetrics[25].value = this.avgContraints(data);
            emptyMetrics[26].value = this.minContraints(data);
            emptyMetrics[27].value = this.maxContraints(data);

            emptyMetrics[29].value = this.requireConstraints(data);

        },
        initializeAnalysis(){
            let emptyAnalysis = this.analysis;

            let data = this.data.rootNode.descendants();

            

            emptyAnalysis[0].value = this.countCore(data);
            emptyAnalysis[1].value = this.countDead(data);
            emptyAnalysis[2].value = this.countFalseOptional(data);


        },
        requireConstraints(data){
            let c=0;
            for(let i=0; i<data.length; i++){
                if (data[i].isMandatory == true && data[i].isAbstract == true){
                    c+=1
                }
            }
            return c;
        },
        concreteFeature(data){
            let c=0;
            for(let i=0; i<data.length; i++){
                if (data[i].isAbstract ==false && data[i].isMandatory == false){
                    c+=1
                }
            }
            return c;
        },
        countCore(data){
            let core=0;
            for(let i=0; i<data.length; i++){
                if(data[i].core == true){
                    core +=1;
                }
            }
            return core;

        },
        countDead(data){
            let dead=0;
            for(let i=0; i<data.length; i++){
                if(data[i].dead == true){
                    dead +=1;
                }
            }
            return dead;
        },
        countFalseOptional(data){
            let falseOptional=0;
            for(let i=0; i<data.length; i++){
                if(data[i].falseOptional == true){
                    falseOptional +=1;
                }
            }
            return falseOptional;

        },
        maxDepth(data){
            let depth=0;
            for(let i=0; i<data.length; i++){
                if(depth<data[i].d3Node.depth){
                    depth = data[i].d3Node.depth;
                }
            }
            return depth;
        },
        medianDepth(data){
            let lst = [];
            for(let i=0; i<data.length; i++){
                lst.push(data[i].d3Node.depth);
            }

            lst = lst.sort();
            
            return lst[Math.round(lst.length / 2)];

        },
        meanDepth(data){
            let c = 0
            for(let i=0; i<data.length; i++){
                c += data[i].d3Node.depth;
            }
            return (c/data.length).toFixed(2);
        },
        avgChildren(data){
            let c = 0
            let f=0;
            for(let i=0; i<data.length; i++){
                if(data[i].children.length!=0){
                    c+=data[i].children.length;
                    f+=1;
                }
                
            }

            return (c/f).toFixed(2);
        },
        maxChildren(data){
            let max=0
            for(let i=0; i<data.length; i++){
                if (data[i].children.length > max){
                    max = data[i].children.length;
                }
            }
            return max
        },
        minChildren(data){
            let min=1000;
            for(let i=0; i<data.length; i++){
                if ((data[i].children.length < min) && (data[i].children.length != 0)){
                    min = data[i].children.length;
                }
            }
            return min
        },
        avgContraints(data){
            let c = 0
            for(let i=0; i<data.length; i++){
                c+=data[i].constraints.length;
            }

            return (c/data.length).toFixed(2);
        },
        maxContraints(data){
            let max=0
            for(let i=0; i<data.length; i++){
                if (data[i].constraints.length > max){
                    max = data[i].constraints.length;
                }
            }
            return max
        },
        minContraints(data){
            let min=1000;
            for(let i=0; i<data.length; i++){
                if (data[i].constraints.length < min){
                    min = data[i].constraints.length;
                }
            }
            return min
        },
        mandatoryCount(data){
            let c=0;
            for(let i=0; i<data.length; i++){
                if (data[i].isMandatory == true){
                    c+=1
                }
            }
            return c;
        },
        optionalCount(data){
            let c = 0
            for (let i=0; i<data.length; i++){
                if (data[i].isMandatory == false && data[i].groupType !== "or" && data[i].falseOptional == false){
                    c+=1
                }
            }
            return c;
        },
        abstractFeature(data){
            let c=0;
            for(let i=0; i<data.length; i++){
                if (data[i].isAbstract == true){
                    c+=1
                }
            }
            return c;
        },/*
        clickItem(items){
            console.log("CLICK");
            console.log(items);
            //items[3].childs[0].value = avgChildren;

            let data = this.data.rootNode.descendants();
            console.log(data);

            //features
            items[0].childs[0].value = this.abstractFeature(data); 


            //Tree relationships
            items[1].childs[0].value = this.mandatoryCount(data); 
            items[1].childs[1].value = this.optionalCount(data); 
            

            //depth of tree
            let maxdepth = this.maxDepth(data);
            let mediandepth = this.medianDepth(data);
            let meandepth = this.meanDepth(data);
            
            items[2].childs[0].value = maxdepth; 
            items[2].childs[1].value = meandepth;
            items[2].childs[2].value = mediandepth;


            //branching factor
            let avgchildren = this.avgChildren(data);
            let maxchildren = this.maxChildren(data);
            let minchildren = this.minChildren(data);
            items[3].childs[0].value = avgchildren;
            items[3].childs[1].value = minchildren;
            items[3].childs[2].value = maxchildren;


            //Cross-tree-constraints
            let avgcontraints = this.avgContraints(data);
            let mincontraints = this.minContraints(data);
            let maxcontraints = this.maxContraints(data);
            items[4].childs[3].value = avgcontraints;
            items[4].childs[4].value = mincontraints;
            items[4].childs[5].value = maxcontraints;

        },*/

        positionDiv(event){

            const targetElement = event.target;
            const targetText = targetElement.innerText;

            const positionElement = targetElement.getBoundingClientRect();
            //this.divTop = positionElement.top - 110;

            //const boxChart = this.$refs.chartCanvas.getContext("2d");

            if (this.pieChart){

                //console.log("PIE");

                const pieChart = this.$refs.pieChartCanvas.getContext("2d");


                let height = pieChart.canvas.style.height;

                let zahl = height.slice(0,-2);

                let zahl1 = parseInt(zahl);

                let mouse = event.pageY + zahl1;



                    if (mouse + 100 >= window.screen.height) {
                        // Element droht unten rauszugehen, Position anpassen
                        //this.divTop = window.innerHeight - positionElement.height;
                        
                        //console.log("IF");

                        //console.log(zahl1);

                        //console.log(window.screen.height);

                        
                        
                        //console.log(h1);

                        //console.log(positionElement.top - 110);

                        //this.divTop = window.screen.height - zahl1/2;

                        console.log("IF");

                        console.log(window.screen.height);

                        console.log(zahl1);

                        this.divTop = window.screen.height - 550;

                        
                    }

                    else{
                        //this.divTop = positionElement.top - 110;
                        this.divTop = positionElement.top - 190;
                    }
                }

                else if(this.boxPlotBool){
                    const boxPlotChart = this.$refs.chartCanvas.getContext("2d");


                    let height = boxPlotChart.canvas.style.height;

                    let zahl = height.slice(0,-2);

                    let zahl1 = parseInt(zahl);

                    let mouse = event.pageY + zahl1;



                    if (mouse + 100 >= window.screen.height) {
                        // Element droht unten rauszugehen, Position anpassen
                        //this.divTop = window.innerHeight - positionElement.height;
                        
                        //console.log("IF");

                        //console.log(zahl1);

                        //console.log(window.screen.height);

                        
                        
                        //console.log(h1);

                        //console.log(positionElement.top - 110);

                        //this.divTop = window.screen.height - zahl1/2;

                        console.log("IF");

                        console.log(window.screen.height);

                        console.log(zahl1);

                        this.divTop = window.screen.height - 390;

                        
                    }
                    else{
                        this.divTop = positionElement.top - 110;
                    }
                    
                }



                /*
                //console.log(this.$refs.chartCanvas.getContext("2d"));
                //console.log(positionElement);
                //console.log(window.innerHeight);

                //if(positionElement.top + divhöhe > window.innerHeight){

                //const ctx = this.$refs.chartCanvas.getContext("2d");
                //console.log(ctx.canvas);
                //console.log(ctx);
                //console.log(ctx.canvas.parentElement);
                //console.log(ctx.canvas.parentElement.offsetHeight);


                //let divheight = ctx.canvas.parentElement.offsetHeight/2;



                //this.divTop = positionElement.top - divheight;



                //console.log(ctx.canvas.style.height);



                //console.log(targetText);
                //this.divTop = positionElement.top - 110;


                const boxChart = this.$refs.chartCanvas.getContext("2d");

                const pieChart = this.$refs.pieChartCanvas.getContext("2d");
                //const ctx = this.$refs.chartCanvas.getContext("2d");


                console.log(boxChart.canvas);

                //console.log(pieChart.canvas.style.height);

                console.log(pieChart.canvas.hidden);


                //console.log(pieChart.canvas.style);

                //console.log(positionElement);



                //console.log(window.screen.height);
                //console.log(positionElement.bottom);
                //console.log(positionElement.top);
                //console.log(window.innerHeight);



                //console.log(event.pageY);

                let height = pieChart.canvas.style.height;

                let zahl = height.slice(0,-2);

                let zahl1 = parseInt(zahl);

                let mouse = event.pageY + zahl1;

                //console.log("HALLO");
                //console.log(mouse);






                //console.log(window.innerHeight);





                if (mouse + 100 >= window.screen.height) {
                // Element droht unten rauszugehen, Position anpassen
                //this.divTop = window.innerHeight - positionElement.height;

                //console.log("IF");

                //console.log(zahl1);

                //console.log(window.screen.height);

                let h1 = window.screen.height - zahl1;

                //console.log(h1);

                //console.log(positionElement.top - 110);

                this.divTop = window.screen.height - zahl1 - 230;


                }

                else{
                //this.divTop = positionElement.top - 110;
                this.divTop = positionElement.top - 110;
                }*/



                //Position
                /*
                const target = event.target; 
                const bounds = target.getBoundingClientRect();
                this.divTop = event.clientY - bounds.y;
                this.divTop = event.clientY;
                */




        },
        async hoverFeature(event){
            const targetElement = event.target;
            const targetText = targetElement.innerText;

            const positionElement = targetElement.getBoundingClientRect();


            
            
           

            //console.log(targetText);

            //console.log(this.data.rootNode.descendants());
            

            let d3 = this.d3Data


            //console.log(d3.root.descendants());
            switch(targetText){
                case "Depth of tree":
                    this.pieChart = false;
                    this.boxPlotBool=true;///////////////77
                    this.positionDiv(event);
                    this.depthFeature()
                    
                    break
                case "Features":                    
                    this.boxPlotBool=false;
                    //this.NumberFeatures();
                    this.pieChart = true;
                    this.positionDiv(event);
                    this.absractConcreteFeatures();
                    
                    //console.log("Features");
                    break
                case "Tree relationships":
                    this.boxPlotBool=false;
                    this.pieChart = true;
                    this.positionDiv(event);
                    this.treeRelation();
                    
                    //console.log("Tree relationships");
                    break
                case "Branching factor":
                    this.pieChart = false;
                    this.boxPlotBool=true;
                    this.positionDiv(event);
                    this.branchingFactor();
                    
                    //console.log("Branching factor");
                    break
                case "Cross-tree constraints":
                    this.pieChart = false;
                    this.boxPlotBool=true;
                    this.positionDiv(event);
                    this.crossTreeConstraints();
                    
                    //console.log("Cross-tree constraints");
                    break
                
                //Untere Hälfte
                case "Core features":
                    //console.log("Core features");
                    this.boxPlotBool=false;
                    this.pieChart = true;
                    this.positionDiv(event);
                    this.coreDeadFalseop();
                    

                    this.coreFeatures(d3);
                    break
                case "Dead features":
                    //console.log("Dead features");
                    this.boxPlotBool=false;
                    this.pieChart = true;
                    this.positionDiv(event);
                    this.coreDeadFalseop();
                    

                    this.deadFeatures(d3);
                    break
                case "False-optional features":
                    //console.log("False-optional features");
                    this.boxPlotBool=false;
                    this.pieChart = true;
                    this.positionDiv(event);
                    this.coreDeadFalseop();
                    

                    this.falseOptionalFeatures(d3);
                    break
            }



        
            

        },
        resetColorD3(){
            let d3 = this.d3Data;

            console.log("RESET");

            console.log(d3);
            
            if (d3!=undefined){
                let data = d3.root.descendants();
                for(let i=0; i<data.length; i++){
                    data[i].data.d3Node.data.isSearched = false;
                }

                update.updateSvg(d3);
            }

            //this.boxPlotBool = false;
            //this.pieChart = false;
            
            //this.boxPlotBool=false;

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

        async coreDeadFalseop(){
            /*let data = this.data.rootNode.descendants();
            let core = 0;
            let dead = 0;
            let optionalFalse = 0;
            for(let i=0; i<data.length; i++){
                console.log(data[i]);
                if(data[i].core == true){
                    core+=1;
                }
                if(data[i].dead == true){
                    dead += 1
                }
                if (data[i].falseOptional == true){
                    optionalFalse += 1;
                }
                
            }*/

            let data = this.data.rootNode.descendants();

            let core = this.countCore(data);
            let dead = this.countDead(data);
            let optionalFalse = this.countFalseOptional(data);

            let features = data.length - dead - core - optionalFalse;

            const data1 = {
                labels: ['Core Features', 'Dead Features', 'False-optional Features', 'Other Features'],
                datasets: [
                    {
                            
                        //backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
                        //data: [40, 20, 80, 10]
                        backgroundColor: ['#00D8FF', '#E46651', '#FFA500', '#bababa'],
                        data: [core, dead, optionalFalse, features],
                    }
                ]
            }



            const ctx = this.$refs.pieChartCanvas.getContext("2d");

            Chart.getChart(this.$refs.pieChartCanvas)?.destroy();

            new Chart(ctx, {
                type: 'pie',
                data: data1,
            });
        },

        async absractConcreteFeatures(){
            let data = this.data.rootNode.descendants();

            let abstractfeatures = this.abstractFeature(data);
            let concretefeatures = this.concreteFeature(data);

            let other = data.length - abstractfeatures - concretefeatures;

            const data1 = {
                labels: ['Abstract Features', 'Concrete Features', 'Other Features'],
                datasets: [
                    {
                            
                        //backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
                        //data: [40, 20, 80, 10]
                        backgroundColor: ['#41B883', '#E46651', '#bababa'],
                        data: [abstractfeatures, concretefeatures, other]
                    }
                ]
            }



            const ctx = this.$refs.pieChartCanvas.getContext("2d");

            Chart.getChart(this.$refs.pieChartCanvas)?.destroy();

            new Chart(ctx, {
                type: 'pie',
                data: data1,
            });
        },

        async treeRelation(){
            

            

            let data = this.data.rootNode.descendants();

            let optionalcount = this.optionalCount(data);
            let mandatorycount = this.mandatoryCount(data);

            let other = data.length - optionalcount - mandatorycount;

            const data1 = {
                labels: ['Optional Features', 'Mandatory Features', 'Other Features'],
                datasets: [
                    {
                            
                        //backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
                        //data: [40, 20, 80, 10]
                        backgroundColor: ['#41B883', '#E46651', '#bababa'],
                        data: [optionalcount, mandatorycount, other]
                    }
                ]
            }



            const ctx = this.$refs.pieChartCanvas.getContext("2d");

            Chart.getChart(this.$refs.pieChartCanvas)?.destroy();

            new Chart(ctx, {
                type: 'pie',
                data: data1,
            });

            




            //this.dataPieChart = data1;

            




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
        branchingFactor(){
            let data = this.data.rootNode.descendants();
            let childsLenght=[]
            for(let i=0; i<data.length; i++){
                if(data[i].children.length != 0){
                    childsLenght.push(data[i].children.length);
                }
                
            }
            //childsLenght = childsLenght.sort((a, b) => a - b);
            this.drawBoxPlot(childsLenght, ["Branching Factor"], 'Children per Feature');
        },
        crossTreeConstraints(){
            let data = this.data.rootNode.descendants();
            let constraintsLenght=[]
            for(let i=0; i<data.length; i++){
                /*if(data[i].constraints.length != 0){
                    constraintsLenght.push(data[i].constraints.length);
                }*/
                constraintsLenght.push(data[i].constraints.length);
                
            }
            //childsLenght = childsLenght.sort((a, b) => a - b);
            //console.log(constraintsLenght);
            this.drawBoxPlot(constraintsLenght, ["Cross-Tree-Contraints"], 'Constraints per Feature');
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
