import * as d3 from 'd3';
import * as update from '@/services/FeatureModel/update.service.js';
import { PseudoNode } from '@/classes/PseudoNode';

export function reset(d3Data, uncollapsedLevels = 4, maxChildrenCount = 3) {
    // Collapses all nodes after depth 1.

    const visibleD3Nodes = d3Data.flexlayout(d3Data.root).descendants();
    visibleD3Nodes.forEach(node => {
        if(node.data instanceof PseudoNode)  {
            node.data.unhideHiddenNodes();
        }
    } );
    d3Data.root.data.each(node => node.collapse());
    let parent = d3Data.root.data;

    resetHiddenAndCollapsed(parent, parent.children, uncollapsedLevels, maxChildrenCount, 1);

    update.updateSvg(d3Data);
    zoomFit(d3Data);
}

export function zoomFit(d3Data, padding = 0.75) {
    let bounds = document.querySelector('svg > g').getBBox();
    let fullWidth = document.querySelector('svg').getBoundingClientRect().width,
        fullHeight = document.querySelector('svg').getBoundingClientRect().height;
    let width = bounds.width,
        height = bounds.height;
    let midX = bounds.x + width / 2,
        midY = bounds.y + height / 2;

    // nothing to fit
    if (width === 0 || height === 0) {
        return;
    }

    let scale = padding / Math.max(width / fullWidth, height / fullHeight);

    d3.select('svg').call(d3Data.zoom.translateTo, midX, midY).call(d3Data.zoom.scaleTo, scale);
}

export function focusNode(d3Data, d3Node) {
    d3.select('svg').call(d3Data.zoom.translateTo, d3Node.x, d3Node.y);
}

function resetHiddenAndCollapsed(parent, children, uncollapsedLevels, maxChildrenCount, currentLevel){
    if(currentLevel > uncollapsedLevels){
        return;
    }
    currentLevel += 1;
    parent.uncollapse();

    for (let i = 0; i < children.length; i++) {
        if(i < maxChildrenCount){
            resetHiddenAndCollapsed(children[i], children[i].children, uncollapsedLevels, maxChildrenCount, currentLevel);
        } else {
            children[i].hide();
        }
    }
}
