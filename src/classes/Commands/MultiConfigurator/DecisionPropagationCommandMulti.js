import {SelectionState} from "@/classes/SelectionState";
import { ConfigurationCommandMulti } from '@/classes/Commands/MultiConfigurator/ConfigurationCommandMulti';

export class DecisionPropagationCommandMulti extends ConfigurationCommandMulti {
    constructor(featureModelMulti, data, feature, newSelectionState, validCheckbox) {
        super(featureModelMulti);
        this.executed = false;
        this.newSatCount = 0;
        this.description = "";

        if (newSelectionState === SelectionState.Unselected) {
            if (feature.selectionState === SelectionState.ExplicitlySelected) {
                this.description = "Undone selection";
            } else if (feature.selectionState === SelectionState.ExplicitlyDeselected) {
                this.description = "Undone deselection";
            }
        } else {
            if (newSelectionState === SelectionState.ExplicitlySelected) {
                this.description = "Selected";
            } else if (newSelectionState === SelectionState.ExplicitlyDeselected) {
                this.description = "Deselected";
            }
        }
        feature.selectionState = newSelectionState;
        this.description += " " + (feature.name);

        if (data && validCheckbox) {
            this.valid = data.valid;
            this.newExplicitlySelectedFeatures = data.eSF;
            this.newImplicitlySelectedFeatures = data.iSF;
            this.newExplicitlyDeselectedFeatures = data.eDF;
            this.newImplicitlyDeselectedFeatures = data.iDF;
            this.newUnselectedFeatures = data.uF;
            this.newExplicitlySelectedVersions = data.eSV;
            this.newImplicitlySelectedVersions = data.iSV;
            this.newExplicitlyDeselectedVersions = data.eDV;
            this.newImplicitlyDeselectedVersions = data.iDV;
            this.newUnselectedVersions = data.uV;
        } else if (data) {
            this.valid = data.valid;
            this.newExplicitlySelectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ExplicitlySelected);
            this.newImplicitlySelectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ImplicitlySelected);
            this.newExplicitlyDeselectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected);
            this.newImplicitlyDeselectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ImplicitlyDeselected);
            this.newUnselectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.Unselected);
            this.newExplicitlySelectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ExplicitlySelected);
            this.newImplicitlySelectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ImplicitlySelected);
            this.newExplicitlyDeselectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected);
            this.newImplicitlyDeselectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ImplicitlyDeselected);
            this.newUnselectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.Unselected);
        } else {
            this.valid = featureModelMulti.checkValidity();
            this.newExplicitlySelectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ExplicitlySelected);
            this.newImplicitlySelectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ImplicitlySelected);
            this.newExplicitlyDeselectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected);
            this.newImplicitlyDeselectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.ImplicitlyDeselected);
            this.newUnselectedFeatures = featureModelMulti.features.filter(f => f.selectionState === SelectionState.Unselected);
            this.newExplicitlySelectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ExplicitlySelected);
            this.newImplicitlySelectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ImplicitlySelected);
            this.newExplicitlyDeselectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected);
            this.newImplicitlyDeselectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.ImplicitlyDeselected);
            this.newUnselectedVersions = featureModelMulti.versions.filter(f => f.selectionState === SelectionState.Unselected);
        }

    }

    execute() {
        super.execute();
    }
}
