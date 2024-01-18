import * as CONSTANTS from '../constants';
import * as d3 from "d3";
import {PseudoNode} from "@/classes/PseudoNode";
import {variabilityDarkTheme, variabilityLightTheme} from "@/plugins/vuetify";
import {SelectionState} from "@/classes/Configurator/SelectionState";

export class FeatureNode {
    constructor(parent, name, id, groupType, mandatory, abstract) {
        this.parent = parent;
        this.id = id;
        this.children = [];

        // FM syntax properties
        this.groupType = groupType;
        this.isRoot = parent === null;
        this.isMandatory = mandatory;
        this.isAbstract = abstract;
        this.name = name;

        // Configuration States
        this.selectionState = SelectionState.Unselected;
        this.open = null;

        // Cross tree constraint references
        this.constraints = [];

        // D3 connection for drawing purposes
        this.displayName = this.name.slice(0, CONSTANTS.DISPLAY_NAME_LENGTH) + '...';
        this.isCollapsed = false;
        this.isHidden = false;
        this.d3Node = null;
        this.markedAsEdited = false;
    }

    color(dark = false) {
        if (this.isAbstract) {
            return dark ? variabilityDarkTheme.colors.secondary : variabilityLightTheme.colors.secondary;
        } else {
            return dark ? variabilityDarkTheme.colors.primary : variabilityLightTheme.colors.primary;
        }
    }

    selectionColor(dark = false) {
        if (this.open) {
            return dark ? variabilityDarkTheme.colors["should-select"] : variabilityLightTheme.colors["should-select"];
        } else if (this.open !== null) {
            return dark ? variabilityDarkTheme.colors["should-select-parent"] : variabilityLightTheme.colors["should-select-parent"];
        }else if (this.selectionState === SelectionState.ExplicitlySelected) {
            return dark ? variabilityDarkTheme.colors.selected : variabilityLightTheme.colors.selected;
        } else if (this.selectionState === SelectionState.ImplicitlyDeselected) {
            return dark ? variabilityDarkTheme.colors["imp-deselected"] : variabilityLightTheme.colors["imp-deselected"];
        } else if (this.selectionState === SelectionState.ExplicitlyDeselected) {
            return dark ? variabilityDarkTheme.colors.deselected : variabilityLightTheme.colors.deselected;
        } else if (this.selectionState === SelectionState.ImplicitlySelected) {
            return dark ? variabilityDarkTheme.colors["imp-selected"] : variabilityLightTheme.colors["imp-selected"];
        }
        return undefined;
    }


    level() {
        if (this.isRoot) {
            return 0;
        } else {
            return this.parent.level() + 1;
        }
    }

    childrenCount() {
        if (this.isLeaf()) {
            return 0;
        } else {
            return this.children.length;
        }
    }

    totalSubnodesCount() {
        if (this.isLeaf()) {
            return 0;
        } else {
            let totalSubnodesCount = this.children.length;
            this.children.forEach(node => {
                totalSubnodesCount += node.totalSubnodesCount();
            });
            return totalSubnodesCount;
        }
    }

    isAnd() {
        return this.groupType === 'and';
    }

    isOr() {
        return this.groupType === 'or';
    }

    isAlt() {
        return this.groupType === 'alt';
    }

    isLeaf() {
        return this.children.length === 0;
    }

    uncollapse(toRoot = true) {
        if (this.isCollapsed && !this.isLeaf()) {
            this.d3Node.children = this.d3Node.collapsedChildren;
            this.d3Node.collapsedChildren = null;
        }

        if (!this.isRoot && toRoot) {
            this.parent.uncollapse();
        }

        this.isCollapsed = false;
    }

    collapse() {
        if (!this.isCollapsed && !this.isLeaf()) {
            this.d3Node.collapsedChildren = this.d3Node.children;
            this.d3Node.children = null;
        }

        this.isCollapsed = true;
    }

    toggleCollapse() {
        if (this.isCollapsed) {
            this.uncollapse();
        } else {
            this.collapse();
        }
    }

    getAllNodesToRoot() {
        if (this.isRoot) {
            return [this];
        } else {
            return [this, ...this.parent.getAllNodesToRoot()];
        }
    }

    getLeftSibling() {
        const index = this.parent.children.indexOf(this);
        if (index === 0) {
            return null;
        }
        return this.parent.children[index - 1];
    }

    getRightSibling() {
        const index = this.parent.children.indexOf(this);
        if (index === this.parent.children.length - 1) {
            return null;
        }
        return this.parent.children[index + 1];
    }

    getLeftSiblings() {
        if (this.isRoot) {
            return [];
        }
        const index = this.parent.children.indexOf(this);
        return this.parent.children.slice(0, index);
    }

    getRightSiblings() {
        if (this.isRoot) {
            return [];
        }
        const index = this.parent.children.indexOf(this);
        return this.parent.children.slice(index + 1);
    }

    toggleHideLeftSiblings() {
        if (this.getLeftSibling().isHidden) {
            this.unhideLeftSiblings();
        } else {
            this.hideLeftSiblings();
        }
    }

    toggleHideRightSiblings() {
        if (this.getRightSibling().isHidden) {
            this.unhideRightSiblings();
        } else {
            this.hideRightSiblings();
        }
    }

    hideLeftSiblings() {
        if (this.isRoot) {
            return;
        }

        const leftSiblings = this.getLeftSiblings();
        if (!leftSiblings.length) return;
        leftSiblings.forEach(node => node.isHidden = true);

        const leftD3Siblings = leftSiblings.map(node => node.d3Node);
        const pseudoNode = new PseudoNode(this.parent, leftD3Siblings);
        const d3PseudoNode = d3.hierarchy(pseudoNode);
        pseudoNode.d3Node = d3PseudoNode;

        const index = this.parent.d3Node.children.indexOf(this.d3Node);
        const rightD3Siblings = this.parent.d3Node.children.slice(index + 1);
        this.parent.d3Node.children = [d3PseudoNode, this.d3Node, ...rightD3Siblings];
    }

    hideRightSiblings() {
        if (this.isRoot) {
            return;
        }

        const rightSiblings = this.getRightSiblings();
        if (!rightSiblings.length) return;
        rightSiblings.forEach(node => node.isHidden = true);

        const rightD3Siblings = rightSiblings.map(node => node.d3Node);
        const pseudoNode = new PseudoNode(this.parent, rightD3Siblings);
        const d3PseudoNode = d3.hierarchy(pseudoNode);
        pseudoNode.d3Node = d3PseudoNode;

        const index = this.parent.d3Node.children.indexOf(this.d3Node);
        const leftD3Siblings = this.parent.d3Node.children.slice(0, index);
        this.parent.d3Node.children = [...leftD3Siblings, this.d3Node, d3PseudoNode];
    }

    unhideLeftSiblings() {
        if (this.isRoot) {
            return;
        }

        const leftSiblings = this.getLeftSiblings();
        leftSiblings.forEach(node => node.isHidden = false);

        const index = this.parent.d3Node.children.indexOf(this.d3Node);
        const rightD3Siblings = this.parent.d3Node.children.slice(index + 1);
        const leftD3Siblings = leftSiblings.map(node => node.d3Node);
        this.parent.d3Node.children = [...leftD3Siblings, this.d3Node, ...rightD3Siblings];
    }

    unhideRightSiblings() {
        if (this.isRoot) {
            return;
        }

        const rightSiblings = this.getRightSiblings();
        rightSiblings.forEach(node => node.isHidden = false);

        const index = this.parent.d3Node.children.indexOf(this.d3Node);
        const leftD3Siblings = this.parent.d3Node.children.slice(index + 1);
        const rightD3Siblings = rightSiblings.map(node => node.d3Node);
        this.parent.d3Node.children = [...leftD3Siblings, this.d3Node, ...rightD3Siblings];
    }

    hide() {
        if (this.isRoot) {
            return;
        }

        const index = this.parent.d3Node.children.indexOf(this.d3Node);

        // Check if the d3Node left is also a pseudo-node. If true merge with current one.
        let leftHiddenD3Nodes = [];
        let leftIndex = index;
        if (index !== 0) {
            const leftD3Node = this.parent.d3Node.children[index - 1];
            if (leftD3Node.data instanceof PseudoNode) {
                leftHiddenD3Nodes = leftD3Node.data.hiddenD3Nodes;
                leftIndex--;
            }
        }

        // Check if the d3Node right is also a pseudo-node. If true merge with current one.
        let rightHiddenD3Nodes = [];
        let rightIndex = index;
        if (index !== this.parent.d3Node.children.length - 1) {
            const rightD3Node = this.parent.d3Node.children[index + 1];
            if (rightD3Node.data instanceof PseudoNode) {
                rightHiddenD3Nodes = rightD3Node.data.hiddenD3Nodes;
                rightIndex++;
            }
        }

        const hiddenD3Nodes = [...leftHiddenD3Nodes, this.d3Node, ...rightHiddenD3Nodes];

        const pseudoNode = new PseudoNode(this.parent, hiddenD3Nodes);
        const d3PseudoNode = d3.hierarchy(pseudoNode);
        pseudoNode.d3Node = d3PseudoNode;

        const leftD3Siblings = this.parent.d3Node.children.slice(0, leftIndex);
        const rightD3Siblings = this.parent.d3Node.children.slice(rightIndex + 1);

        this.parent.d3Node.children = [...leftD3Siblings, d3PseudoNode, ...rightD3Siblings];
        this.isHidden = true;
    }

    hideAllNodesOnThisLevel() {
        if (this.getLeftSiblings().length) {
            this.hideLeftSiblings();
        }
        if (this.getRightSiblings().length) {
            this.hideRightSiblings();
        }
    }

    hideAllOtherNodes() {
        this.collapse();
        this.getAllNodesToRoot().forEach(node => node.hideAllNodesOnThisLevel());
    }

    unhideChildren() {
        if (this.isLeaf()) {
            return;
        }

        this.children.forEach(node => node.isHidden = false);
        this.d3Node.children = this.children.map(node => node.d3Node);
    }

    insertChildAtIndex(child, index) {
        // Update d3-parent
        child.d3Node.parent = this.d3Node;
        child.parent = this;

        // Update d3-children
        const d3Children = this.getD3Children();
        const leftD3Nodes = d3Children.slice(0, index);
        const rightD3Nodes = d3Children.slice(index);
        this.d3Node.children = [...leftD3Nodes, child.d3Node, ...rightD3Nodes];

        // Update feature-node-children
        const leftNodes = this.children.slice(0, index);
        const rightNodes = this.children.slice(index);
        this.children = [...leftNodes, child, ...rightNodes];
    }

    removeChild(child) {
        this.children = this.children.filter(node => node !== child);
        this.d3Node.children = this.getD3Children().filter(d3Node => d3Node.data !== child);
    }

    getD3Children() {
        return this.children.map(node => node.d3Node);
    }

    each(func) {
        func(this);
        if (!this.isLeaf()) {
            this.children.forEach(node => node.each(func));
        }
    }

    descendants() {
        if (this.isLeaf()) {
            return [this];
        } else {
            return [this, ...this.children.map(node => node.descendants()).flat()];
        }
    }

    markAsEdited() {
        this.markedAsEdited = true;
    }

    unmarkAsEdited() {
        this.markedAsEdited = false;
    }

    getHighlightedConstraints() {
        return this.constraints.filter((constraint) => constraint.isHighlighted);
    }

    highlightConstraints() {
        this.constraints.forEach((constraint) => constraint.isHighlighted = true);
    }

    toConfigString(){
      let configText = '';

      switch (this.selectionState){
        case SelectionState.ImplicitlySelected:
          configText = "automatic=\"selected\"";
          break;
        case SelectionState.ExplicitlySelected:
          configText = "manual=\"selected\"";
          break;
        case SelectionState.ImplicitlyDeselected:
          configText = "automatic=\"deselected\"";
          break;
        case SelectionState.ExplicitlyDeselected:
          configText = "manual=\"deselected\"";
          break;
        case 'Unselected':
          break;
      }

      return `<feature ${configText} name="${this.name}"/>`
    }
}

export function createFeatureNode(parent, name, groupType, mandatory, abstract) {
    const node = new FeatureNode(parent, name, groupType, mandatory, abstract);
    node.d3Node = d3.hierarchy(node);
    return node;
}
