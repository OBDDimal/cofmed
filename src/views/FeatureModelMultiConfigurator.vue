<template>
    <conf-navbar
        :command-manager='commandManager'
        :file-is-loaded='fmIsLoaded'
        :models='models'
        :service-is-feature-i-d-e='serviceIsFeatureIDE'
        :service-is-flask='!serviceIsFeatureIDE'
        :service-is-working='serviceIsWorking'
        :timelineBias='timelineBias'
        @download='downloadXML'
        @localStorage='save'
        @openConf='openFilePickerConf'
        @openEdit='redirectToEditor'
        @openFile='openFilePicker'
        @reset='resetCommand'
        @theme='dark = !dark'
        @timeline='(side) => changeTimeline(side)'
        @change-service='(boolean) => changeService(boolean)'
    ></conf-navbar>
    <v-container :fluid='true'>
        <template v-if='fmIsLoaded'>
            <v-timeline v-if='models.length > 15' density='comfortable' direction='horizontal' side='start'>
                <v-timeline-item
                    v-for='(item, i) in TrimmedModels'
                    :key='i'
                    :dot-color='colorVersion(item)'
                    :size='i % 5 !== 0  ? "" : "small"'
                    height='4vh'
                >
                    <template v-slot:icon>
                        <v-btn v-if='i % 5 === 0' :color='colorVersion(item)'
                               :disabled='item.selectionState !== SelectionState.Unselected && item.selectionState !== SelectionState.ExplicitlySelected'
                               :icon='true'
                               height='2.2vh' @click='selectVersion(item)'></v-btn>
                        <v-tooltip :text='item.name' location='top'>
                            <template v-slot:activator='{ props }'>
                                <v-btn v-if='i % 5 !==0' :color='colorVersion(item)' :disabled='item.selectionState !== SelectionState.Unselected && item.selectionState !== SelectionState.ExplicitlySelected'
                                       :icon='true'
                                       height='2.2vh'
                                       v-bind='props'
                                       width='2vh' @click='selectVersion(item)'></v-btn>
                            </template>
                        </v-tooltip>
                    </template>
                    <div v-if='i % 5 === 0' class='text-center'>
                        {{ item.name }}
                    </div>
                </v-timeline-item>
            </v-timeline>
            <v-timeline v-else density='comfortable' direction='horizontal' side='start'>
                <v-timeline-item
                    v-for='(item, i) in models'
                    :key='i'
                    :dot-color='colorVersion(item)'
                    height='5vh'
                    size='small'
                >
                    <template v-slot:icon>
                        <v-btn :color='colorVersion(item)'
                               :disabled='item.selectionState !== SelectionState.Unselected && item.selectionState !== SelectionState.ExplicitlySelected'
                               :icon='true'
                               height='2.2vh'
                               @click='selectVersion(item)'></v-btn>
                    </template>
                    <div class='text-center'>
                        {{ item.name }}
                    </div>
                </v-timeline-item>
            </v-timeline>
            <v-row>
                <v-col cols='4'>
                    <v-card height='79.5vh'>
                        <v-card-title>
                            <v-layout class='align-center' row>
                                <!-- Heading features -->
                                <div class='mr-2'>
                                    <span>Features ({{ featuresTrimmed?.length }}) </span>
                                </div>

                                <!-- Statistics about the features as tooltip-->
                                <v-tooltip location='bottom'>
                                    <template v-slot:activator='{ props }'>
                                        <v-icon v-bind='props'>mdi-information</v-icon>
                                    </template>
                                    <table>
                                        <tr>
                                            <th>Selection</th>
                                            <th>All</th>
                                        </tr>
                                        <tr>
                                            <td>All</td>
                                            <td>{{ featureModelMulti.features?.length }}</td>
                                        </tr>
                                        <tr>
                                            <td>Unselected</td>
                                            <td>{{
                                                    countSelectionStateInList(featureModelMulti.features, SelectionState.Unselected)
                                                }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Explicitly selected</td>
                                            <td>{{
                                                    countSelectionStateInList(featureModelMulti.features, SelectionState.ExplicitlySelected)
                                                }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Explicitly deselected</td>
                                            <td>{{
                                                    countSelectionStateInList(featureModelMulti.features, SelectionState.ExplicitlyDeselected)
                                                }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Implicitly selected</td>
                                            <td>{{
                                                    countSelectionStateInList(featureModelMulti.features, SelectionState.ImplicitlySelected)
                                                }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Implicitly deselected</td>
                                            <td>{{
                                                    countSelectionStateInList(featureModelMulti.features, SelectionState.ImplicitlyDeselected)
                                                }}
                                            </td>
                                        </tr>
                                    </table>
                                </v-tooltip>
                                <div style='width: 18rem'></div>
                                <!--<v-checkbox
                                    v-model='validCheckbox'
                                    density='compact'
                                    hide-details
                                    label='Valid'
                                ></v-checkbox> -->
                            </v-layout>
                        </v-card-title>

                        <!-- Tabs to select (Feature Model Viewer, List Tree, Cross-Tree Constraints
                        <v-tabs v-model='tabsFirstColumn'>
                            <v-tab key='dataTable'>Data Table</v-tab>
                            <v-tab key='treeView'>Tree View</v-tab>
                        </v-tabs> -->
                        <!-- Search box for features -->
                        <v-layout class='align-center justify-center' row>
                            <v-menu open-on-hover>
                                <template v-slot:activator='{ props }'>
                                    <v-btn
                                        class='mx-1'
                                        icon='mdi-menu'
                                        v-bind='props'
                                    >
                                    </v-btn>
                                </template>
                                <v-list density='compact'>
                                    <v-list-item title='Show Implicit Selected Features'>
                                        <template v-slot:prepend>
                                            <v-checkbox
                                                v-model='showImplicitSelectedFeatures'
                                                density='compact'
                                                hide-details
                                                @input='updateFeatures'
                                            ></v-checkbox>
                                        </template>
                                    </v-list-item>
                                    <v-list-item title='Show Implicit Deselected Features'>
                                        <template v-slot:prepend>
                                            <v-checkbox
                                                v-model='showImplicitDeselectedFeatures'
                                                density='compact'
                                                hide-details
                                                @input='updateFeatures'
                                            ></v-checkbox>
                                        </template>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                            <v-text-field
                                v-model='searchFeatures'
                                :clearable=true
                                append-inner-icon='mdi-magnify'
                                class='mr-2 ml-2'
                                hide-details
                                label='Search'
                                single-line
                            ></v-text-field>
                        </v-layout>
                        <!--
                        <v-window v-model='tabsFirstColumn'>

                            Feature Model Viewer
                            <v-window-item key='dataTable'>-->


                        <!-- Table with all features that are currently fitlered and searched -->
                        <v-data-table
                            :headers='headersFeatures'
                            :height="pageTableSize === -1 ? '68.75vh' : '62.75vh'"
                            :items='featuresTrimmed'
                            :items-per-page='pageTableSize'
                            :search='searchFeatures'
                            fixed-header
                            item-key='name'
                            show-group-by
                            single-select
                        >
                            <!-- Customization of the column SELECTIONSTATE -->
                            <template v-slot:item.selectionState='{ item }'>
                                <DoubleCheckbox v-bind:selection-item='item'
                                                @select='(selection) => decisionPropagation(item, selection)'></DoubleCheckbox>
                            </template>

                            <!-- Customization of the column NAME -->
                            <template v-slot:item.name='{ item }'>
                                <div @mouseleave='removeVersionsHover' @mouseover='getVersions(item)'>
                                    <v-tooltip location='bottom'>
                                        <template v-slot:activator='{ props }'>
                                            <span v-bind='props'>{{ item.name }}</span>
                                            <template v-if='item.isAbstract'>
                                                <i> Abstract</i>
                                            </template>
                                        </template>
                                    </v-tooltip>
                                </div>
                            </template>

                            <template v-if='pageTableSize === -1' v-slot:bottom>
                            </template>
                        </v-data-table>
                        <!--
                            </v-window-item>
                            <v-window-item key='treeView'>
                                <v-treeview
                                    :items='[featureModelMulti.root]'
                                    height='72vh'
                                >
                                </v-treeview>
                                <template v-slot:prepend='{ item }'>
                                    <v-icon
                                        v-if='item.children'
                                        :icon="`mdi-${item.id === 1 ? 'home-variant' : 'folder-network'}`"
                                    ></v-icon>
                                </template>
                            </v-window-item>
                        </v-window>
                        -->
                    </v-card>
                </v-col>

                <v-col cols='8'>

                    <!-- Details of the selected version -->
                    <v-card height='79.5vh'>
                        <v-card-title>Details for {{ featureModelName }}:</v-card-title>

                        <!-- Tabs to select (Feature Model Viewer, List Tree, Cross-Tree Constraints
                        <v-tabs v-model='tabsSecondColumn'>
                            <v-tab key='featureModelViewer'>Feature Model Viewer</v-tab>
                            <v-tab key='ctc'>Cross Tree Constraints</v-tab>
                            <v-tab key='conf'>Configuration History</v-tab>
                        </v-tabs> -->

                        <v-card-text>
                            <v-data-table
                                :headers="[{title: 'Description', key: 'description'}, {title: '# Features Free', key: 'newUnselectedFeatures'}, {title: '# Versions Free', key: 'newUnselectedVersions'}]"
                                :item-class="command => command.marked ? 'active-command clickable' : 'clickable'"
                                :items='commandManager.commands'
                                class='elevation-1'
                                disable-filtering
                                disable-pagination
                                disable-sort
                                fixed-header
                                height='68.75vh'
                                hide-default-footer
                                single-select
                                @click:row='redoCommand'
                            >
                                <template v-slot:item.newUnselectedFeatures='{ item }'>
                                    {{ item.newUnselectedFeatures.length }}
                                </template>

                                <template v-slot:item.newUnselectedVersions='{ item }'>
                                    {{ item.newUnselectedVersions.length }}
                                </template>
                            </v-data-table>
                            <!-- Remove Feature Model Viewer until important
                            <v-window v-model='tabsSecondColumn'>

                                <v-window-item key='featureModelViewer'>

                                    <feature-model-viewer-solo ref='featureModelViewerSolo'
                                                               :dark='dark'
                                                               :feature-model='featureModelMulti'
                                                               :fm-is-loaded='fmIsLoaded'
                                                               @select='(name) => searchFeatures = name'
                                    ></feature-model-viewer-solo>
                                </v-window-item>

                                <v-window-item key='ctc'>

                                    <v-btn class='mx-2' outlined
                                                           rounded @click='filteredConstraints = allConstraints.filter(c => c.evaluation === false)'>
                                                      Only invalid
                                                    </v-btn>
                                                    <v-btn outlined rounded @click='filteredConstraints = allConstraints'>Reset</v-btn>

                                    <v-data-table
                                        v-model:sort-by='sortByCTC'
                                        :custom-key-sort='sortByCTCEval'
                                        :footer-props="{'items-per-page-options': [10, 20, 50, 100, 200]}"
                                        :headers='headersCTC'
                                        :items='filteredConstraints'
                                        fixed-header
                                        height='59.5vh'
                                        show-group-by
                                    >

                                        <template v-slot:item.formula='{ item }'>
                                            <div v-for='(f, i) in item.formula' :key='i'
                                                 style='display: inline;'>
                                                <v-chip
                                                    v-if='f instanceof FeatureNodeConstraintItem'
                                                    :color='getColorOfConstraintItem(f)'
                                                    class='ml-2 mr-2'
                                                    @click='searchFeatures = f.featureNode.name'
                                                >
                                                    {{ f.featureNode.name }}
                                                </v-chip>
                                                <span v-else>{{ f }}</span>
                                            </div>
                                        </template>

                                        <template v-slot:item.evaluation='{ item }'>
                                            <v-avatar :color='evaluateCTC(item)'
                                                      size='30'></v-avatar>
                                        </template>

                                    </v-data-table>
                                </v-window-item>
                                <v-window-item key='conf'>
                                    <v-data-table
                                        :headers="[{title: 'Description', key: 'description'}, {title: '# Possible configs', key: 'newSatCount'}, {title: 'Validation', key: 'valid'}]"
                                        :item-class="command => command.marked ? 'active-command clickable' : 'clickable'"
                                        :items='commandManager.commands'
                                        class='elevation-1'
                                        disable-filtering
                                        disable-pagination
                                        disable-sort
                                        fixed-header
                                        height='59.75vh'
                                        hide-default-footer
                                        single-select
                                        @click:row='redoCommand'
                                    >

                                        <template v-slot:item.valid='{ item }'>
                                            {{ item.valid ? 'true' : 'false' }}
                                        </template>
                                    </v-data-table>
                                </v-window-item>
                            </v-window> -->

                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
            <FeatureModelTreeLoadingDialog :show='isLoading' :text='"Waiting for backend"' />
        </template>
        <template v-else>
            <v-card :class="{ 'grey lighten-2': dragover }"
                    :color="dragover ? 'grey-lighten-1': ''"
                    class='d-flex align-center justify-center'
                    height='89.5vh'
                    @click='openFilePicker'
                    @drop.prevent='onFileDrop($event)'
                    @dragover.prevent='dragover = true'
                    @dragenter.prevent='dragover = true'
                    @dragleave.prevent='dragover = false'
            >
                <v-card-text>
                    <v-row :dense='true' align='center' class='d-flex flex-column'>
                        <v-icon class='mt-5' size='100'>
                            mdi-cloud-upload
                        </v-icon>
                        <p class='text-h4'>
                            Drop your FeatureModel file here, or click to select it.
                        </p>
                        <v-btn class='mt-6 text-h4 ' color='primary' rounded='xl' variant='text'
                               @click.stop='openFromLocalStorage'>
                            Or click here to load an example.
                        </v-btn>
                    </v-row>
                </v-card-text>

            </v-card>
        </template>
    </v-container>
    <input
        id='filePicker'
        accept='.xml, .uvl, .dimacs'
        class='d-none'
        multiple
        type='file'
        @change='onFileInputChanged'
    >
    <input
        id='filePickerConf'
        accept='.xml'
        class='d-none'
        multiple
        type='file'
        @change='openConfig'
    >


</template>

<script>
import DoubleCheckbox from '@/components/Configurator/DoubleCheckbox.vue';
import { ConfiguratorManager } from '@/classes/Configurator/ConfiguratorManager';
import { DecisionPropagationCommand } from '@/classes/Commands/Configurator/DecisionPropagationCommand';
import { it, tr } from 'vuetify/locale';
import api from '@/services/api.service';
import { FeatureNodeConstraintItem } from '@/classes/Constraint/FeatureNodeConstraintItem';
import { SelectionState } from '@/classes/SelectionState';
import FeatureModelViewerSolo from '@/components/Configurator/FeatureModelViewerSolo.vue';
import { FeatureModelSolo } from '@/classes/Configurator/FeatureModelSolo';
import { useAppStore } from '@/store/app';
import { ResetCommand } from '@/classes/Commands/Configurator/ResetCommand';
import { LoadConfigCommand } from '@/classes/Commands/Configurator/LoadConfigCommand';
import {
    decisionPropagationFL, decisionPropagationMulti, getExample,
    getFeaturesAndVersionFromHistory,
    pingFL,
    registerHistory
} from '@/classes/BackendAccess/FlaskAccess';
import { pingFIDE } from '@/classes/BackendAccess/FeatureIDEAccess';
import beautify from 'xml-beautifier';
import ConfNavbar from '@/components/Configurator/ConfNavbar.vue';
import { FeatureModelMulti } from '@/classes/Configurator/FeatureModelMulti';
import { variabilityDarkTheme, variabilityLightTheme } from '@/plugins/vuetify';
import { ResetCommandMulti } from '@/classes/Commands/MultiConfigurator/ResetCommandMulti';
import { DecisionPropagationCommandMulti } from '@/classes/Commands/MultiConfigurator/DecisionPropagationCommandMulti';
import FeatureModelTreeLoadingDialog from '@/components/FeatureModel/FeatureModelTreeLoadingDialog.vue';
import axios from 'axios';
import fs from 'vite-plugin-fs/browser';

const appStore = useAppStore();


export default {
    name: 'FeatureModelSoloConfigurator',
    components: { FeatureModelTreeLoadingDialog, ConfNavbar, FeatureModelViewerSolo, DoubleCheckbox },

    data: () => ({
        headersFeatures: [
            { title: 'Selection', key: 'selectionState', width: '10%' },
            { title: 'Name', key: 'name', groupable: false }
        ],
        headersCTC: [{ title: 'Valid', value: 'evaluation', key: 'evaluation' }, {
            title: 'Constraints',
            key: 'formula',
            value: 'formula'
        }],
        sortByCTCEval: {
            evaluation: (a, b) => {
                if (a) {
                    return 1;
                } else if (b) {
                    return -1;
                } else if (a !== undefined) {
                    return 1;
                } else if (b !== undefined) {
                    return -1;
                }
                return 0;
            }
        },
        sortByCTC: [{ key: 'evaluation', order: 'desc' }],
        models: [],
        commandManager: new ConfiguratorManager(),
        initialResetCommand: undefined,
        featureModelMulti: FeatureModelMulti,
        fmIsLoaded: false,
        dragover: false,
        featureModelName: '',
        features: undefined,
        featuresTrimmed: undefined,
        showImplicitSelectedFeatures: true,
        showImplicitDeselectedFeatures: true,
        filteredConstraints: undefined,
        allConstraints: undefined,
        searchFeatures: '',
        tabsColumnTopRight: undefined,
        tabsFirstColumn: undefined,
        tabsSecondColumn: undefined,
        showOpenDialog: false,
        showOpenConfigDialog: false,
        dark: false,
        serviceIsWorking: false,
        serviceIsFeatureIDE: false,
        validCheckbox: true,
        xml: undefined,
        timelineBias: 0,
        ident: undefined,
        isLoading: false
    }),

    props: {
        id: undefined
    },

    created() {
        if (this.id === 'local') {
            this.openFromLocalStorage();
        } else if (this.id) {
            this.initData();
        }
        this.setStartService();
    },

    methods: {
        initData() {
            api.get(`${import.meta.env.VITE_APP_DOMAIN}files/${this.id}/`).then(
                (data) => {
                    api.get(data.data.local_file).then((rawData) => {
                        this.xml = beautify(rawData.data);
                        this.featureModelSolo = FeatureModelSolo.loadXmlDataFromFile(this.xml);
                        this.features = this.featureModelSolo.features;
                        this.updateFeatures();
                        this.featuresTrimmed = this.features.filter((f) => !f.featureNodes.find((node) => node.name === f.name).isAbstract);
                        this.featureModelName = data.data.label;
                        this.featureModelSolo.name = this.featureModelName;
                        this.allConstraints = this.featureModelSolo.constraints.map((e) => ({
                            constraint: e,
                            formula: e.toList(),
                            evaluation: e.evaluate()
                        }));
                        this.filteredConstraints = this.allConstraints;
                        this.initialResetCommand = new ResetCommand(this.featureModelSolo, this.xml);
                        this.initialResetCommand.execute();
                    });
                }
            );
        },

        save() {
            localStorage.featureModelData = this.featureModelSolo.parseToConfig();
            window.onbeforeunload = null;

            appStore.updateSnackbar(
                'Successfully saved in local storage',
                'success',
                5000,
                true
            );
        },

        redirectToEditor() {
            localStorage.featureModelData = this.xml;
            this.$router.push({ path: '/editor/local' });
        },

        downloadXML() {
            this.featureModelSolo.downloadXMLConfig();
        },

        redoCommand(event, row) {
            let command = row.item;
            this.commandManager.redoCommand(command);
        },

        resetFeaturesTable() {
            this.searchFeatures = '';
            this.features = this.featureModelSolo.features;
            this.versionForFilteringFeatures = undefined;
        },

        async decisionPropagation(item, selectionState) {
            this.isLoading = true;
            const data = this.getSelection();
            if (selectionState === SelectionState.ExplicitlySelected) {
                data.selection.push(item);
            } else if (selectionState === SelectionState.ExplicitlyDeselected) {
                data.deselection.push(item);
            } else if (selectionState === SelectionState.Unselected) {
                if (item.selectionState === SelectionState.ExplicitlySelected) {
                    data.selection.pop(item);
                } else if (item.selectionState === SelectionState.ExplicitlyDeselected) {
                    data.deselection.pop(item);
                }
            }
            const selectionData = await this.getSelectionDataFromAPI(data);
            let command = new DecisionPropagationCommandMulti(this.featureModelMulti, selectionData, item, selectionState, this.validCheckbox);
            this.commandManager.execute(command);
            this.updateFeatures();
            this.isLoading = false;
        },

        resetCommand() {
            this.commandManager.execute(this.initialResetCommand.copy());
            this.updateFeatures();
        },

        countSelectionStateInList(list, selectionState) {
            if (list) {
                return list.filter(x => x.selectionState === selectionState).length;
            } else {
                return 0;
            }
        },

        getColorOfConstraintItem(featureNodeConstraintItem) {
            const e = featureNodeConstraintItem.evaluate();
            if (e === undefined) {
                return undefined;
            } else if (e) {
                return 'green';
            } else {
                return 'red';
            }
        },

        evaluateCTC(item) {
            const evaluation = item.constraint.evaluate();
            item.evaluation = evaluation;
            return evaluation ? 'green' : (evaluation === undefined ? '' : 'red');
        },


        openFilePicker() {
            document.getElementById('filePicker').click();
        },

        openFilePickerConf() {
            document.getElementById('filePickerConf').click();
        },

        onFileInputChanged(e) {
            this.openFile(e.target.files);
        },

        async openFromLocalStorage() {
            this.fmIsLoaded = true;
            this.isLoading = true;
            /*
            const dir = await fs.readdir('./backend/testdata');
            let files = []; */
            try {
                /*
                for (const f of dir) {
                    if (f.includes('fiasco')) {
                        let response = await axios.get('/backend/testdata/' + f, {responseType: 'blob'});
                        files.push(new File([response.data], f));
                    }
                }*/
                this.ident = await getExample();
                if (this.ident === undefined) {
                    throw new Error('No connection to backend.');
                }
                const data = await getFeaturesAndVersionFromHistory(this.ident);
                this.featureModelMulti = new FeatureModelMulti(data.mapping, data.versions);
                this.commandManager = new ConfiguratorManager();
                this.features = this.featureModelMulti.features;
                this.models = this.featureModelMulti.versions;
                const selectionData = await this.getSelectionDataFromAPI();
                this.initialResetCommand = new ResetCommandMulti(this.featureModelMulti, selectionData, 0);
                this.initialResetCommand.execute();
                this.updateFeatures();
            } catch (e) {
                console.log(e);
                appStore.updateSnackbar(
                    'Could not load the feature model.',
                    'error',
                    5000,
                    true
                );
                this.fmIsLoaded = false;
            }
            this.isLoading = false;
        },

        getVersions(item) {
            /*this.removeVersionsHover();
            this.models.filter(model => model.features.map(feature => feature.name).includes(item.name)).forEach(model => model.hovered = true);*/
        },

        removeVersionsHover() {
            /*this.models.forEach(model => model.hovered = false);*/
        },

        async openFile(files) {
            this.fmIsLoaded = true;
            this.isLoading = true;
            this.models = [];
            try {
                this.featureModelName = files[0].name.slice(0, files[0].name.indexOf('-'));
                console.log(files)
                this.ident = await registerHistory(files, this.featureModelName);
                if (this.ident === undefined) {
                    throw new Error('No connection to backend.');
                }
                const data = await getFeaturesAndVersionFromHistory(this.ident);
                this.featureModelMulti = new FeatureModelMulti(data.mapping, data.versions);
                this.commandManager = new ConfiguratorManager();
                this.features = this.featureModelMulti.features;
                this.models = this.featureModelMulti.versions;
                const selectionData = await this.getSelectionDataFromAPI();
                this.initialResetCommand = new ResetCommandMulti(this.featureModelMulti, selectionData, 0);
                this.initialResetCommand.execute();
                this.updateFeatures();
            } catch (e) {
                console.log(e);
                appStore.updateSnackbar(
                    'Could not load the feature model.',
                    'error',
                    5000,
                    true
                );
                this.fmIsLoaded = false;
            }
            this.showOpenDialog = false;
            this.isLoading = false;
        },

        async openConfig(e) {
            if (e.target.files.length > 1) {
                appStore.updateSnackbar(
                    'Cannot load more than one feature model.',
                    'error',
                    5000,
                    true
                );
            } else {
                let file = e.target.files[0];
                let data = await file.text();
                try {
                    const features = FeatureModelSolo.loadXmlDataFromConfig(data);
                    const command = new LoadConfigCommand(this.featureModelSolo, features);
                    this.commandManager.execute(command);
                    this.updateFeatures();
                } catch (e) {
                    console.log(e);
                    appStore.updateSnackbar(
                        'Could not load the configuration file.',
                        'error',
                        5000,
                        true
                    );
                }
            }
        },

        onFileDrop(event) {
            this.dragover = false;
            if (event.dataTransfer.files.length > 1) {
                appStore.updateSnackbar(
                    'Cannot load more than one feature model.',
                    'error',
                    5000,
                    true
                );
            } else {
                this.openFile(event.dataTransfer.files);
            }
        },

        updateFeatures() {
            let returnFeatures = this.features;

            if (this.showImplicitSelectedFeatures) {
                returnFeatures = returnFeatures.filter((f) => (f.selectionState !== SelectionState.ImplicitlySelected));
            }
            if (this.showImplicitDeselectedFeatures) {
                returnFeatures = returnFeatures.filter((f) => (f.selectionState !== SelectionState.ImplicitlyDeselected));
            }

            this.featuresTrimmed = returnFeatures;
        },

        async changeService(boolean) {
            if (boolean) {
                let isAvailable = await pingFIDE();
                if (!isAvailable) {
                    appStore.updateSnackbar(
                        'Cannot change service because FeatureIDE service is down.',
                        'error',
                        5000,
                        true
                    );
                } else {
                    this.serviceIsFeatureIDE = boolean;
                    this.serviceIsWorking = true;
                }
            } else {
                let isAvailable = await pingFL();
                if (!isAvailable) {
                    appStore.updateSnackbar(
                        'Cannot change service because Flask service is down.',
                        'error',
                        5000,
                        true
                    );
                } else {
                    this.serviceIsFeatureIDE = boolean;
                    this.serviceIsWorking = true;
                }
            }
        },

        changeFeatureModel(item) {
            /*
            this.xml = item.xml;
            this.allConstraints = item.constraints.map((e) => ({
                constraint: e,
                formula: e.toList(),
                evaluation: e.evaluate()
            }));
            this.filteredConstraints = this.allConstraints;
            this.featureModelMulti = item;*/
        },

        getSelection() {

            const selection = this.featureModelMulti.features.filter(f => f.selectionState === SelectionState.ExplicitlySelected);
            const deselection = this.featureModelMulti.features.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected);
            const selectionVersion = this.featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ExplicitlySelected);
            const deselectionVersion = this.featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected);

            return {
                selection: selection,
                deselection: deselection,
                selectionVersion: selectionVersion,
                deselectionVersion: deselectionVersion
            };
        },

        async getWorkingService() {
            let result;
            if (this.serviceIsFeatureIDE) {
                result = await pingFL();
                if (result) {
                    this.serviceIsFeatureIDE = false;
                    this.serviceIsWorking = true;
                }
            } else {
                /*
                result = await pingFIDE();
                if (result) {
                    this.serviceIsFeatureIDE = true;
                    this.serviceIsWorking = true;
                }*/
            }
            return result;
        },

        async getSelectionDataFromAPI(data) {

            let selectionData = undefined;
            if (!this.serviceIsWorking) {
                let serviceStatus = await this.setStartService();
                if (!serviceStatus) {
                    appStore.updateSnackbar(
                        'No service is available.',
                        'error',
                        5000,
                        true
                    );
                    return undefined;
                }
            }

            if (!data) {
                const apiData = await decisionPropagationMulti(this.ident, [], []);
                if (!apiData) {
                    this.serviceIsWorking = false;
                    appStore.updateSnackbar(
                        'Cannot use service because service is down. Retrying...',
                        'error',
                        5000,
                        true
                    );
                    if (await this.getWorkingService()) {
                        return await this.getSelectionDataFromAPI(data);
                    } else {
                        appStore.updateSnackbar(
                            'No service is available.',
                            'error',
                            5000,
                            true
                        );
                        return undefined;
                    }
                }
                if (apiData.valid === false) {
                    return apiData;
                }
                selectionData = {
                    valid: apiData.valid,
                    eSF: [],
                    iSF: this.featureModelMulti.features.filter(f => apiData.config.includes(f.id)),
                    eDF: [],
                    iDF: this.featureModelMulti.features.filter(f => apiData.config.includes(f.id * -1)),
                    uF: this.featureModelMulti.features.filter(f => apiData.features_free.includes(f.id)),
                    eSV: [],
                    iSV: this.featureModelMulti.versions.filter(f => apiData.versions.includes(f.id)),
                    eDV: [],
                    iDV: this.featureModelMulti.versions.filter(f => apiData.versions_disabled.includes(f.id)),
                    uV: this.featureModelMulti.versions.filter(f => !apiData.versions.includes(f.id) && !apiData.versions_disabled.includes(f.id))
                };

            } else {
                const mappedFeatures = data.selection.map(f => f.id).concat(data.deselection.map(f => f.id * (-1)));
                const mappedVersions = data.selectionVersion.map(f => f.id).concat(data.deselectionVersion.map(f => f.id * (-1)));
                const apiData = await decisionPropagationMulti(this.ident, mappedFeatures, mappedVersions);
                console.log(apiData);
                if (!apiData) {
                    this.serviceIsWorking = false;
                    appStore.updateSnackbar(
                        'Cannot use service because service is down. Retrying...',
                        'error',
                        5000,
                        true
                    );
                    if (await this.getWorkingService()) {
                        return await this.getSelectionDataFromAPI(data);
                    } else {
                        appStore.updateSnackbar(
                            'No service is available.',
                            'error',
                            5000,
                            true
                        );
                        return undefined;
                    }
                }
                if (apiData.valid === false) {
                    return apiData;
                }
                selectionData = {
                    valid: apiData.valid,
                    eSF: data.selection,
                    iSF: this.featureModelMulti.features.filter(f => !data.selection.includes(f) && apiData.config.includes(f.id)),
                    eDF: data.deselection,
                    iDF: this.featureModelMulti.features.filter(f => !data.deselection.includes(f) && apiData.config.includes(f.id * (-1))),
                    uF: this.featureModelMulti.features.filter(f => apiData.features_free.includes(f.id)),
                    eSV: data.selectionVersion,
                    iSV: this.featureModelMulti.versions.filter(f => !data.selectionVersion.includes(f) && apiData.versions.includes(f.id)),
                    eDV: data.deselectionVersion,
                    iDV: this.featureModelMulti.versions.filter(f => !data.deselectionVersion.includes(f) && apiData.versions_disabled.includes(f.id)),
                    uV: this.featureModelMulti.versions.filter(f => !data.selectionVersion.includes(f) && !apiData.versions.includes(f.id) && !data.deselectionVersion.includes(f) && !apiData.versions_disabled.includes(f.id))
                };
            }

            return selectionData;
        },

        async setStartService() {
            let result = await pingFL();
            if (result) {
                this.serviceIsFeatureIDE = false;
                this.serviceIsWorking = true;
                return result;
            }

            result = await pingFIDE();
            if (result) {
                this.serviceIsFeatureIDE = true;
                this.serviceIsWorking = true;
            }
            return result;
        },

        changeTimeline(side) {
            if (side) {
                this.timelineBias += 20;
            } else {
                this.timelineBias -= 20;
            }
        },

        colorVersion(item) {
            const dark = this.$vuetify.theme.global.current.dark;
            if (item.selectionState === SelectionState.ExplicitlySelected) {
                return dark ? variabilityDarkTheme.colors.selected : variabilityLightTheme.colors.selected;
            } else if (item.selectionState === SelectionState.ImplicitlyDeselected) {
                return dark ? variabilityDarkTheme.colors['imp-deselected'] : variabilityLightTheme.colors['imp-deselected'];
            } else if (item.selectionState === SelectionState.ExplicitlyDeselected) {
                return dark ? variabilityDarkTheme.colors.deselected : variabilityLightTheme.colors.deselected;
            } else if (item.selectionState === SelectionState.ImplicitlySelected) {
                return dark ? variabilityDarkTheme.colors['imp-selected'] : variabilityLightTheme.colors['imp-selected'];
            } else {
                return dark ? variabilityLightTheme.colors.background : variabilityDarkTheme.colors.background;
            }
        },

        async selectVersion(item) {
            this.isLoading = true;
            const data = this.getSelection();
            let selectionState;
            if (item.selectionState === SelectionState.ExplicitlySelected) {
                selectionState = SelectionState.Unselected;
                data.selectionVersion.pop(item);
            } else if (item.selectionState === SelectionState.Unselected) {
                selectionState = SelectionState.ExplicitlySelected;
                data.selectionVersion.push(item);
            }

            const selectionData = await this.getSelectionDataFromAPI(data);
            let command = new DecisionPropagationCommandMulti(this.featureModelMulti, selectionData, item, selectionState, this.validCheckbox);
            this.commandManager.execute(command);
            this.updateFeatures();
            this.isLoading = false;
        }
    },

    computed: {
        it() {
            return it;
        },
        tr() {
            return tr;
        },

        FeatureNodeConstraintItem() {
            return FeatureNodeConstraintItem;
        },

        TrimmedModels() {
            let trimmed = this.models.slice(this.timelineBias);
            return trimmed;
        },

        SelectionState() {
            return SelectionState;
        },

        pageTableSize() {
            if (this.featuresTrimmed === undefined) {
                return 15;
            }
            return this.featuresTrimmed.length < 20 ? -1 : 15;
        },

        missingFeaturesOfSelectedVersion() {
            if (!this.featureModelSolo || !this.featureModelSolo.root) {
                return [];
            }

            return this.featureModelSolo.features
                .filter(f => f.selectionState === SelectionState.ExplicitlySelected || f.selectionState === SelectionState.ImplicitlySelected)
                .filter(f => !this.featureModelSolo.features.includes(f));
        },

        conflictingCTCsOfSelectedVersion() {
            if (!this.featureModelSolo || this.featureModelSolo.root) {
                return [];
            }

            return this.featureModelSolo.constraints.some(c => c.evaluate() === false);
        }
    }
};
</script>

<style scoped>

</style>
