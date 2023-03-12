import TelegramApi from 'node-telegram-bot-api';
import Fetch from 'node-fetch';

const token = '5727566137:AAHO43LNq7ePTz2lHbtFG6P7R3bg80VPMtI';
const api = 'http://45.146.166.156:5000/';

const bot = new TelegramApi(token, { polling: true });



bot.on('message', msg => {
  const text = msg.text;
  const chatId = msg.chat.id;

  if (text === '/current_weather') {
    let weather = null;

    fetch(api)
      .then((response) => response.json())
      .then((result) => {
        if (result) {
          weather = result.list[0];
          let description = weather.weather[0].description
          description = description[0].toUpperCase() + description.slice(1)

          console.log("weather data updated")

          bot.sendMessage(chatId,
            `Температура воздуха: ${Math.round(weather.main.temp)}\u00B0\nОщущается как: ${Math.round(weather.main.feels_like)}\u00B0\n${description}`
          )
        } else {
          console.log('failed to update weather data')
          weather = 'failed to update weather data';
        }
      })
  }


})



bot.onText(/\/weather/, function (msg, match) {
  let weatherList = null;

  fetch(api)
    .then((response) => response.json())
    .then((result) => {
      if (result) {
        let dateList = [];
        weatherList = result.list;
        weatherList.forEach(weather => {
          const date = weather.dt_txt.slice(0, 10)
          if (!dateList.includes(date)) {
            dateList.push(date)
          }
        });

        let awailibleDaysButtons = []

        dateList.forEach(date => {
          awailibleDaysButtons.push(
            [{ text: date, callback_data: date }]
          )
        })

        let awailibleDays = {
          reply_markup: JSON.stringify({
            inline_keyboard: awailibleDaysButtons
          })
        }

        bot.sendMessage(msg.chat.id, 'Выберите дату:', awailibleDays);
      } else {
        console.log('failed to update weather data')
        weather = 'failed to update weather data';
      }
    })


});

bot.on("callback_query", callbackQuery => {
  console.log(callbackQuery.data)
})