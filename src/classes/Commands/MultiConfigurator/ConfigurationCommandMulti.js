import {Command} from "@/classes/Commands/Command";
import {SelectionState} from "@/classes/SelectionState";
import {updateSvg} from "@/services/FeatureModel/update.service.js";

export class ConfigurationCommandMulti extends Command {
    constructor(featureModelMulti) {
        super();
        this.featureModel = featureModelMulti;
        this.valid = false;

        this.oldExplicitlySelectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ExplicitlySelected);
        this.oldImplicitlySelectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ImplicitlySelected);
        this.oldExplicitlyDeselectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected);
        this.oldImplicitlyDeselectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ImplicitlyDeselected);
        this.oldUnselectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.Unselected);
        this.oldExplicitlySelectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ExplicitlySelected);
        this.oldImplicitlySelectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ImplicitlySelected);
        this.oldExplicitlyDeselectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected);
        this.oldImplicitlyDeselectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ImplicitlyDeselected);
        this.oldUnselectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.Unselected);

        this.newExplicitlySelectedFeatures = [];
        this.newImplicitlySelectedFeatures = [];
        this.newExplicitlyDeselectedFeatures = [];
        this.newImplicitlyDeselectedFeatures = [];
        this.newUnselectedFeatures = [];
        this.newExplicitlySelectedVersions = [];
        this.newImplicitlySelectedVersions = [];
        this.newExplicitlyDeselectedVersions = [];
        this.newImplicitlyDeselectedVersions = [];
        this.newUnselectedVersions = [];

        this.oldSatCount = this.featureModel.satCount;

        this.marked = false;
    }

    execute() {

        this.newExplicitlySelectedFeatures.forEach(f => f.selectionState = SelectionState.ExplicitlySelected);
        this.newImplicitlySelectedFeatures.forEach(f => f.selectionState = SelectionState.ImplicitlySelected);
        this.newExplicitlyDeselectedFeatures.forEach(f => f.selectionState = SelectionState.ExplicitlyDeselected);
        this.newImplicitlyDeselectedFeatures.forEach(f => f.selectionState = SelectionState.ImplicitlyDeselected);
        this.newUnselectedFeatures.forEach(f => f.selectionState = SelectionState.Unselected);
        this.newExplicitlySelectedVersions.forEach(f => f.selectionState = SelectionState.ExplicitlySelected);
        this.newImplicitlySelectedVersions.forEach(f => f.selectionState = SelectionState.ImplicitlySelected);
        this.newExplicitlyDeselectedVersions.forEach(f => f.selectionState = SelectionState.ExplicitlyDeselected);
        this.newImplicitlyDeselectedVersions.forEach(f => f.selectionState = SelectionState.ImplicitlyDeselected);
        this.newUnselectedVersions.forEach(f => f.selectionState = SelectionState.Unselected);

        this.featureModel.satCount = this.newSatCount;
    }

    undo() {
        this.oldExplicitlySelectedFeatures.forEach(f => f.selectionState = SelectionState.ExplicitlySelected);
        this.oldImplicitlySelectedFeatures.forEach(f => f.selectionState = SelectionState.ImplicitlySelected);
        this.oldExplicitlyDeselectedFeatures.forEach(f => f.selectionState = SelectionState.ExplicitlyDeselected);
        this.oldImplicitlyDeselectedFeatures.forEach(f => f.selectionState = SelectionState.ImplicitlyDeselected);
        this.oldUnselectedFeatures.forEach(f => f.selectionState = SelectionState.Unselected);
        this.oldExplicitlySelectedVersions.forEach(f => f.selectionState = SelectionState.ExplicitlySelected);
        this.oldImplicitlySelectedVersions.forEach(f => f.selectionState = SelectionState.ImplicitlySelected);
        this.oldExplicitlyDeselectedVersions.forEach(f => f.selectionState = SelectionState.ExplicitlyDeselected);
        this.oldImplicitlyDeselectedVersions.forEach(f => f.selectionState = SelectionState.ImplicitlyDeselected);
        this.oldUnselectedVersions.forEach(f => f.selectionState = SelectionState.Unselected);

        this.featureModel.satCount = this.oldSatCount;
    }

    unmarkChanges() {
        this.marked = false;
    }

    markChanges() {
        this.marked = true;
    }

    formatScientificNotation(number) {
        const exponential = number.toExponential();
        const parts = exponential.split("e+");


        const coefficient = (Math.round(parseFloat(parts[0]) * 10, 2) / 10).toLocaleString("en-US");
        const exponent = parts[1];
        if (exponent < 8) {
            return new Intl.NumberFormat("en-US", {notation: 'standard'}).format(number);
        }
        return `${coefficient} * 10^${exponent}`;
    }
}
