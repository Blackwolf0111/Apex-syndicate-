import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName("sendmsg")
    .setDescription("Send message")
    .addStringOption(o => o.setName("message").setRequired(true))
    .addChannelOption(o => o.setName("channel").setRequired(true)),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show avatar")
    .addUserOption(o => o.setName("user").setRequired(true)),

  new SlashCommandBuilder()
    .setName("fun_guess")
    .setDescription("Pick cute user")
    .addUserOption(o => o.setName("user1").setRequired(true))
    .addUserOption(o => o.setName("user2").setRequired(true)),

  new SlashCommandBuilder()
    .setName("social")
    .setDescription("Post link with role")
    .addStringOption(o => o.setName("link").setRequired(true))
    .addChannelOption(o => o.setName("channel").setRequired(true))
    .addRoleOption(o => o.setName("role").setRequired(true)),
  new SlashCommandBuilder()
    .setName("reactmsg")
    .setDescription("React to message")
    .addStringOption(o => o.setName("link").setRequired(true))
    .addStringOption(o => o.setName("emoji").setRequired(true)),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "sendmsg") {
    const msg = interaction.options.getString("message");
    const ch = interaction.options.getChannel("channel");
    await ch.send(`@everyone ${msg}`);
    await interaction.reply({ content: "Done", ephemeral: true });
  }

  if (interaction.commandName === "avatar") {
    const user = interaction.options.getUser("user");
    const url = user.displayAvatarURL({ size: 1024 });
    await interaction.reply(`Apex Image\n${url}`);
  }

  if (interaction.commandName === "fun_guess") {
    const u1 = interaction.options.getUser("user1");
    const u2 = interaction.options.getUser("user2");
    const pick = Math.random() < 0.5 ? u1 : u2;
    await interaction.reply(`<@${pick.id}> You are cute 😘`);
  }

  if (interaction.commandName === "social") {
    const link = interaction.options.getString("link");
    const ch = interaction.options.getChannel("channel");
    const role = interaction.options.getRole("role");

    await ch.send(`${link}\n\n<@&${role.id}>`);
    await interaction.reply({ content: "Posted", ephemeral: true });
  }
  if (interaction.commandName === "reactmsg") {
    const link = interaction.options.getString("link");
    const emoji = interaction.options.getString("emoji");

    const parts = link.split("/");
    const channelId = parts[5];
    const messageId = parts[6];

    const ch = await client.channels.fetch(channelId);
    const msg = await ch.messages.fetch(messageId);

    await msg.react(emoji);
    await interaction.reply({ content: "Reacted", ephemeral: true });
  }
});

client.login(TOKEN);
