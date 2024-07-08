export async function getVariancDrivers(featureModel) {

    const allSubnodes = featureModel.rootNode.totalSubnodesCount();

    let highestLevel = 0;

    featureModel.rootNode.descendants().forEach(node => {
        if (node.level() > highestLevel) {
            highestLevel = node.level();
        }
    });

    highestLevel++;

    featureModel.rootNode.descendants().forEach(node => {
            if (!node.isRoot) {
                const opacity = 1 - node.level() / highestLevel - node.totalSubnodesCount() / allSubnodes;

                if ((node.isAlt() && !node.isLeaf() && node.childrenCount() > 1)  || (node.parent.isAlt() && node.parent.childrenCount() > 1)) {
                    node.colorValue = 'fill: rgb(0, 255, 0); opacity:' + opacity + ';';
                } else if ((node.isOr() && !node.isLeaf() && node.childrenCount() > 1) || (node.parent.isOr() && node.parent.childrenCount() > 1)) {
                    node.colorValue = 'fill: rgb(255, 0, 0); opacity:' + opacity + ';';
                } else {
                    node.colorValue = 'fill: rgb(0, 0, 255); opacity:' + opacity + ';';
                }
            }
        }
    );
}
