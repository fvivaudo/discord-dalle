import { Category } from '@discordx/utilities'
import {ApplicationCommandOptionType, CommandInteraction, Message} from 'discord.js'
import {Client, SlashOption} from 'discordx'

import {Discord, Injectable, Slash} from '@/decorators'
import {Dalle} from "@/services";
import {Generation} from "@/entities";

function randomString(length:number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
@Discord()
@Injectable()
@Category('Dalle')
export default class Create {
    constructor(
        private dalle: Dalle
    ) {}

    @Slash({
        name: 'dalle',
        description: 'Generate pictures with your prompt, run n generations (4 pics)'
    })
    async create(
        @SlashOption({
            description: "your prompt",
            name: "prompt",
            required: true,
            type: ApplicationCommandOptionType.String,
            maxLength: 480
        })
            prompt: string,
        @SlashOption({
            description: "number of generation attempts",
            name: "n",
            required: true,
            type: ApplicationCommandOptionType.Number,
            maxValue: 10,
        })
            n: number,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        const d = new Date(Date.now())
        const dateString = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
            d.getFullYear() + "_" + ("0" + d.getHours()).slice(-2) + "-" + ("0" + d.getMinutes()).slice(-2);

        const msg = (await interaction.followUp({ content: 'Treating...', fetchReply: true })) as Message

        // const backFilledPrompt = prompt.length > 470 ? prompt : prompt.concat(" ", randomString(479 - prompt.length))
        //
        // console.log(backFilledPrompt)

        const result = await this.dalle.createManyPictures(prompt, n, interaction.user.id)
        if (!result.completed || result.urls.length === 0)
        {
            let response = '**Failure!** '+ result.error+ '\n' + prompt + '\n'
            await msg.edit(response)

        }
        else
        {
            let slicedUrls = result.urls.slice(0,4)

            let response =
                '**Success!** ' + result.urls.length + '/' + n * 4 + ' expected pictures' + '\n'
                + prompt + '\n'
                // + slicedUrls.map((pic) => pic + '\n').join('')

            await msg.edit({
                content: response,
                files: slicedUrls.map((pic, index ) => ({
                    attachment: pic,
                    name: 'gen_' + dateString + '_'+ index + '.jpg'
                }))
            })
            //Send urls bit by bit so that they all get previewed
            for (let i = 4; i < result.urls.length; i += 4)
            {
                slicedUrls = result.urls.slice(i,4+i)
                // await msg.reply(slicedUrls.map((pic) => pic + '\n').join(''))

                const arrayFiles = slicedUrls.map((pic, index ) => ({
                    attachment: pic,
                    name: 'gen_' + dateString + '_'+ (i+index) + '.jpg'
                }))
                await msg.reply({
                    files: arrayFiles,
                });
            }

            await this.dalle.createGeneration(prompt, result.urls)
        }
    }

}
