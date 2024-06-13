import { Feature } from '@/classes/Configurator/Feature';
import { Version } from '@/classes/Configurator/Version';

export class FeatureModelMulti {
    constructor(features, versions) {
        let map = new Map(Object.entries(features));
        this.features = [];
        map.forEach((value, key) => this.features.push(new Feature(value, key)));
        this.versions = versions.map((version, index) => new Version(index, version));
        this.satCount = 0;
    }
}
