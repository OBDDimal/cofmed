import { jsonToXML } from '@/services/xmlTranspiler.service';
import axios, { CancelToken } from 'axios';
import { useAppStore } from '@/store/app';

export async function getColorsFromService(featureModel, d3Data) {
    try {
        const source = CancelToken.source();
        const timeout = setTimeout(() => {
          source.cancel();
          // Timeout Logic
        }, 450);
        const content = new TextEncoder().encode(jsonToXML(featureModel));
        let response = await axios.post(`${import.meta.env.VITE_APP_DOMAIN_FEATUREIDESERVICE}stats`, {
          name: featureModel.id + ".xml",
          content: Array.from(content)
        }, {cancelToken: source.token});
        clearTimeout(timeout);
        let deadFeatures = response.data.deadFeatures;
        let falseOptionalFeatures = response.data.falseOptionalFeatures;
        let coreFeatures = response.data.coreFeatures;

        if (coreFeatures.length > 0) {
            d3Data.root.descendants().filter(node => coreFeatures.includes(node.data.name)).forEach(node => node.data.core = true);
            d3Data.root.descendants().filter(node => !coreFeatures.includes(node.data.name)).forEach(node => node.data.core = false);
        } else {
            d3Data.root.descendants().forEach(node => node.data.core = false);
        }
        if (falseOptionalFeatures.length > 0) {
            d3Data.root.descendants().filter(node => falseOptionalFeatures.includes(node.data.name)).forEach(node => node.data.falseOptional = true);
            d3Data.root.descendants().filter(node => !falseOptionalFeatures.includes(node.data.name)).forEach(node => node.data.falseOptional = false);
        } else {
            d3Data.root.descendants().forEach(node => node.data.falseOptional = false);
        }
        if (deadFeatures.length > 0) {
            d3Data.root.descendants().filter(node => deadFeatures.includes(node.data.name)).forEach(node => node.data.dead = true);
            d3Data.root.descendants().filter(node => !deadFeatures.includes(node.data.name)).forEach(node => node.data.dead = false);
        } else {
            d3Data.root.descendants().forEach(node => node.data.dead = false);
        }

        return true;
    } catch (e) {
        const appStore = useAppStore()
        appStore.updateSnackbar(
          'Could not detect any special cases, because Service is down.',
          'error',
          3000,
          true)
        return false;
    }
}
