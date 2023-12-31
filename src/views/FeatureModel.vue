<template>
    <f-m-navbar
        :is-service-available='isServiceAvailable'
        :is-file-loaded='data.rootNode !== undefined'
        :collaborationStatus='collaborationStatus'
        :editRights='editRights'
        :is-redo-available='
                featureModelCommandManager && featureModelCommandManager.isRedoAvailable()
            '
        :is-save-available='
                (featureModelCommandManager && featureModelCommandManager.isUndoAvailable()) ||
                constraintCommandManager.isUndoAvailable()
            '
        :is-undo-available='
                featureModelCommandManager && featureModelCommandManager.isUndoAvailable()
            '
        @download='exportToXML'
        @fitToView='fitToView'
        @quickEdit='(value) => updateQuickEdit(value)'
        @redo='redo'
        @reset='reset'
        @openConf='openConfigurator'
        @openFile='openFilePicker'
        @resetView='(levels, maxChildren) => resetView(levels, maxChildren)'
        @save='save'
        @semanticEditing='(value) => updateSemanticEdit(value)'
        @nonSemanticEditing='(value) => updateNonSemanticEdit(value)'
        @shortName='(value) => changeShortName(value)'
        @spaceBetweenParentChild='(value) =>changeSpaceBetweenParentChild(value)'
        @spaceBetweenSiblings='(value) =>changeSpaceBetweenSiblings(value)'
        @toggleDirection='toggleDirection'
        @open-constraints="openConstraints = true"
        @undo='undo'
        @show-collaboration-dialog="showStartCollaborationSessionDialog = true"
        @show-tutorial='showTutorial = true'
        @new-empty-model='newEmptyModel'
        @download-svg='downloadSVG'


    ></f-m-navbar>
    <div v-if='xml === undefined'>
        <v-container :fluid='true'>
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
                               @click.stop='loadInitialModel'>
                            Or click here to load a default model.
                        </v-btn>
                    </v-row>
                </v-card-text>
                <input
                    ref='filePicker'
                    accept='.xml'
                    class='d-none'
                    type='file'
                    @change='onFileInputChanged'
                >
            </v-card>
        </v-container>
    </div>
    <div v-else>
        <feature-model-tree
            v-if='data.rootNode'
            :key='reloadKey'
            ref='featureModelTree'
            :collaborationStatus='collaborationStatus'
            :command-manager='featureModelCommandManager'
            :constraints='data.constraints'
            :editRights='editRights'
            :error='error'
            :error-message='errorMessage'
            :is-service-available='isServiceAvailable'
            :loadingData='loadingData'
            :rootNode='data.rootNode'
            :showLegend='showLegend'
            @exportToXML='exportToXML'
            @reset='reset'
            @save='save'
            @slice='node => slice(node)'
            @update-constraints='updateConstraints'
            @show-collaboration-dialog='
                showStartCollaborationSessionDialog = true
            '
            @show-claim-dialog='showClaimDialog'
            @new-empty-model='newEmptyModel'
            @show-tutorial='showTutorial = true'
            @error-closed='errorClosed'
            @error-new='message => errorNew(message)'
            @hide-legend='showLegend=false'
        >
        </feature-model-tree>
        <v-row
            justify="end"
            class='mr-2 '
            >
            <v-btn
                id='feature-model-legend'
                elevation='2'
                class='mr-2'
                icon
                style='background-color: rgb(var(--v-theme-primary))'
                theme='dark'
                @click='showLegend=!showLegend'
            >
                <v-icon>mdi-map-legend</v-icon>
            </v-btn>
            <v-btn
                id='feature-model-information'
                :x-large='$vuetify.display.mdAndUp'
                elevation='2'
                class='mr-2'
                icon
                style='background-color: rgb(var(--v-theme-primary))'
                theme='dark'
                @click='openInformation = !openInformation'
            >
                <v-icon>mdi-information</v-icon>
            </v-btn>
            <v-btn
                id='feature-model-constraints'
                :x-large='$vuetify.display.mdAndUp'
                data-cy='feature-model-constraints-button'
                elevation='2'
                class='mr-2'
                icon
                style='background-color:  rgb(var(--v-theme-primary))'
                theme='dark'
                @click='openConstraints = true'
            >
                <v-icon>mdi-format-list-checks</v-icon>
            </v-btn>
        </v-row>
       

        <feature-model-fact-label-bar
        :isOpen="openInformation"
        :metadata="facts.metadata"
        :metrics="facts.metrics"
        :analysis="facts.analysis"
        @close="openInformation = false">
        </feature-model-fact-label-bar>
        <constraints
            v-if='data.constraints'
            ref='constraints'
            :command-manager='constraintCommandManager'
            :constraints='data.constraints'
            :editRights='editRights'
            :is-open='openConstraints'
            :rootNode='data.rootNode'
            @close='openConstraints = false'
            @update-feature-model='updateFeatureModel'
        ></constraints>

        <collaboration-toolbar
            v-if='collaborationStatus'
            :key='collaborationReloadKey'
            :collaboration-manager='collaborationManager'
            :show-claim-dialog='showClaimDialog'
        ></collaboration-toolbar>

        <v-dialog
            v-model='showStartCollaborationSessionDialog'
            persistent
            width='auto'
        >
            <v-card>
                <v-card-title
                >Do you want to start a new collaboration
                    session?
                </v-card-title
                >
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color='red'
                        variant='text'
                        @click='showStartCollaborationSessionDialog = false'
                    >
                        Cancel
                    </v-btn>

                    <v-btn color='primary' variant='text' @click='createCollaboration'>
                        Start
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <collaboration-name-dialog
            v-if='collaborationKey'
            @change-name='(name) => collaborationManager.sendName(name)'
        ></collaboration-name-dialog>

        <collaboration-continue-editing-dialog
            :show='showContinueEditingDialog'
            @close='closeFeatureModel'
            @continue-editing='continueEditing'
        >
        </collaboration-continue-editing-dialog>
    </div>
</template>

<script>
import FeatureModelTree from '../components/FeatureModel/FeatureModelTree.vue';
import Constraints from '../components/Constraints.vue';
import * as update from '@/services/FeatureModel/update.service';
import * as FactLabelFactory from "@/classes/Factlabel/FactLabelFactory"
import api from '@/services/api.service';
import beautify from 'xml-beautifier';
import CollaborationManager from '@/classes/CollaborationManager';
import { CommandManager } from '@/classes/Commands/CommandManager';
import * as xmlTranspiler from '@/services/xmlTranspiler.service';
import { jsonToXML } from '@/services/xmlTranspiler.service';
import CollaborationToolbar from '@/components/CollaborationToolbar';
import CollaborationNameDialog from '@/components/CollaborationNameDialog';
import CollaborationContinueEditingDialog from '@/components/CollaborationContinueEditingDialog';
import { EXAMPLE_FEATURE_MODEL_XML } from '@/classes/constants';
import TutorialMode from '@/components/TutorialMode';
import { NewEmptyModelCommand } from '@/classes/Commands/FeatureModel/NewEmptyModelCommand';
import { SliceCommand } from '@/classes/Commands/FeatureModel/SliceCommand';
import FeatureModelFactLabelBar from '@/components/FeatureModel/FeatureModelFactLabelBar.vue';
import FeatureModelInformation from '@/components/FeatureModel/FeatureModelInformation';
import { useAppStore } from '@/store/app';
import axios from 'axios';
import FMNavbar from '@/components/FMNavbar.vue';
import * as view from '@/services/FeatureModel/view.service';

const appStore = useAppStore();

export default {
    name: 'FeatureModel',

    components: {
        FMNavbar,
        TutorialMode,
        FeatureModelInformation,
        CollaborationContinueEditingDialog,
        CollaborationToolbar,
        FeatureModelTree,
        Constraints,
        CollaborationNameDialog,
        FeatureModelFactLabelBar,
    },

    props: {
        id: undefined,
        collaborationKey: undefined
    },

    data() {
        return {
            data: {
                featureMap: [],
                constraints: [],
                properties: [],
                calculations: undefined,
                comments: [],
                featureOrder: undefined,
                rootNode: undefined
            },
            loadingData: false,
            error: false,
            errorMessage: '',
            isServiceAvailable: false,
            xml: undefined,
            reloadKey: 0,
            dragover: false,
            collaborationReloadKey: 10000,
            featureModelCommandManager: new CommandManager(),
            constraintCommandManager: new CommandManager(),
            collaborationManager: null,
            editRights: true,
            showStartCollaborationSessionDialog: false,
            showClaimDialog: false,
            showContinueEditingDialog: false,
            collaborationStatus: false,
            openConstraints: false,
            openInformation: false,
            showTutorial: false,
            showLegend: true,
            facts: FactLabelFactory.getEmptyFactLabel(),
        };
    },

    created() {
        this.collaborationManager = new CollaborationManager(
            this.featureModelCommandManager,
            this.constraintCommandManager,
            this
        );
        this.featureModelCommandManager.commandEvent = this.commandEvent;
        this.constraintCommandManager.commandEvent = this.commandEvent;
        if (this.id === 'local') {
            const xml = beautify(localStorage.featureModelData);
            xmlTranspiler.xmlToJson(xml, this.data);
            this.xml = xml;
        } else if (this.id === 'new') {
            this.loadInitialModel();
        } else if (this.id) {
            this.initData();
        } else if (this.collaborationKey) {
            const uuid = this.collaborationKey.substring(
                0,
                this.collaborationKey.length - 1
            );
            const checksum = this.collaborationKey.slice(-1);
            const condition =
                checksum ===
                (
                    Array.from(uuid).reduce(
                        (last, curr) => parseInt(last, 16) + parseInt(curr, 16)
                    ) % 16
                ).toString(16);
            if (condition) {
                this.collaborationManager.joinCollaboration(
                    this.collaborationKey
                );
            } else {
                alert('Wrong key!');
            }
        }
        this.checkService();

        // Start tutorial mode if it has not been completed before
        this.showTutorial = !localStorage.featureModelTutorialCompleted;
        this.updateFacts();
    },

    beforeRouteLeave(to, from, next) {
        // If session gets closed by host, don't ask for confirmation
        if (this.collaborationManager.noConfirm) {
            const answer = window.confirm(
                'Do you really want to leave the page? Collaboration sessions will be closed and data will be lost!'
            );

            if (answer) {
                // If user wants to close page
                this.collaborationManager.closeCollaboration();
                next();
            } else {
                // If user doesn't want to close page
                next(false);
            }
        } else {
            // Don't prevent default site changes without collaboration
            next();
        }
    },

    methods: {
        save() {
            localStorage.featureModelData = jsonToXML(this.data);
            window.onbeforeunload = null;

            appStore.updateSnackbar(
                'Successfully saved in local storage',
                'success',
                5000,
                true
            );
        },
        updateFacts(){
            if(this.xml === undefined){
                return;
            }
            let nFeatures=this.data.rootNode.descendants().length;
            this.facts.metrics.find((fact)=>{
                    return fact.name==="Features"
                }).value=  nFeatures;
        },

        reset() {
            // TODO: Transpile the xml file new and restart viewer.
            this.initData();
            this.reloadKey++;
        },

        openFilePicker() {
            this.$refs.filePicker.click();
        },

        openConfigurator() {
            // TODO: Try to redirect to the right window
            localStorage.featureModelData = jsonToXML(this.data);
        },

        async openFile(files) {
            const data = await files[0].text();
            const xml = beautify(data);
            xmlTranspiler.xmlToJson(xml, this.data);
            this.xml = xml;
        },

        onFileInputChanged(e) {
            if (e.target.files.length > 1) {
                appStore.updateSnackbar(
                    'Cannot load more than one feature model.',
                    'error',
                    5000,
                    true
                );
            } else {
                this.openFile(e.target.files);
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

        async slice(node) {
            this.loadingData = true;
            await this.checkService();
            if (this.isServiceAvailable) {
                try {
                    const content = new TextEncoder().encode(jsonToXML(this.data));
                    let response = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}slice`, {
                        name: 'hello.xml',
                        selection: [node.name],
                        content: Array.from(content)
                    });
                    let contentAsString = new TextDecoder().decode(Uint8Array.from(response.data.content));
                    const xml = beautify(contentAsString);
                    const command = new SliceCommand(
                        this,
                        xml
                    );
                    this.featureModelCommandManager.execute(command);
                    this.updateFeatureModel();
                } catch (e) {
                    this.loadingData = false;
                    appStore.updateSnackbar(
                        'Could not slice the Feature, because an unknown error occurred.',
                        'error',
                        3000,
                        true
                    );
                }
            } else {
                this.loadingData = false;
                appStore.updateSnackbar(
                    'Could not slice the Feature, because Service is down.',
                    'error',
                    3000,
                    true
                );
            }
            this.loadingData = false;
        },

        async checkService() {
            try {
                let response = await axios.get(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}`);
                this.isServiceAvailable = response.status === 200;
            } catch (error) {
                this.isServiceAvailable = false;
            }
        },

        newEmptyModel() {
            const command = new NewEmptyModelCommand(
                this,
                this.$refs.featureModelTree.d3Data
            );
            this.featureModelCommandManager.execute(command);
            this.updateFeatureModel();
        },

        initData() {
            api.get(`${import.meta.env.VITE_APP_DOMAIN}files/${this.id}/`).then(
                (data) => {
                    api.get(data.data.local_file).then((rawData) => {
                        const xml = beautify(rawData.data);
                        xmlTranspiler.xmlToJson(xml, this.data);
                        this.xml = xml;
                    });
                }
            );
        },

        loadInitialModel() {
            const xml = beautify(EXAMPLE_FEATURE_MODEL_XML);
            xmlTranspiler.xmlToJson(xml, this.data);
            this.xml = xml;
            this.updateFacts();
        },

        updateFeatureModel() {
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },

        updateConstraints() {
            this.$refs.constraints.update();
        },

        exportToXML() {
            xmlTranspiler.downloadXML(this.data);
        },

        commandEvent() {
            this.updateFacts();
            // Can't override text for Chrome & Edge
            window.onbeforeunload = function() {
                return 'Do you really want to leave the page? Collaboration sessions will be closed and data will be lost!';
            };
        },

        createCollaboration() {
            this.showStartCollaborationSessionDialog = false;
            this.collaborationManager.createCollaboration();
            navigator.clipboard.writeText(
                `${import.meta.env.VITE_APP_DOMAIN_FRONTEND}collaboration/${
                    this.collaborationManager.collaborationKey
                }`
            );
        },

        continueEditing() {
            this.showContinueEditingDialog = false;
            this.editRights = true;
        },

        closeFeatureModel() {
            this.showContinueEditingDialog = false;
            this.collaborationManager.noConfirm = false;
            this.$router.push({ path: '/' });
        },

        errorClosed() {
            this.error = false;
            this.errorMessage = '';
        },

        errorNew(message) {
            this.error = true;
            this.errorMessage = message;
        },

        fitToView() {
            view.zoomFit(this.$refs.featureModelTree.d3Data);
        },

        undo() {
            this.featureModelCommandManager.undo();
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },

        redo() {
            this.featureModelCommandManager.redo();
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },

        downloadSVG() {
            // TODO: Implement download
        },

        toggleDirection() {
            this.$refs.featureModelTree.d3Data.direction = this.$refs.featureModelTree.d3Data.direction === 'v' ? 'h' : 'v';
            update.updateSvg(this.$refs.featureModelTree.d3Data);
            view.zoomFit(this.$refs.featureModelTree.d3Data);
        },

        updateQuickEdit(newValue) {
            this.$refs.featureModelTree.d3Data.quickEdit = newValue;
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },

        resetView(levels, maxChildren){
            this.$refs.featureModelTree.d3Data.direction ='v';
            view.reset(this.$refs.featureModelTree.d3Data, levels, maxChildren);
        },

        updateSemanticEdit(value){
            this.$refs.featureModelTree.d3Data.semanticEditing = value;
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },

        updateNonSemanticEdit(value){
            this.$refs.featureModelTree.d3Data.nonSemanticEditing = value;
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },

        changeShortName(value){
            this.$refs.featureModelTree.d3Data.isShortenedName = value;
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },

        changeSpaceBetweenParentChild(spacing){
            this.$refs.featureModelTree.d3Data.spaceBetweenParentChild = spacing;
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },

        changeSpaceBetweenSiblings(spacing){
            this.$refs.featureModelTree.d3Data.spaceBetweenSiblings = spacing;
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },
    }
};
</script>
