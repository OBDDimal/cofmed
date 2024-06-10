import {ConfigurationCommand} from '@/classes/Commands/Configurator/ConfigurationCommand';
import {SelectionState} from "@/classes/SelectionState";
import { ConfigurationCommandMulti } from '@/classes/Commands/MultiConfigurator/ConfigurationCommandMulti';

export class ResetCommandMulti extends ConfigurationCommandMulti {
    constructor(featureModelMulti, data, satCount) {
        super(featureModelMulti);
        this.newSatCount = satCount;
        this.description = "Reset";

        this.valid = true;

        if (data) {
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
        } else {
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

    copy() {
        const command = new ResetCommandMulti(this.featureModel, this.xml);
        command.newSatCount = this.newSatCount;

        command.newExplicitlySelectedFeatures = this.newExplicitlySelectedFeatures;
        command.newImplicitlySelectedFeatures = this.newImplicitlySelectedFeatures;
        command.newExplicitlyDeselectedFeatures = this.newExplicitlyDeselectedFeatures;
        command.newImplicitlyDeselectedFeatures = this.newImplicitlyDeselectedFeatures;
        command.newUnselectedFeatures = this.newUnselectedFeatures;
        command.newOpenParentFeatures = this.newOpenParentFeatures;
        command.newOpenChildrenFeatures = this.newOpenChildrenFeatures;
        command.newNotOpenFeatures = this.newNotOpenFeatures;
        return command;
    }
}
