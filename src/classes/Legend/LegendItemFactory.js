import { LegendItem } from "./LegendItem"

/**
 * File to bundle all different LegendItems  e.g. for or Group etc.
 */

/**
 * 
 * @returns Or Group LegendItem
 */
export function getOrGroup(){
    return new LegendItem("Or Group", "IMG");
}
/**
 * 
 * @returns Alternative Group LegendItem
 */
export function getAltGroup(){
    return new LegendItem("Alternative Group", "IMG2");
}
/**
 * 
 * @returns Abstract Feature LegendItem
 */
export function getAbstractFeature(){
    return new LegendItem("Abstract Feature", "IMG3");
}
/**
 * 
 * @returns Concrete Feature LegendItem
 */
export function getConcreteFeature(){
    return new LegendItem("Concrete Feature", "IMG4");
}
/**
 * 
 * @returns Mandatory Feature LegendItem
 */
export function getMandatoryFeature(){
    return new LegendItem("Mandatory Feature", "IMG5");
}
/**
 * 
 * @returns Optional Feature LegendItem
 */
export function getOptionalFeature(){
    return new LegendItem("Optional Feature", "IMG6");
}