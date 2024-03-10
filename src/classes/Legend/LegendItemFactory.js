

/**
 * File to bundle all different LegendItems  e.g. for or Group etc.
 */

import { LegendItem } from '@/classes/Legend/LegendItem';

const location = window.location.origin

/**
 *
 * @returns Or Group LegendItem
 */
export function getOrGroup(){
    return new LegendItem("Or Group", location + "/src/assets/legend/or.png");
}
/**
 *
 * @returns Alternative Group LegendItem
 */
export function getAltGroup(){
    return new LegendItem("Alternative Group", "/src/assets/legend/alt.png");
}
/**
 *
 * @returns And Group LegendItem
 */
export function getAndGroup(){
    return new LegendItem("And Group", location + "/src/assets/legend/and.png");
}
/**
 *
 * @returns Abstract Feature LegendItem
 */
export function getAbstractFeature(){
    return new LegendItem("Abstract Feature", location + "/src/assets/legend/abstract.png");
}
/**
 *
 * @returns Concrete Feature LegendItem
 */
export function getConcreteFeature(){
    return new LegendItem("Concrete Feature", location + "/src/assets/legend/concrete.png");
}
/**
 *
 * @returns Mandatory Feature LegendItem
 */
export function getMandatoryFeature(){
    return new LegendItem("Mandatory Feature", location + "/src/assets/legend/mandatory.png");
}
/**
 *
 * @returns Optional Feature LegendItem
 */
export function getOptionalFeature(){
    return new LegendItem("Optional Feature", location + "/src/assets/legend/optional.png");
}
