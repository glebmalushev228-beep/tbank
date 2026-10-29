import { Bot, InlineKeyboard, Keyboard } from 'grammy';

const token = process.env.BOT_TOKEN?.trim();
const webAppUrl = process.env.WEBAPP_URL?.trim();

if (!token) {
  console.error('Укажите BOT_TOKEN в файле .env');
  process.exit(1);
}

if (!webAppUrl || !/^https:\/\//i.test(webAppUrl) || webAppUrl.includes('example.com')) {
  console.error(
    'Укажите реальный HTTPS WEBAPP_URL в .env (Cloudflare Pages, Vercel или cloudflared tunnel).',
  );
  process.exit(1);
}

const bot = new Bot(token);
const openLabel = 'Открыть банк';

function webAppInlineKeyboard() {
  return new InlineKeyboard().webApp(openLabel, webAppUrl!);
}

function webAppReplyKeyboard() {
  return new Keyboard().webApp(openLabel, webAppUrl!).resized().persistent();
}

bot.command('start', async (ctx) => {
  const name = ctx.from?.first_name ? `, ${ctx.from.first_name}` : '';
  console.log(`/start from ${ctx.from?.id} ${ctx.from?.username ?? ''}`);

  // Сначала простой текст — чтобы /start не «молчал», даже если кнопка Web App упадёт.
  await ctx.reply(`Привет${name}! Бот на связи.`);

  try {
    await ctx.reply(
      'Это демо Mini App в стиле банковского приложения.\nНажмите кнопку ниже, чтобы открыть интерфейс.',
      { reply_markup: webAppInlineKeyboard() },
    );
  } catch (error) {
    console.error('Не удалось отправить кнопку Web App:', error);
    await ctx.reply(`Откройте приложение по ссылке:\n${webAppUrl}`);
    return;
  }

  try {
    await ctx.reply('Кнопка также закреплена внизу чата.', {
      reply_markup: webAppReplyKeyboard(),
    });
  } catch (error) {
    console.error('Reply-клавиатура WebApp недоступна:', error);
  }
});

bot.command('app', async (ctx) => {
  console.log(`/app from ${ctx.from?.id}`);
  await ctx.reply('Открыть демо-банк:', {
    reply_markup: webAppInlineKeyboard(),
  });
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    [
      'Команды:',
      '/start — приветствие и кнопка Mini App',
      '/app — открыть приложение',
      '/help — эта справка',
      '',
      `URL: ${webAppUrl}`,
      'Данные демо хранятся только на устройстве (localStorage).',
    ].join('\n'),
  );
});

bot.on('message', async (ctx, next) => {
  if (ctx.message.text) {
    console.log(`msg ${ctx.from?.id}: ${ctx.message.text}`);
  }
  await next();
});

bot.catch((error) => {
  console.error('Ошибка бота:', error.error);
});

async function configureMenuButton() {
  await bot.api.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: 'Банк',
      web_app: { url: webAppUrl! },
    },
  });
}

async function main() {
  await bot.api.deleteWebhook({ drop_pending_updates: false });
  await configureMenuButton();
  console.log(`Mini App URL: ${webAppUrl}`);
  console.log('Бот запущен. Откройте его в Telegram и нажмите /start');
  await bot.start({
    onStart: (info) => {
      console.log(`@${info.username} готов`);
    },
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
