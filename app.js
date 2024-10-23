const fs = require('fs');
const cases = require("./cases.json");
const axios = require('axios');

const headers = {
    "Referer": "https://www.tradeupspy.com/"
};

async function fetchCases() {
    const treatedCases = [];
    for (const box of cases) {
        try {
            let response = await axios.get(box.tradeupspyUrl, {
                headers: headers,
            });

            const skinsDetails = await fetchSkinsDetails(response.data);
            treatedCases.push({
                "case": box.name,
                "skins": skinsDetails
            });
        } catch (error) {
            console.log(error);
        }
    }

    // Save the treatedCases to a JSON file
    fs.writeFile('treatedCases.json', JSON.stringify(treatedCases, null, 2), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote treatedCases.json');
        }
    });
}

async function fetchSkinsDetails(data) {
    const skinsInfo = [];
    const baseUrl = `https://api.tradeupspy.com/api/skins/full/`;
    let urls = data.skinList.map(skin => `${baseUrl}${skin.ids}`);

    try {
        let responses = await Promise.all(
            urls.map(url => axios.get(url, {
                headers: headers
            }))
        );
        responses.forEach(response => {
            let skinData = response.data;

            let obj = {
                "name": skinData.name,
                "minFloat": skinData.minFloat,
                "maxFloat": skinData.maxFloat
            };

            skinsInfo.push(obj);
        });
        return skinsInfo;
    } catch (error) {
        console.log(error);
    }
}

fetchCases();
