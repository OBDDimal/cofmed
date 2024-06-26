import * as createPaths from '@/services/FeatureModel/createPaths.service.js';
import * as CONSTANTS from '@/classes/constants';
import * as collapse from '@/services/FeatureModel/collapse.service.js';
import { FeatureNode } from '@/classes/FeatureNode';
import { PseudoNode } from '@/classes/PseudoNode';
import * as count from '@/services/FeatureModel/count.service';
import { ghostNodeTouchMove } from '@/services/FeatureModel/dragAndDrop.service';
import { RECT_HEIGHT } from '@/classes/constants';
import * as d3 from 'd3';
import * as legendItems from '@/classes/Legend/LegendItemFactory';
import { SelectionState } from '@/classes/SelectionState';


let d3DataSaved = undefined;
const touchDevice = (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement);
let smartphone = window.innerWidth < 960;
function updateFeatureNodes(d3Data, visibleD3Nodes) {
    const featureNode = d3Data.container.featureNodesContainer
        .selectAll('g.node')
        .data(
            visibleD3Nodes.filter(
                (d3Node) => d3Node.data instanceof FeatureNode
            ),
            (d3Node) => d3Node.id || (d3Node.id = ++d3Data.nodeIdCounter)
        );

    // Enter new nodes
    const featureNodeEnter = featureNode
        .enter()
        .append('g')
        .classed('node', true)
        .on('contextmenu', (event, d3Node) => {
            if (d3Data.isConf) {
                event.preventDefault();
                d3Data.selectedD3Node = d3Node.data;
            } else {
                // only use contextmenu on non-mobile devices
                if (!touchDevice) {
                    event.preventDefault();
                    d3Data.contextMenu.selectedD3Node = d3Node;
                    d3Data.contextMenu.event = event;
                } else {
                    event.preventDefault();
                }
            }

        })
        // Toggle collapsing on double-clock on feature-node.
        .on('click', (event, d3Node) => {
            if (d3Data.isConf) {
                dblClickEvent(event, d3Data, d3Node);
                collapse.collapseShortcut(d3Data, event, d3Node); // Collapse d3Node with Ctrl + left-click on d3Node.
            } else {
                // Use click for contextmenu on mobile
                if (touchDevice) {
                    d3Data.contextMenu.selectedD3Node = d3Node;
                    d3Data.contextMenu.event = event;
                }
                dblClickEvent(event, d3Data, d3Node);
                collapse.collapseShortcut(d3Data, event, d3Node); // Collapse d3Node with Ctrl + left-click on d3Node.
            }


        });

    const rectAndTextEnter = featureNodeEnter
        .append('g')
        .classed('rect-and-text', true);
    rectAndTextEnter.append('rect').attr('height', CONSTANTS.RECT_HEIGHT);
    rectAndTextEnter
        .append('text')
        .attr('font-size', CONSTANTS.FEATURE_FONT_SIZE);

    featureNodeEnter
        .append('circle')
        .classed('and-group-circle', true)
        .attr('r', CONSTANTS.MANDATORY_CIRCLE_RADIUS);

    // Update nodes
    const featureNodeUpdate = featureNodeEnter.merge(featureNode);
    featureNodeUpdate.attr(
        'transform',
        (d3Node) => `translate(${d3Node.x}, ${d3Node.y})`
    );
    featureNodeUpdate
        .select('.and-group-circle')
        .classed('mandatory-and-group-circle', (d3Node) => d3Node.parent && (d3Node.parent.data.isAnd() || d3Node.parent.data.children.length === 1) && d3Node.data.isMandatory)
        .classed('optional-and-group-circle', (d3Node) => d3Node.parent && (d3Node.parent.data.isAnd() || d3Node.parent.data.children.length === 1) && !d3Node.data.isMandatory)
        .classed('false-optional', (d3Node) => d3Node.data.falseOptional);

    if (d3Data.nonSemanticEditing) {
        featureNodeUpdate
            .call(d3Data.drag.listener)
            // Highlight and reset highlighting of ghost-nodes during drag and drop of feature-nodes.
            .on('touchmove', (event) => ghostNodeTouchMove(event, d3Data), true);
    } else {
        featureNodeUpdate
            .on('mousedown.drag', null)
            .on('touchmove', null);
    }

    const rectAndTextUpdate = featureNodeUpdate.select('.rect-and-text');
    rectAndTextUpdate
        .select('rect')
        .classed('is-searched-feature', (d3Node) => d3Node.data.isSearched)
        .classed('feature', true)
        .attr('x', (d3Node) => d3Data.direction === 'v' ? -d3Node.width / 2 : 0)
        .attr('y', d3Data.direction === 'v' ? 0 : -CONSTANTS.RECT_HEIGHT / 2)
        .attr('width', (d3Node) => d3Node.width);
    rectAndTextUpdate
        .select('text')
        .attr('dy', d3Data.direction === 'v' ? CONSTANTS.RECT_HEIGHT / 2 + 5.5 : 5.5)
        .classed('abstract', (d3Node) => d3Node.data.isAbstract)
        .classed('core', (d3Node) => d3Node.data.core)
        .classed('dead', (d3Node) => d3Node.data.dead)
        .attr('x', d3Data.direction === 'v' ? 0 : (d3Node) => d3Node.width / 2)
        .classed('whiteText', (d3Node) => {
            let color = d3Node.data.color();
            const rgb = color.replace(/[^\d,]/g, '').split(',');
            return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 <= 186;
        })
        .text((d3Node) => d3Data.isShortenedName ? d3Node.data.displayName : d3Node.data.name);

    // Remove old/invisible nodes.
    featureNode.exit().remove();

    featureNodeEnter.append('g').classed('children-count-container', true);
    featureNodeEnter.append('g').classed('quick-edit-actions-container', true);

    updateChildrenCount(d3Data, featureNodeUpdate);
    updateQuickEditActions(d3Data, featureNodeUpdate);
}

function updateQuickEditActions(d3Data, featureNodeUpdate) {
    const quickEditActions = featureNodeUpdate
        .select('g.quick-edit-actions-container')
        .selectAll('g.quick-edit-actions')
        .data(
            (d) => (d3Data.quickEdit && d3Data.featureModelTree.editRights ? [d] : []),
            (d) => d.data.id
        );

    const quickEditActionsEnter = quickEditActions
        .enter()
        .append('g')
        .classed('quick-edit-actions', true);
    const quickEditActionsUpdate =
        quickEditActionsEnter.merge(quickEditActions);

    // Bottom circle
    const bottomEnter = quickEditActionsEnter
        .append('g')
        .classed('quick-edit-action-child', true)
        .on('click', (e, d3Node) => {
            e.stopPropagation();
            d3Data.d3AddNodeIndex = d3Node.data.children.length;
            d3Data.featureModelTree.openAddAsChildDialog(d3Node);
        });
    drawQuickEditGroup(bottomEnter);
    quickEditActionsUpdate
        .select('g.quick-edit-action-child')
        .attr('transform', (d3Node) =>
            d3Data.direction === 'v'
                ? `translate(0, ${RECT_HEIGHT})`
                : `translate(${d3Node.width}, 0)`
        );

    // Left side circle
    const leftEnter = quickEditActionsEnter
        .filter((d3Node) => !d3Node.data.isRoot)
        .append('g')
        .classed('quick-edit-action-left', true)
        .on('click', (e, d3Node) => {
            e.stopPropagation();
            d3Data.d3AddNodeIndex = d3Node.data.parent.children.indexOf(
                d3Node.data
            );
            d3Data.featureModelTree.openAddAsSiblingDialog(d3Node);
        });
    drawQuickEditGroup(leftEnter);
    quickEditActionsUpdate
        .select('g.quick-edit-action-left')
        .attr('transform', (d3Node) =>
            d3Data.direction === 'v'
                ? `translate(${-d3Node.width / 2}, ${RECT_HEIGHT / 2})`
                : `translate(${d3Node.width / 2}, -${RECT_HEIGHT / 2})`
        );

    // Right side circle
    const rightEnter = quickEditActionsEnter
        .filter((d3Node) => !d3Node.data.isRoot)
        .append('g')
        .classed('quick-edit-action-right', true)
        .on('click', (e, d3Node) => {
            e.stopPropagation();
            d3Data.d3AddNodeIndex =
                d3Node.data.parent.children.indexOf(d3Node.data) + 1;
            d3Data.featureModelTree.openAddAsSiblingDialog(d3Node);
        });
    drawQuickEditGroup(rightEnter);
    quickEditActionsUpdate.select('g.quick-edit-action-right').attr(
        'transform',
        (d3Node) => `
    translate(${d3Node.width / 2}, ${RECT_HEIGHT / 2})`
    );

    quickEditActions.exit().remove();
}

function drawQuickEditGroup(d3Element) {
    // Enlarge on mobile
    const radius =
        'ontouchstart' in window
            ? CONSTANTS.QUICK_EDIT_RADIUS * 1.75
            : CONSTANTS.QUICK_EDIT_RADIUS;
    d3Element.append('circle').attr('fill', '#4caf50').attr('r', radius);
    d3Element
        .append('path')
        .attr(
            'd',
            `M -0.5 ${-(2 * radius) / 3} h 1 v ${(4 * radius) / 3} h -1 z`
        )
        .attr('fill', 'white');
    d3Element
        .append('path')
        .attr(
            'd',
            `M ${-(2 * radius) / 3} -0.5 v 1 h ${(4 * radius) / 3} v -1 z`
        )
        .attr('fill', 'white');
}

function updateChildrenCount(d3Data, featureNodeUpdate) {
    // Enter triangle with number of direct and total children.
    const childrenCount = featureNodeUpdate
        .select('g.children-count-container')
        .selectAll('g.children-count')
        .data(
            (d) => (d.data.isLeaf() || !d.data.isCollapsed ? [] : [d]),
            (d) => d.id
        );

    const childrenCountEnter = childrenCount
        .enter()
        .append('g')
        .classed('children-count', true);
    childrenCountEnter
        .append('polygon')
        .attr('fill', 'white')
        .attr('points', createPaths.calculateTriangle());
    childrenCountEnter
        .append('text')
        .classed('children-count-text', true)
        .classed('direct-children', true)
        .attr('dy', 5)
        .attr('font-size', CONSTANTS.CHILDREN_COUNT_FONT_SIZE);
    childrenCountEnter
        .append('text')
        .classed('children-count-text', true)
        .classed('total-children', true)
        .attr('dy', 15)
        .attr('font-size', CONSTANTS.CHILDREN_COUNT_FONT_SIZE);

    const childrenCountUpdate = childrenCountEnter.merge(childrenCount);
    childrenCountUpdate.attr('transform', (d3Node) => {
        if (d3Data.direction === 'v') {
            const x = 0;
            const y = CONSTANTS.RECT_HEIGHT + CONSTANTS.TRIANGLE_BORDER_OFFSET;
            return `translate(${x}, ${y})`;
        } else {
            const angle = CONSTANTS.TRIANGLE_HORIZONTAL_ROTATION;
            const x = d3Node.width + CONSTANTS.TRIANGLE_BORDER_OFFSET;
            const y = 0;
            return `translate(${x}, ${y})rotate(${angle})`;
        }
    });
    childrenCountUpdate
        .selectAll('text.direct-children')
        .text((d3Node) => d3Node.data.childrenCount());
    childrenCountUpdate
        .selectAll('text.total-children')
        .text((d3Node) => d3Node.data.totalSubnodesCount());

    childrenCount.exit().remove();
}

function updatePseudoNodes(d3Data, visibleD3Nodes) {
    const pseudoNode = d3Data.container.featureNodesContainer
        .selectAll('g.pseudo-node')
        .data(
            visibleD3Nodes.filter(
                (d3Node) => d3Node.data instanceof PseudoNode
            ),
            (d3Node) => d3Node.id || (d3Node.id = ++d3Data.nodeIdCounter)
        );
    const pseudoNodeEnter = pseudoNode
        .enter()
        .append('g')
        .classed('pseudo-node', true)
        .on('click', (_, d3Node) => {
            d3Node.data.unhideHiddenNodes();
            updateSvg(d3Data);
        });
    pseudoNodeEnter.append('circle').attr('r', CONSTANTS.PSEUDO_NODE_SIZE);
    pseudoNodeEnter
        .append('text')
        .attr('font-size', 30)
        .attr('dy', 2)
        .attr('dx', -12)
        .text('...');

    const pseudoNodeUpdate = pseudoNodeEnter.merge(pseudoNode);
    pseudoNodeUpdate.attr('transform', (d3Node) => {
        let dx = d3Node.x;
        let dy = d3Node.y;
        if (d3Data.direction === 'v') {
            dy += CONSTANTS.RECT_HEIGHT / 2;
        } else {
            dx += d3Node.width / 2;
        }
        return `
    translate(${dx}, ${dy})`;
    });

    pseudoNode.exit().remove();
}

function updateHighlightedConstraints(d3Data, visibleD3Nodes) {
    const highlightedNodes = visibleD3Nodes
        .filter((d3Node) => d3Node.data instanceof FeatureNode)
        .map((d3Node) => ({
            d3Node: d3Node,
            highlightedConstraints: d3Node.data.getHighlightedConstraints()
        }))
        .filter((d) => d.highlightedConstraints.length);

    const highlightedConstraintNodes =
        d3Data.container.highlightedConstraintsContainer
            .selectAll('g.highlighted-constraints')
            .data(
                highlightedNodes,
                (d) => d.d3Node.id || (d.d3Node.id = ++d3Data.nodeIdCounter)
            );

    const highlightedConstraintNodesEnter = highlightedConstraintNodes
        .enter()
        .append('g')
        .classed('highlighted-constraints', true);

    const highlightedConstraintNodeRects = highlightedConstraintNodesEnter
        .merge(highlightedConstraintNodes)
        .selectAll('rect')
        .data(
            (d) =>
                d.highlightedConstraints.map((c) => ({
                    constraint: c,
                    d3Node: d.d3Node
                })),
            (d) => d.constraint.toString() + d.d3Node.id
        );

    // Enter highlighted constraint rects
    const highlightedConstraintNodeRectsEnter = highlightedConstraintNodeRects
        .enter()
        .append('rect')
        .attr('stroke', (json) => json.constraint.color)
        .attr('stroke-width', CONSTANTS.STROKE_WIDTH_CONSTANT)
        .attr('fill', 'transparent');

    // Update highlighted constraint rects
    highlightedConstraintNodeRectsEnter
        .merge(highlightedConstraintNodeRects)
        .attr('x', (constraint) =>
            d3Data.direction === 'v' ? -constraint.d3Node.width / 2 : 0
        )
        .attr('y', d3Data.direction === 'v' ? 0 : -CONSTANTS.RECT_HEIGHT / 2)
        .attr(
            'height',
            (_, i) =>
                CONSTANTS.RECT_HEIGHT +
                i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT +
                CONSTANTS.STROKE_WIDTH_CONSTANT
        )
        .attr(
            'width',
            (constraint, i) =>
                constraint.d3Node.width +
                i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT +
                CONSTANTS.STROKE_WIDTH_CONSTANT
        )
        .attr(
            'transform',
            (json, i) => `
    translate(${
                json.d3Node.x -
                i * CONSTANTS.STROKE_WIDTH_CONSTANT -
                CONSTANTS.STROKE_WIDTH_CONSTANT / 2
            },
        ${
                json.d3Node.y -
                i * CONSTANTS.STROKE_WIDTH_CONSTANT -
                CONSTANTS.STROKE_WIDTH_CONSTANT / 2
            })`
        );

    // Remove constraints highlighted nodes
    highlightedConstraintNodes.exit().remove();
    highlightedConstraintNodeRects.exit().remove();
}

function updateSelectionHighlight(d3Data, visibleD3Nodes) {

    const selectedNodes = visibleD3Nodes
        .filter((d3Node) => d3Node.data instanceof FeatureNode )
        .map((d3Node) => ({
            d3Node: d3Node,
            feature: d3Node.data,
        }))
        .filter((d) => d.feature.selectionState !== SelectionState.Unselected || d.feature.open);

    const selectedFeatureNodes =
        d3Data.container.selectedFeatureContainer
            .selectAll('g.selected-nodes')
            .data(
                selectedNodes,
                (d) => d.d3Node.id || (d.d3Node.id = ++d3Data.nodeIdCounter)
            );

    const selectedFeatureNodesEnter = selectedFeatureNodes
        .enter()
        .append('g')
        .classed('selected-nodes', true);

    const selectedFeatureNodesRects = selectedFeatureNodesEnter
        .merge(selectedFeatureNodes)
        .selectAll('rect')
        .data((d) =>
            selectedNodes.filter((d3) => d3.d3Node.id === d.d3Node.id).map((d3) => ({
                    feature: d3.feature,
                    d3Node: d.d3Node,
                })),
            (d) => d.d3Node.name + d.d3Node.id
        );

    // Enter highlighted constraint rects
    const selectedFeatureNodesRectsEnter = selectedFeatureNodesRects
        .enter()
        .append('rect')
        .attr('fill', 'transparent');

    // Update highlighted constraint rects
    selectedFeatureNodesRectsEnter
        .merge(selectedFeatureNodesRects)
        .attr('class', (json) => {
            return json.feature.selectionType();
        })
        .attr('x', (json) =>
            d3Data.direction === 'v' ? -json.d3Node.width / 2 : 0
        )
        .attr('y', d3Data.direction === 'v' ? 0 : -CONSTANTS.RECT_HEIGHT / 2)
        .attr(
            'height',
            (_, i) =>
                CONSTANTS.RECT_HEIGHT +
                i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT +
                CONSTANTS.STROKE_WIDTH_CONSTANT
        )
        .attr(
            'width',
            (json, i) =>
                json.d3Node.width +
                i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT +
                CONSTANTS.STROKE_WIDTH_CONSTANT
        )
        .attr(
            'transform',
            (json, i) => `
    translate(${
                json.d3Node.x -
                i * CONSTANTS.STROKE_WIDTH_CONSTANT -
                CONSTANTS.STROKE_WIDTH_CONSTANT / 2
            },
        ${
                json.d3Node.y -
                i * CONSTANTS.STROKE_WIDTH_CONSTANT -
                CONSTANTS.STROKE_WIDTH_CONSTANT / 2
            })`
        );

    // Remove constraints highlighted nodes
    selectedFeatureNodesRects.exit().remove();
    selectedFeatureNodes.exit().remove();
}

function updateLinks(d3Data, visibleD3Nodes) {
    const links = visibleD3Nodes
        .slice(1)
        .filter((d3Node) => d3Node.data instanceof FeatureNode || d3Node.data instanceof PseudoNode );
    const link = d3Data.container.linksContainer
        .selectAll('path.link')
        .data(links, (d3Node) => d3Node.id);

    const linkEnter = link.enter().insert('path', 'g').classed('link', true);

    const linkUpdate = linkEnter.merge(link);
    linkUpdate
        .classed('is-searched-link', (d3Node) => d3Node.data.isSearched)
        .classed('false-optional', (d3Node) => d3Node.data.falseOptional)
        .attr('d', (d3Node) => {
            if (d3Data.direction === 'v') {
                if (d3Node.data instanceof PseudoNode) {
                    return createPaths.createLinkVertically(d3Node.data.parent.d3Node, d3Node);
                } else {
                    return createPaths.createLinkVertically(d3Node.parent, d3Node);
                }
            } else {
                if (d3Node.data instanceof PseudoNode) {
                    return createPaths.createLinkHorizontally(d3Node.data.parent.d3Node, d3Node);
                } else {
                    return createPaths.createLinkHorizontally(d3Node.parent, d3Node);
                }
            }
        });

    link.exit().remove();
}

function updateColoring(d3Data) {
    const allNodes = d3Data.root.data.descendants();
    count.colorNodes(allNodes, d3Data.coloringIndex);
}

function updateSegments(d3Data, visibleD3Nodes) {
    const segment = d3Data.container.segmentsContainer
        .selectAll('path.segment')
        .data(
            visibleD3Nodes.filter(
                (d3Node) =>
                    (d3Node.data instanceof FeatureNode ) &&
                    (d3Node.data.isAlt() || d3Node.data.isOr())
            ),
            (d3Node) => d3Node.id || (d3Node.id = ++d3Data.nodeIdCounter)
        );

    const segmentEnter = segment
        .enter()
        .append('path')
        .classed('segment', true);

    // Segment update.service.js
    segmentEnter
        .merge(segment)
        .classed('alt-group', (d3Node) => d3Node.data.isAlt())
        .classed('or-group', (d3Node) => d3Node.data.isOr())
        .attr('d', (d3Node) => {
            if (d3Data.direction === 'h') {
                return createPaths.createGroupSegmentHorizontally(
                    d3Node,
                    CONSTANTS.GROUP_SEGMENT_RADIUS
                );
            } else {
                return createPaths.createGroupSegmentVertically(
                    d3Node,
                    CONSTANTS.GROUP_SEGMENT_RADIUS
                );
            }
        })
        .attr('transform', (d3Node) => {
            let dx = d3Node.x;
            let dy = d3Node.y;
            if (d3Data.direction === 'h') {
                dx += d3Node.width;
            } else {
                dy += CONSTANTS.RECT_HEIGHT;
            }
            return `
    translate(${dx}, ${dy})`;
        });

    segment.exit().remove();
}

export function updateSvg(d3Data) {
    /*const start = performance.now();*/

    if(d3Data === undefined) {
        d3Data = d3DataSaved;
    } else {
        d3DataSaved = d3Data;
    }

    // Calculate rect widths of all d3Nodes once for better performance instead of repeatedly during update.
    d3Data.root.descendants().forEach((d3Node) => {
        d3Node.width = calcRectWidth(d3Data, d3Node);

        if (d3Node.data instanceof FeatureNode ) {
            const level = d3Node.data.level();
            if (d3Data.maxHorizontallyLevelWidth.length <= level) {
                d3Data.maxHorizontallyLevelWidth.push(0);
            }

            if (d3Data.maxHorizontallyLevelWidth[level] < d3Node.width) {
                d3Data.maxHorizontallyLevelWidth[level] = d3Node.width;
            }
        }
    });

    // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
    const visibleD3Nodes = d3Data.flexlayout(d3Data.root).descendants();

    // Swap x and y to draw from left to right instead of drawing from top to bottom
    if (d3Data.direction === 'h') {
        visibleD3Nodes.forEach((d3Node) => {
            const x = d3Node.x;
            d3Node.x = d3Node.y;
            d3Node.y = x;
        });
    }

    updateColoring(d3Data);
    if(d3Data.isConf){
        updateSelectionHighlight(d3Data, visibleD3Nodes);
    }
    updateHighlightedConstraints(d3Data, visibleD3Nodes);
    updateSegments(d3Data, visibleD3Nodes);
    updateFeatureNodes(d3Data, visibleD3Nodes);
    updatePseudoNodes(d3Data, visibleD3Nodes);
    updateLinks(d3Data, visibleD3Nodes);
    //updateLegend(d3Data);
    /*console.log('Rendertime', performance.now() - start);*/
}

// Calculates rect-width dependent on font-size dynamically.
export function calcRectWidth(d3Data, d3Node) {
    if (d3Node.data instanceof FeatureNode ) {
        return (
            (d3Data.isShortenedName
                ? d3Node.data.displayName.length
                : d3Node.data.name.length) *
            (CONSTANTS.FEATURE_FONT_SIZE *
                CONSTANTS.MONOSPACE_HEIGHT_WIDTH_FACTOR) +
            CONSTANTS.RECT_MARGIN.left +
            CONSTANTS.RECT_MARGIN.right
        );
    } else {
        return CONSTANTS.PSEUDO_NODE_SIZE * 2;
    }
}

let touchtime = 0;

function dblClickEvent(event, d3Data, d3Node) {
    if (touchtime === 0) {
        // set first click
        touchtime = new Date().getTime();
    } else {
        // compare first click to this click and see if they occurred within double click threshold
        if (new Date().getTime() - touchtime < 300) {
            // double click occurred
            event.preventDefault();
            d3Node.data.toggleCollapse();
            updateSvg(d3Data);
            touchtime = 0;
        } else {
            // not a double click so set as a new first click
            touchtime = new Date().getTime();
        }
    }
}

export function updateLegend(d3Data) {
    if (!d3Data.showLegend) {
        // Legend not shown so just return
        return;
    }

    smartphone = window.innerWidth < 960;
    let legendItems = getDOMItems(d3Data);
    d3.selectAll('.legend-item')
        .remove();


    if (!smartphone) {
        let container = d3.select('.legend-container');
        let containerHeight = CONSTANTS.LEGEND_CONTAINER_OFFSET + legendItems.length * CONSTANTS.LEGEND_ITEM_HEIGHT;
        container.attr('height', containerHeight); // dynamically adjust container height
    } else {
        let container = d3.select('.legend-container');
        let containerHeight = CONSTANTS.LEGEND_CONTAINER_OFFSET_PHONE + legendItems.length * CONSTANTS.LEGEND_ITEM_HEIGHT_PHONE;
        container.attr('height', containerHeight); // dynamically adjust container height
    }

    let join = d3
        .select('.legend-items')
        .selectAll('legend-item')
        .data(legendItems)
        .join(enterLegendItems); //update legend items within container

}

export function hideLegend() {
    d3
        .selectAll('.legend-items')
        .remove();
    d3
        .selectAll('.legend-container')
        .remove();
    return;
}

function getDOMItems(d3Data) {
    /**
     * Go through d3 elements to determine the set of present Items to add to the legend
     */
        // let or_present= d3Data.container.segmentsContainer.classed('.or-group');
    let presentItems = [];
    presentItems.push(...addGroupItems());
    presentItems.push(...addElementItems(d3Data));
    presentItems.push(...addColorItems());
    return presentItems;
}

/**
 *
 * @returns Array of distinct found groups
 */
function addGroupItems() {
    let presentGroups = [];
    let or_groups = d3.select('.main-svg').selectAll('.or-group');
    if (or_groups.size() > 0) {
        presentGroups.push(legendItems.getOrGroup());
    }
    let alt_groups = d3.select('.main-svg').selectAll('.alt-group');
    if (alt_groups.size() > 0) {
        presentGroups.push(legendItems.getAltGroup());
    }
    return presentGroups;
}

/**
 * Add Element Items e.g. Abstract, concrete, Mandatory, Optional
 *  @returns Array of distinct found elements
 */
function addElementItems(d3Data) {
    let presentItems = [];
    let mandatoryPresent = false, optionalPresent = false; //mutually exclusive
    let abstractPresent = false, concretePresent = false;
    try {
        d3Data.featureModelTree.allNodes.forEach((fNode) => {
            if (fNode.isAbstract) {
                abstractPresent = true;
            } else {
                concretePresent = true;
            }
            if (fNode.isMandatory) {
                mandatoryPresent = true;
            } else {
                optionalPresent = true;
            }
        });
        if (mandatoryPresent) {
            presentItems.push(legendItems.getMandatoryFeature());
        }
        if (optionalPresent) {
            presentItems.push(legendItems.getOptionalFeature());
        }
        if (abstractPresent) {
            presentItems.push(legendItems.getAbstractFeature());
        }
        if (concretePresent) {
            presentItems.push(legendItems.getConcreteFeature());
        }


    } catch (error) {
        console.error(error);
    } finally {
        return presentItems;
    }

}

/**
 * TODO Add color items
 *  @returns Array of distinct found colors
 */
function addColorItems(presentItems) {
    return [];
}


/**
 *
 * @param selection where to hook the legendItems
 */
function enterLegendItems(selection) {

    if (!smartphone) {
        let legendItem = selection
            .append('g')
            .attr('transform', (d, i) => 'translate(10,' + (CONSTANTS.LEGEND_CONTAINER_OFFSET + i * CONSTANTS.LEGEND_ITEM_HEIGHT) + ')')
            .classed('legend-item', true);

        let img = legendItem.append('svg:image')
            .attr('class', 'iconUserTotal')
            .attr('width', CONSTANTS.LEGEND_IMG_WIDTH)
            .attr('height', CONSTANTS.LEGEND_IMG_HEIGHT)
            .attr('y', -CONSTANTS.LEGEND_IMG_HEIGHT)
            .attr('href', item => item.image);

        let text = legendItem.append('text')
            .text(item => item.description)
            .attr('transform', 'translate(55,0)')
            .classed('legend-item', true);
    } else {
        let legendItem = selection
            .append('g')
            .attr('transform', (d, i) => 'translate(5,' + (10 + CONSTANTS.LEGEND_CONTAINER_OFFSET_PHONE + i * CONSTANTS.LEGEND_ITEM_HEIGHT_PHONE) + ')')
            .classed('legend-item', true);

        let img = legendItem.append('svg:image')
            .attr('class', 'iconUserTotal')
            .attr('width', CONSTANTS.LEGEND_IMG_WIDTH_PHONE)
            .attr('height', CONSTANTS.LEGEND_IMG_HEIGHT_PHONE)
            .attr('y', -CONSTANTS.LEGEND_IMG_HEIGHT_PHONE)
            .attr('href', item => item.image);

        let text = legendItem.append('text')
            .text(item => item.description)
            .attr('transform', 'translate(55,0)')
            .classed('legend-item', true);
    }


}
