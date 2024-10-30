import cases from "./treatedCases.js"
import Decimal from "decimal.js"

const example = cases[0]
const FN_MAX_FLOAT = 6.99
const MW_MAX_FLOAT = 14.99
const FT_MAX_FLOAT = 37.99
const WW_MAX_FLOAT = 44.99
const test = []

const ranges = [
    { max: new Decimal(FN_MAX_FLOAT), label: "FN" },
    { max: new Decimal(MW_MAX_FLOAT), label: "MW" },
    { max: new Decimal(FT_MAX_FLOAT), label: "FT" },
    { max: new Decimal(WW_MAX_FLOAT), label: "WW" }
];

function getRange(float) {
    const range = ranges.find(r => float < r.max);
    return range ? range.label : "BS";
}

function getAverageFloat(maxFloatType, minFloat, proportion) {
    return Number(minFloat*100 > maxFloatType ? null : new Decimal(maxFloatType).minus(minFloat*100).times(proportion).dividedBy(100))
}

function buildSkinInfoObj(averageFloat, range){
    return {
        averageFloat: averageFloat,
        averageFloatRange: range
    }
}

example.skinsByRarity.classified.forEach(skin => {
    const skinTradeupInfo = {}
    const maxFloat = skin.maxFloat
    const minFloat = skin.minFloat
    const amplitude = (skin.maxFloat - minFloat)*100
    const proportion = 100/amplitude;

    skinTradeupInfo.name = skin.name
    const maxFloatValues = [
        { key: "FN", max: FN_MAX_FLOAT },
        { key: "MW", max: MW_MAX_FLOAT },
        { key: "FT", max: FT_MAX_FLOAT },
        { key: "WW", max: WW_MAX_FLOAT },
        { key: "BS", max: maxFloat * 100 }
    ];

    maxFloatValues.forEach(({key, max}) => {
        const averageMaxFloat = getAverageFloat(max, minFloat, proportion);
        const range = getRange(averageMaxFloat*100);
        skinTradeupInfo[`averageMaxFloat${key}`] = buildSkinInfoObj(averageMaxFloat);
        skinTradeupInfo.bestInputs = getBestInputs(averageMaxFloat, range);
    })

    test.push(skinTradeupInfo)

})

function getBestInputs(averageMaxFloat, range) {
    const inputs = example.skinsByRarity.milspec

    inputs.forEach((input) => {
        
        console.log(input)
    })
}

console.log(test)