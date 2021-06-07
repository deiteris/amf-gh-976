const amf = require('amf-client-js');
const path = require('path');
const fs = require('fs-extra')

amf.plugins.document.WebApi.register();
amf.plugins.document.Vocabularies.register();
amf.plugins.features.AMFCustomValidation.register();

async function parseApi(data) {
    const sourceFile = data.source;
    const type = data.from.type;
    const contentType = data.from.contentType;

    await amf.AMF.init();
    const parser = amf.Core.parser(type, contentType);
    let model = await parser.parseFileAsync(`file://${sourceFile}`);

    model = amf.Core.resolver(type).resolve(model, "editing");

    const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
    const opts = amf.render.RenderOptions().withoutSourceMaps.withCompactUris.withoutPrettyPrint;
    const parsedModel = await generator.generateString(model, opts);
    await fs.writeFile(path.join(__dirname, 'graph.json'), JSON.stringify(JSON.parse(parsedModel), null, 2))
}

parseApi({
    source: path.join(__dirname, 'extension-api.raml'),
    from: {
        type: 'RAML 1.0',
        contentType: 'application/raml'
    }
}).catch(e => console.log(e))