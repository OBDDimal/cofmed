import { flextree } from 'd3-flextree';
import * as CONSTANTS from '@/classes/constants';
import * as d3 from 'd3';
import * as windowResize from '@/services/FeatureModel/windowResize.service.js';
import * as updateService from '@/services/FeatureModel/update.service';

export function initData(d3Data, data) {
    // Create root-feature-node with d3 and the data of the feature-model.
    d3Data.root = d3.hierarchy(data, (node) => node.children);
    d3Data.root.each((d3Node) => (d3Node.data.d3Node = d3Node));
}

export function initialize(d3Data, data) {
    // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
    d3Data.flexlayout = flextree()
        .nodeSize((d3Node) => calcNodeSize(d3Data, d3Node))
        .spacing((d3NodeA, d3NodeB) => d3NodeA.path(d3NodeB).length);

    initData(d3Data, data);
    d3Data.zoom = d3
        .zoom()
        .scaleExtent([0.125, 5])
        .on('zoom', (event) => svgContent.attr('transform', event.transform));

    // Create svg-container.
    let svg = undefined;
    if (d3Data.isConf) {
        svg = d3
            .select('#svg-container')
            .append('svg')
            .classed('main-svg', true)
            .attr('height', d3.select('#svg-container').style('height'))
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .call(d3Data.zoom) // Zooming and penning.
            .on('dblclick.zoom', null);
    } else {
        svg = d3
            .select('#svg-container')
            .append('svg')
            .classed('main-svg', true)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .call(d3Data.zoom) // Zooming and penning.
            .on('dblclick.zoom', null);
    }


    const svgContent = svg.append('g').attr("id", "draggable");

    d3Data.container.highlightedConstraintsContainer = svgContent
        .append('g')
        .classed('highlighted-constraints-container', true);

    if (d3Data.isConf) {
        d3Data.container.selectedFeatureContainer = svgContent
            .append('g')
            .classed('selected-feature-container', true);
    }

    d3Data.container.linksContainer = svgContent
        .append('g')
        .classed('link-container', true);

    d3Data.container.segmentsContainer = svgContent
        .append('g')
        .classed('segments-container', true);

    d3Data.container.featureNodesContainer = svgContent
        .append('g')
        .classed('feature-node-container', true);

    d3Data.container.dragContainer = svgContent
        .append('g')
        .classed('drag-container', true);

    // Listen to window resize.
    window.onresize = () => windowResize.update(d3Data);
    windowResize.update(d3Data);
    initLegend(d3Data);
}

function calcNodeSize(d3Data, d3Node) {
    let width, height;
    switch (d3Data.direction) {
        case 'v':
            width = d3Node.width + d3Data.spaceBetweenSiblings;
            height = CONSTANTS.RECT_HEIGHT + d3Data.spaceBetweenParentChild;
            break;
        case 'h':
            width = CONSTANTS.RECT_HEIGHT + d3Data.spaceBetweenSiblings;
            height =
                d3Data.maxHorizontallyLevelWidth[d3Node.data.level()] +
                d3Data.spaceBetweenParentChild;
            break;
    }

    return [width, height];
}


export function initLegend(d3Data) {
    if (!d3Data.showLegend || true) {
        return;
    }


    /**
     * Initialize Legend drawn in SVG by appending a svg to the main-svg
     */
    let smartphone = window.innerWidth < 960;
    if (!smartphone) {
        let svg = d3.select('#draggable')
            .append('g')
            .attr('transform', 'translate(150,-200)');

        let rect = svg.append('rect')
            .attr('width', 250)
            .attr('height', 100)
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
            .classed('legend-container', true);

        let items = svg
            .append('g')
            .classed('legend-items', true)
            .append('text')
            .attr('transform', 'translate(10,20)')
            .text('Legend: ');

        updateService.updateLegend(d3Data);
    } else {
        let svg = d3.select('#draggable')
            .append('g')
            .attr('transform', 'translate(50,50)');

        let rect = svg.append('rect')
            .attr('width', 200)
            .attr('height', 100)
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', '1px')
            .classed('legend-container', true);

        let items = svg
            .append('g')
            .classed('legend-items', true)
            .append('text')
            .attr('transform', 'translate(10,20)')
            .text('Legend: ');

        updateService.updateLegend(d3Data);
    }

}
