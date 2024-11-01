import cases from "./treatedCases.js";
import Decimal from "decimal.js";

const FN_MAX_FLOAT = 6.99;
const MW_MAX_FLOAT = 14.99;
const FT_MAX_FLOAT = 37.99;
const WW_MAX_FLOAT = 44.99;

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
    return Number(minFloat * 100 > maxFloatType ? null : new Decimal(maxFloatType).minus(minFloat * 100).times(proportion).dividedBy(100));
}

function buildSkinInfoObj(averageFloat, range) {
    return {
        averageFloatForTradeup: averageFloat,
        averageFloatRange: range
    };
}

// Função para filtrar skins em que o range de averageFloat diverge do range esperado
function isDivergentSkin(skinTradeupInfo, expectedRange) {
    return skinTradeupInfo.averageFloatRange !== expectedRange;
}

// Objeto para armazenar todas as informações organizadas por caixa
const organizedSkinsByBox = cases.map((c, index) => {
    const box = {
        box: c.case, // ID para identificar cada caixa
        bestInputsForRestricted: null, // Melhor input para a raridade "restricted" apenas na primeira caixa
        rarities: {} // Armazena skins separadas por raridade dentro da caixa
    };

    for (const rarity in c.skinsByRarity) {
        if (rarity !== "milspec") {
            // Inicializa a lista de skins para cada raridade
            if (!box.rarities[rarity]) {
                box.rarities[rarity] = [];
            }

            c.skinsByRarity[rarity].forEach(skin => {
                const skinTradeupInfo = {};
                const maxFloat = skin.maxFloat;
                const minFloat = skin.minFloat;
                const amplitude = (skin.maxFloat - minFloat) * 100;
                const proportion = 100 / amplitude;

                skinTradeupInfo.name = skin.name;

                const maxFloatValues = [
                    { key: "FN", max: FN_MAX_FLOAT },
                    { key: "MW", max: MW_MAX_FLOAT },
                    { key: "FT", max: FT_MAX_FLOAT },
                    { key: "WW", max: WW_MAX_FLOAT },
                    { key: "BS", max: maxFloat * 100 }
                ];

                maxFloatValues.forEach(({ key, max }) => {
                    const averageMaxFloat = getAverageFloat(max, minFloat, proportion);
                    const range = getRange(averageMaxFloat * 100);
                    const skinInfo = buildSkinInfoObj(averageMaxFloat, range);

                    // Filtra apenas skins divergentes de acordo com o range esperado (por exemplo, FN calculado como MW)
                    if (isDivergentSkin(skinInfo, key)) {
                        skinTradeupInfo[`averageMaxFloat${key}`] = skinInfo;
                    }
                });

                // Adiciona a skin à lista da raridade correspondente na caixa, apenas se tiver divergências
                if (Object.keys(skinTradeupInfo).length > 1) { // Verifica se há divergências registradas
                    box.rarities[rarity].push(skinTradeupInfo);
                }
            });

            // Calcula os bestInputs apenas para a raridade "restricted" na primeira caixa
            if (rarity === "restricted" && box.bestInputsForRestricted === null) {
                box.bestInputsForRestricted = getBestInputs(c, rarity);
            }
        }
    }
    return box;
});

function getBestInputs(caseData, rarity) {
    const inputs = caseData.skinsByRarity.milspec;

    // Ordena pelo menor maxFloat
    inputs.sort((a, b) => a.maxFloat - b.maxFloat);

    // Obtém o menor maxFloat
    const minMaxFloat = inputs[0].maxFloat;

    // Filtra as skins com o menor maxFloat
    const bestInputs = inputs.filter(skin => skin.maxFloat === minMaxFloat);

    return bestInputs;
}

// Output final
console.log("Organized Divergent Skins by Box:", JSON.stringify(organizedSkinsByBox, null, 2));
