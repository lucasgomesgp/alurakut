import { SiteClient } from "datocms-client";

export default async function receiveRequests(request, response) {
    if (request.method === 'POST') {

        const TOKEN = '08f8d41bc9382558b3bea64c549a5a';

        const client = new SiteClient(TOKEN);

        const record = await client.items.create({
            itemType: "977392", //ID do Model de comunidades criado pelo Dato
            ...request.body,
        });

        console.log(TOKEN);
        response.json({
            dados: 'Algum dado qualquer',
            record: record,
        });
        return;
    }
    response.status(404).json({
        message: 'Ainda não temos nada no GET, mas no POST tem!',
    })
}