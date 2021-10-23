require('dotenv').config()
const express = require('express')
const app = express()
app.use('/user', (req, res, next) => {
	return res.status(200).json('ukinam')
})

const prefix = process.env.PREFIX
const { Client } = require('discord.js')
const { Player } = require('discord-player')

const client = new Client({
  restTimeOffset: 0,
  shards: 'auto',
  intents: 641,
});

const player = new Player(client, {
	leaveOnEnd: true,
	leaveOnStop: true,
	leaveOnEmpty: true,
	leaveOnEmptyCooldown: 5000,
	autoSelfDeaf: true,
	initialVolume: 50,
	bufferingTimeout: 3000,
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('messageCreate', async message => {
	try {
		const messageContent = message.content
		if (
			!messageContent.startsWith(prefix) ||
			message.author.bot ||
			!message.guild
		) { return }
	
		const args = message.content.slice(prefix.length).split(/ +/)
		const command = args[1] || ''
		const commandParams = args[2] || ''
	
		if(command === ''){ 
			message.channel.send('🍆 | oten haha')
		}
	
		if (command === 'play') {
			let voiceChannel = message.member.voice.channel;
			if (!voiceChannel) {
				return message.reply(`🍆 | Please join a voice channel`)
			}
	
			if (!commandParams) {
				return message.reply(`🍆 | Please send a song name or a link`)
			}
	
			let queue = player.createQueue(message.guild.id, {
				metadata: {
					channel: message.channel,
				},
			})
	
			// verify vc connection
			try {
				if (!queue.connection) await queue.connect(voiceChannel);
			} catch (error) {
				console.log('error', error)
				queue.destroy();
				return await message.reply({
					content: '🍆 | Could not join your voice channel!',
					ephemeral: true,
				});
			}
	
			let song = await player
				.search(commandParams, {
					requestedBy: message.author,
				})
				.then((x) => x.tracks[0])
	
			if (!song) {
				return message.reply(`🍆 | I cant Find \`${commandParams}\` `)
			}
	
			queue.play(song)
			message.channel.send({ content: `🍆 | Now Playing **${song.title}**!` })
		}
	
		if (command === 'skip') {
			let queue = player.getQueue(message.guild.id)
			queue.skip()
			message.channel.send(`🍆 | Song Skiped`)
		}
	
		if (command === 'stop') {
			let queue = player.getQueue(message.guild.id)
			queue.stop()
			message.channel.send(`🍆 | Song Stoped`)
		}
	
		if (command === 'loop') {
			let queue = player.getQueue(message.guild.id)
			queue.setRepeatMode(queue)
			message.channel.send(`🍆 | Song Looped`)
		}
	
		if (command === 'pause') {
			let queue = player.getQueue(message.guild.id)
			queue.setPaused(true)
			message.channel.send(`🍆 | Song Paused`)
		}
		
		if (command === 'resume') {
			let queue = player.getQueue(message.guild.id)
			queue.setPaused(false)
			message.channel.send(`🍆 | Song Resumed`)
		}
	
		if (command === 'volume') {
			let queue = player.getQueue(message.guild.id)
			let amount = parseInt(args[0])
			queue.setVolume(amount)
			message.channel.send(`🍆 | Volume Set to \`${amount}\``)
		}
	} catch (error) {
		message.channel.send({ content: `🍆 | Awwie Error: '${error}'` })
	}
})

client.login(process.env.DISCORD_TOKEN)