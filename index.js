import * as fs from 'fs';
import superagent from 'superagent';

const pageLimit = 2;

async function getToken() {
    return superagent.post('https://api.bridgeapi.io/v2/authenticate')
        .set('Bridge-Version', '2021-06-01')
        .set('Content-Type', 'application/json')
        .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
        .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
        .send({email: 'john.doe@email.com', password: 'password123'});
}

async function getItem(headers) {
    return superagent.get('https://api.bridgeapi.io/v2/items')
        .set({...headers});

}

async function getAccount(headers, item_id) {
    return superagent.get('https://api.bridgeapi.io/v2/accounts?item_id=' + item_id )
        .set({...headers});

}

async function getTransaction(headers) {
    return superagent.get('https://api.bridgeapi.io/v2/transactions?limit=' + pageLimit)
        .set({...headers});
}


(async () => {
    try {
        // Get Token
        const token = await getToken();
        const {
            _body: {
                access_token,
                expires_at
            }
        } = token;

        // Headers
        const bridgeVersion = '2021-06-01';
        const clientId = '945a08c761804ac1983536463fc4a7f6';
        const clientSecret = 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD';
        const authorization = "Bearer " + access_token;

        const headers = {
            'Bridge-Version': bridgeVersion,
            'Client-Id': clientId,
            'Client-Secret': clientSecret,
            'Authorization': authorization
        }

        // Get Item
        const resItem = await getItem(headers);
        const objItemBank = resItem._body.resources;

        // Get Transactions
        const resListTransac = await getTransaction(headers);
        const objListTransac = resListTransac._body.resources;

        // Get Accounts
        const resListAccount = await getAccount(headers, objItemBank[0].id);
        const objListAccount = resListAccount._body.resources;

        const accounts = [];

        // Banking status Object
        const situation = {
            access_token: {
                value: access_token,
                expires_at: expires_at,
            },
            items: objItemBank, accounts,
            transactions: objListTransac
        };

        // Object List Account
        for (let i = 0; i < pageLimit; i++) {
            const accountObj = {
                id: objListAccount[i].id,
                name: objListAccount[i].name,
                balance: objListAccount[i].balance,
                status: objListAccount[i].status,
                status_code_info: objListAccount[i].status_code_info,
                status_code_description: objListAccount[i].status_code_description,
                updated_at: objListAccount[i].updated_at,
                type: objListAccount[i].type,
                currency_code: objListAccount[i].currency_code,
                iban: objListAccount[i].iban
            };
            accounts.push(accountObj)
        }

        // Save File
        var jsonData = JSON.stringify(situation, undefined, 4);

        fs.writeFile("situation.json", jsonData, (err) => {
            if (err)
                console.log(err);
            else {
                console.log("Fichier enregistrer avec succès\n");
            }
        });

        // Lire le fichier
        fs.readFile("situation.json", "utf8", (err, data) => {
            if (err) {
                console.log(err);
            } else {
                return console.log(data);
            }
        });

    } catch (err) {
        console.error(err);
    }
})();
