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
        @change-service='(boolean) => changeService(boolean)'
        @timeline='(side) => changeTimeline(side)'
    ></conf-navbar>
    <v-container :fluid='true'>
        <template v-if='fmIsLoaded'>
            <v-timeline v-if='models.length > 15' density='comfortable' direction='horizontal' side='start'>
                <v-timeline-item
                    v-for='(item, i) in TrimmedModels'
                    :key='i'
                    :dot-color='item.hovered ? "selected" : "primary"'
                    :size='i % 5 !== 0  ? "" : "small"'
                    height='5vh'
                >
                    <template v-slot:icon>
                        <v-btn v-if='i % 5 === 0' :color='item.hovered ? "selected" : "primary"' :icon='true'
                               height='2.2vh' @click='changeFeatureModel(item)'></v-btn>
                        <v-btn v-else :color='item.hovered ? "selected" : "primary"' :icon='true' height='2.2vh'
                               width='0.01vh' @click='changeFeatureModel(item)'></v-btn>
                    </template>
                    <div v-if='i % 5 === 0' class='text-center'>
                        {{ item.title }}
                    </div>
                </v-timeline-item>
            </v-timeline>
            <v-timeline v-else density='comfortable' direction='horizontal' side='start'>
                <v-timeline-item
                    v-for='(item, i) in models'
                    :key='i'
                    :dot-color='item.hovered ? "selected" : "primary"'
                    height='5vh'
                    size='small'
                >
                    <template v-slot:icon>
                        <v-btn :color='item.hovered ? "selected" : "primary"' :icon='true' height='2.2vh'
                               @click='changeFeatureModel(item)'></v-btn>
                    </template>
                    <div class='text-center'>
                        {{ item.title }}
                    </div>
                </v-timeline-item>
            </v-timeline>
            <v-row>
                <v-col cols='4'>
                    <v-card height='77.5vh'>
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
                                <v-checkbox
                                    v-model='validCheckbox'
                                    density='compact'
                                    hide-details
                                    label='Valid'
                                ></v-checkbox>
                            </v-layout>
                        </v-card-title>

                        <!-- Tabs to select (Feature Model Viewer, List Tree, Cross-Tree Constraints -->
                        <v-tabs v-model='tabsFirstColumn'>
                            <v-tab key='dataTable'>Data Table</v-tab>
                            <v-tab key='treeView'>Tree View</v-tab>
                        </v-tabs>
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
                                    <v-list-item title='Show Open Features'>
                                        <template v-slot:prepend>
                                            <v-checkbox
                                                v-model='showOpenFeatures'
                                                density='compact'
                                                hide-details
                                                @input='updateFeatures'
                                            ></v-checkbox>
                                        </template>
                                    </v-list-item>
                                    <v-list-item title='Show Abstract Features'>
                                        <template v-slot:prepend>
                                            <v-checkbox
                                                v-model='showAbstractFeatures'
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
                        <v-window v-model='tabsFirstColumn'>

                            <!-- Feature Model Viewer -->
                            <v-window-item key='dataTable'>


                                <!-- Table with all features that are currently fitlered and searched -->
                                <v-data-table
                                    :headers='headersFeatures'
                                    :height="pageTableSize === -1 ? '60vh' : '54.5vh'"
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

                    </v-card>
                </v-col>

                <v-col cols='8'>

                    <!-- Details of the selected version -->
                    <v-card height='77.5vh'>
                        <v-card-title>Details for {{ featureModelName }}:</v-card-title>

                        <!-- Tabs to select (Feature Model Viewer, List Tree, Cross-Tree Constraints -->
                        <v-tabs v-model='tabsSecondColumn'>
                            <v-tab key='featureModelViewer'>Feature Model Viewer</v-tab>
                            <v-tab key='ctc'>Cross Tree Constraints</v-tab>
                            <v-tab key='conf'>Configuration History</v-tab>
                        </v-tabs>

                        <v-card-text v-if='featureModelMulti?.root'>
                            <v-window v-model='tabsSecondColumn'>

                                <!-- Feature Model Viewer -->
                                <v-window-item key='featureModelViewer'>

                                    <feature-model-viewer-solo ref='featureModelViewerSolo'
                                                               :dark='dark'
                                                               :feature-model='featureModelMulti'
                                                               :fm-is-loaded='fmIsLoaded'
                                                               @select='(name) => searchFeatures = name'
                                    ></feature-model-viewer-solo>
                                </v-window-item>

                                <!-- Cross-Tree Constraint Viewer -->
                                <v-window-item key='ctc'>

                                    <!-- Filter only the invalid ctcs and reset them to default -->
                                    <!--                <v-btn class='mx-2' outlined
                                                           rounded @click='filteredConstraints = allConstraints.filter(c => c.evaluation === false)'>
                                                      Only invalid
                                                    </v-btn>
                                                    <v-btn outlined rounded @click='filteredConstraints = allConstraints'>Reset</v-btn>-->

                                    <!-- Table with all ctcs -->
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

                                        <!-- Customization of the column FORMULA -->
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

                                        <!-- Customization of the column EVALUATION -->
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
                            </v-window>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
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
                            Or click here to load it from your local storage.
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
import { decisionPropagationFL, pingFL } from '@/classes/BackendAccess/FlaskAccess';
import { changeFileFormat, decisionPropagationFIDE, pingFIDE } from '@/classes/BackendAccess/FeatureIDEAccess';
import beautify from 'xml-beautifier';
import ConfNavbar from '@/components/Configurator/ConfNavbar.vue';
import { FeatureModelMulti } from '@/classes/Configurator/FeatureModelMulti';

const appStore = useAppStore();
export default {
    name: 'FeatureModelSoloConfigurator',
    components: { ConfNavbar, FeatureModelViewerSolo, DoubleCheckbox },

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
        models: undefined,
        commandManager: new ConfiguratorManager(),
        initialResetCommand: undefined,
        featureModelMulti: FeatureModelMulti,
        fmIsLoaded: false,
        dragover: false,
        featureModelName: '',
        features: undefined,
        featuresTrimmed: undefined,
        showOpenFeatures: false,
        showAbstractFeatures: true,
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
            let command = row.item.selectable;
            this.commandManager.redoCommand(command);
        },

        resetFeaturesTable() {
            this.searchFeatures = '';
            this.features = this.featureModelSolo.features;
            this.versionForFilteringFeatures = undefined;
        },

        async decisionPropagation(item, selectionState) {
            const data = this.getSelection();
            if (selectionState === SelectionState.ExplicitlySelected) {
                data.selection.push(item.name);
            } else if (selectionState === SelectionState.ExplicitlyDeselected) {
                data.deselection.push(item.name);
            } else if (selectionState === SelectionState.Unselected) {
                if (item.selectionState === SelectionState.ExplicitlySelected) {
                    data.selection.pop(item.name);
                } else if (item.selectionState === SelectionState.ExplicitlyDeselected) {
                    data.deselection.pop(item.name);
                }
            }
            const selectionData = await this.getSelectionDataFromAPI(data);
            let command = new DecisionPropagationCommand(this.featureModelSolo, selectionData, item, selectionState, this.validCheckbox);
            this.commandManager.execute(command);
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
            const data = localStorage.featureModelData;
            try {
                this.xml = data;
                const featureModelSolo = FeatureModelSolo.loadXmlDataFromFile(this.xml);
                this.commandManager = new ConfiguratorManager();
                this.features = featureModelSolo.features;
                this.updateFeatures();
                this.featureModelName = 'LocalStorageFile';
                featureModelSolo.name = this.featureModelName;
                this.allConstraints = featureModelSolo.constraints.map((e) => ({
                    constraint: e,
                    formula: e.toList(),
                    evaluation: e.evaluate()
                }));
                this.filteredConstraints = this.allConstraints;
                this.featureModelSolo = featureModelSolo;
                const selectionData = await this.getSelectionDataFromAPI();
                this.initialResetCommand = new ResetCommand(this.featureModelSolo, selectionData);
                this.initialResetCommand.execute();
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
        },

        getVersions(item) {
            this.removeVersionsHover();
            this.models.filter(model => model.features.map(feature => feature.name).includes(item.name)).forEach(model => model.hovered = true);
        },

        removeVersionsHover() {
            this.models.forEach(model => model.hovered = false);
        },

        async openFile(files) {
            this.fmIsLoaded = true;
            this.models = [];
            try {
                for (let i = 0; i < files.length; i++) {
                    let text = await files[i].text();
                    let featureModelMulti = FeatureModelMulti.loadXmlDataFromFile(text, files[i].name.slice(0, files[i].name.length - 4));
                    this.models.push(featureModelMulti);
                }
                this.xml = this.models[0].xml;
                this.commandManager = new ConfiguratorManager();
                this.features = this.models.map(model => model.features);
                this.updateFeatures();
                this.allConstraints = this.models[0].constraints.map((e) => ({
                    constraint: e,
                    formula: e.toList(),
                    evaluation: e.evaluate()
                }));
                this.filteredConstraints = this.allConstraints;
                this.featureModelMulti = this.models[0];
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
            let returnFeatures = new Set(this.features.flat());

            /*if (!this.showAbstractFeatures) {
                returnFeatures = returnFeatures.filter((f) => !f.isAbstract);
            }
            if (this.showOpenFeatures) {
                returnFeatures = returnFeatures.filter((f) => f.open != null);
            }*/

            this.featuresTrimmed = Array.from(returnFeatures);
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

            this.xml = item.xml;
            this.allConstraints = item.constraints.map((e) => ({
                constraint: e,
                formula: e.toList(),
                evaluation: e.evaluate()
            }));
            this.filteredConstraints = this.allConstraints;
            this.featureModelMulti = item;
        },

        getSelection() {

            const selection = this.featureModelSolo.features.filter(f => f.selectionState === SelectionState.ExplicitlySelected).map(f => f.name);
            const deselection = this.featureModelSolo.features.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected).map(f => f.name);

            return {
                selection: selection,
                deselection: deselection
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
                result = await pingFIDE();
                if (result) {
                    this.serviceIsFeatureIDE = true;
                    this.serviceIsWorking = true;
                }
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
                if (this.serviceIsFeatureIDE) {
                    const apiData = await decisionPropagationFIDE(this.xml);
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
                    selectionData = {
                        valid: apiData.valid,
                        eSF: this.featureModelSolo.features.filter(f => apiData.selection.includes(f.name)),
                        iSF: this.featureModelSolo.features.filter(f => apiData.impliedSelection.includes(f.name)),
                        eDF: this.featureModelSolo.features.filter(f => apiData.deselection.includes(f.name)),
                        iDF: this.featureModelSolo.features.filter(f => apiData.impliedDeselection.includes(f.name)),
                        uF: this.featureModelSolo.features.filter(f => !(apiData.selection.includes(f.name) || apiData.impliedSelection.includes(f.name) || apiData.deselection.includes(f.name) || apiData.impliedDeselection.includes(f.name))),
                        oPF: this.featureModelSolo.features.filter(f => apiData.openParents.includes(f.name)),
                        oCF: this.featureModelSolo.features.filter(f => apiData.openChildren.includes(f.name)),
                        nOF: this.featureModelSolo.features.filter(f => !apiData.openChildren.includes(f.name) || !apiData.openParents.includes(f.name))
                    };
                } else {
                    const apiData = await decisionPropagationFL(this.xml);
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
                    selectionData = {
                        valid: apiData.valid,
                        eSF: this.featureModelSolo.features.filter(f => apiData.selection.includes(f.name)),
                        iSF: this.featureModelSolo.features.filter(f => apiData.impliedSelection.includes(f.name)),
                        eDF: this.featureModelSolo.features.filter(f => apiData.deselection.includes(f.name)),
                        iDF: this.featureModelSolo.features.filter(f => apiData.impliedDeselection.includes(f.name)),
                        uF: this.featureModelSolo.features.filter(f => !(apiData.selection.includes(f.name) || apiData.impliedSelection.includes(f.name) || apiData.deselection.includes(f.name) || apiData.impliedDeselection.includes(f.name))),
                        oPF: this.featureModelSolo.features.filter(f => apiData.openParents.includes(f.name)),
                        oCF: this.featureModelSolo.features.filter(f => apiData.openChildren.includes(f.name)),
                        nOF: this.featureModelSolo.features.filter(f => !apiData.openChildren.includes(f.name) || !apiData.openParents.includes(f.name))
                    };
                }
            } else {
                if (this.serviceIsFeatureIDE) {
                    const apiData = await decisionPropagationFIDE(this.xml, data.selection, data.deselection);
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
                    selectionData = {
                        valid: apiData.valid,
                        eSF: this.featureModelSolo.features.filter(f => apiData.selection.includes(f.name)),
                        iSF: this.featureModelSolo.features.filter(f => apiData.impliedSelection.includes(f.name)),
                        eDF: this.featureModelSolo.features.filter(f => apiData.deselection.includes(f.name)),
                        iDF: this.featureModelSolo.features.filter(f => apiData.impliedDeselection.includes(f.name)),
                        uF: this.featureModelSolo.features.filter(f => !(apiData.selection.includes(f.name) || apiData.impliedSelection.includes(f.name) || apiData.deselection.includes(f.name) || apiData.impliedDeselection.includes(f.name))),
                        oPF: this.featureModelSolo.features.filter(f => apiData.openParents.includes(f.name)),
                        oCF: this.featureModelSolo.features.filter(f => apiData.openChildren.includes(f.name)),
                        nOF: this.featureModelSolo.features.filter(f => !apiData.openChildren.includes(f.name) || !apiData.openParents.includes(f.name))
                    };
                } else {
                    const apiData = await decisionPropagationFL(this.xml, data.selection, data.deselection);
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
                    selectionData = {
                        valid: apiData.valid,
                        eSF: this.featureModelSolo.features.filter(f => apiData.selection.includes(f.name)),
                        iSF: this.featureModelSolo.features.filter(f => apiData.impliedSelection.includes(f.name)),
                        eDF: this.featureModelSolo.features.filter(f => apiData.deselection.includes(f.name)),
                        iDF: this.featureModelSolo.features.filter(f => apiData.impliedDeselection.includes(f.name)),
                        uF: this.featureModelSolo.features.filter(f => !(apiData.selection.includes(f.name) || apiData.impliedSelection.includes(f.name) || apiData.deselection.includes(f.name) || apiData.impliedDeselection.includes(f.name))),
                        oPF: this.featureModelSolo.features.filter(f => apiData.openParents.includes(f.name)),
                        oCF: this.featureModelSolo.features.filter(f => apiData.openChildren.includes(f.name)),
                        nOF: this.featureModelSolo.features.filter(f => !apiData.openChildren.includes(f.name) || !apiData.openParents.includes(f.name))
                    };
                }
            }
            return selectionData;
        },

        async setStartService() {
            let result = await pingFL();
            console.log(result)
            if (result) {
                this.serviceIsFeatureIDE = false;
                this.serviceIsWorking = true;
                return;
            }

            result = await pingFIDE();
            if (result) {
                this.serviceIsFeatureIDE = true;
                this.serviceIsWorking = true;
            }
            return result;
        },

        changeTimeline(side) {
            if (side){
                this.timelineBias += 20;
            } else {
                this.timelineBias -= 20;
            }
        },
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
