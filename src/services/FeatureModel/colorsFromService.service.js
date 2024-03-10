import { jsonToXML } from '@/services/xmlTranspiler.service';
import axios, { CancelToken } from 'axios';
import { useAppStore } from '@/store/app';
import { getFeatureStats } from '@/classes/BackendAccess/FeatureIDEAccess';

export async function getColorsFromService(featureModel, d3Data) {
    let xml = jsonToXML(featureModel);
    let data = await getFeatureStats(xml);
    if (data === undefined){
        return false;
    }
    let deadFeatures = data.deadFeatures;
    let falseOptionalFeatures = data.falseOptionalFeatures;
    let coreFeatures = data.coreFeatures;

    if (coreFeatures.length > 0) {
        d3Data.root.descendants().filter(node => coreFeatures.includes(node.data.name)).forEach(node => node.data.core = true);
        d3Data.root.descendants().filter(node => !coreFeatures.includes(node.data.name)).forEach(node => node.data.core = false);
    }
    if (falseOptionalFeatures.length > 0) {
        d3Data.root.descendants().filter(node => falseOptionalFeatures.includes(node.data.name)).forEach(node => node.data.falseOptional = true);
        d3Data.root.descendants().filter(node => !falseOptionalFeatures.includes(node.data.name)).forEach(node => node.data.falseOptional = false);
    }
    if (deadFeatures.length > 0) {
        d3Data.root.descendants().filter(node => deadFeatures.includes(node.data.name)).forEach(node => node.data.dead = true);
        d3Data.root.descendants().filter(node => !deadFeatures.includes(node.data.name)).forEach(node => node.data.dead = false);
    }
    return true;
}


