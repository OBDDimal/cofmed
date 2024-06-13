import { jsonToXML } from '@/services/xmlTranspiler.service';
import axios, { CancelToken } from 'axios';
import { useAppStore } from '@/store/app';
import { getFeatureStats } from '@/classes/BackendAccess/FeatureIDEAccess';

export async function getColorsFromService(featureModel) {
    let xml = jsonToXML(featureModel);
    let data = await getFeatureStats(xml);
    if (data === undefined){
        return false;
    }
    let deadFeatures = data.deadFeatures;
    let falseOptionalFeatures = data.falseOptionalFeatures;
    let coreFeatures = data.coreFeatures;

    if (coreFeatures.length > 0) {
        featureModel.rootNode.descendants().filter(node => coreFeatures.includes(node.name)).forEach(node => node.core = true);
        featureModel.rootNode.descendants().filter(node => !coreFeatures.includes(node.name)).forEach(node => node.core = false);
    }
    if (falseOptionalFeatures.length > 0) {
        featureModel.rootNode.descendants().filter(node => falseOptionalFeatures.includes(node.name)).forEach(node => node.falseOptional = true);
        featureModel.rootNode.descendants().filter(node => !falseOptionalFeatures.includes(node.name)).forEach(node => node.falseOptional = false);
    }
    if (deadFeatures.length > 0) {
        featureModel.rootNode.descendants().filter(node => deadFeatures.includes(node.name)).forEach(node => node.dead = true);
        featureModel.rootNode.descendants().filter(node => !deadFeatures.includes(node.name)).forEach(node => node.dead = false);
    }
    return true;
}


