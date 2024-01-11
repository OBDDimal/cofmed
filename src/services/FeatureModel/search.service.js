import levenshtein from 'js-levenshtein';
import * as view from "@/services/FeatureModel/view.service.js";
import * as update from '@/services/FeatureModel/update.service.js';
import { PseudoNode } from '@/classes/PseudoNode';

export function resetSearch(d3Data) {
    const visibleD3Nodes = d3Data.flexlayout(d3Data.root).descendants();
    visibleD3Nodes.forEach(node => {
        if(node.data instanceof PseudoNode)  {
            node.data.unhideHiddenNodes();
        }
    } );

    d3Data.root.data.each(node => {
        node.isSearched = false;
        node.collapse();
    });

}

export function markNodeAsSearched(d3Data, foundNode) {
    resetSearch(d3Data);

    foundNode.getAllNodesToRoot().forEach(node => node.isSearched = true);
    foundNode.uncollapse(true);

    update.updateSvg(d3Data);
    view.zoomFit(d3Data);
    view.focusNode(d3Data, foundNode.d3Node);
}

export function search(d3Data, searchText) {
    if (!searchText || searchText === '') {
        return [];
    }

    return d3Data.root.data
        .descendants()
        .map(node => {
            const currentNodeName = node.name.toLowerCase();
            if (currentNodeName !== searchText.toLowerCase() && currentNodeName.includes(searchText.toLowerCase())) {
                return {node: node, distance: 1};
            }

            return {node: node, distance: levenshtein(node.name.toLowerCase(), searchText.toLowerCase())};
        })
        .filter(d => d.distance <= 2)
        .sort((a, b) => a.distance - b.distance);
}
