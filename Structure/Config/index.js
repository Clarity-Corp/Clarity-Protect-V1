module.exports = {
    bot: {
        token:  'YOUR_BOT_TOKEN',
        prefix:  '+',
        buyer:  '1072553881134972970',
        footer: {
            text: 'ζ͜͡Clarity',
            iconUrl: 'https://cdn.discordapp.com/attachments/1177548844569985125/1224422270676631632/Logo_Clarity-V2.png?ex=66cacc59&is=66c97ad9&hm=8d4d99a64d16fab3988701920ffb8c34c9bcae0048dfca53e7c9335ce28c921e&',
        },
        thumbnail: {
            url: 'https://cdn.discordapp.com/attachments/1177548844569985125/1224422270676631632/Logo_Clarity-V2.png?ex=66cacc59&is=66c97ad9&hm=8d4d99a64d16fab3988701920ffb8c34c9bcae0048dfca53e7c9335ce28c921e&',
        },
        command: {
            type: 'prefix'
        }
    },
    database: {
        dialect: 'sqlite',
        Sqlite: {
            storage: './database.sqlite',
        }
    },
    clarity: {
        ownerClari: ["1072553881134972970", "504937332907048970","1237892416430932030",'378594821721554947', '1070807183152910366', "768973720201986069", "1212970751813226517", "226017895963033601"],
        respClari: ["1114616280138395738",  "235744457264332800", "1236293659503366158"],
        marketClari: [],
        designClari: ["993629285325733971", "1236293659503366158"],
        modClari: ["988027353785585686", "1153419554941325363", "309731008108822528", "1131254641645060157", "688849535711445056"],
        devs: ["1072553881134972970", "378594821721554947"],
        techClari: ["1176746296904798253"]
    },
      api_key: {
        google_api: "YOUR_GOOGLE_API_KEY"
    },
    protect: {
       toxicity_discovery: "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1"
    },
    support: 'https://discord.gg/8RWmR5M9Ub'
}
