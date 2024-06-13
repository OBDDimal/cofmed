import {SelectionState} from "@/classes/SelectionState";

export class Version {
    constructor(id, name) {
        this.name = name.slice(0, name.indexOf('-')) + ` V${id}`;
        this.id = id;
        this.selectionState = SelectionState.Unselected;
    }
}
