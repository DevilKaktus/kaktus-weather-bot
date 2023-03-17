import TelegramApi from 'node-telegram-bot-api';
import Fetch from 'node-fetch';
import { TOKEN, API } from './config/config.js'; //config.js must contain token and link to api

const bot = new TelegramApi(TOKEN, { polling: true });

bot.onText(/\/current_weather/, msg => {
  const text = msg.text;
  const chatId = msg.chat.id;
  let weather = null;

  fetch(API)
    .then((response) => response.json())
    .then((result) => {
      if (result) {
        weather = result.list[0];
        let description = weather.weather[0].description
        description = description[0].toUpperCase() + description.slice(1)

        bot.sendMessage(chatId,
          `Погода на ${weather.dt_txt}:\nТемпература воздуха: ${Math.round(weather.main.temp)}\u00B0\nОщущается как: ${Math.round(weather.main.feels_like)}\u00B0\n${description}`
        )
      } else {
        console.log('failed to update weather data')
        weather = 'failed to update weather data';
      }
    })

})



bot.onText(/\/weather/, function (msg, match) {
  let weatherList = [];

  fetch(API)
    .then((response) => response.json())
    .then((result) => {
      if (result) {
        //make buttons from availible dates
        let dateList = [];
        const weatherList = result.list;
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
    });

});

bot.on("callback_query", (callbackQuery) => {

  const msg = callbackQuery.message;
  const callbackData = callbackQuery.data;
  let timeList = [];

  if (!callbackData.includes(":")) {
    fetch(API)
      .then((response) => response.json())
      .then((result) => {
        if (result) {
          //make buttons from availible dates
          let timeList = [];
          const weatherList = result.list;
          weatherList.forEach(weather => {
            const date = weather.dt_txt.slice(0, 10)
            const time = weather.dt_txt
            if (!timeList.includes(time) && (date === callbackData)) {

              timeList.push(time)
            }
          });

          let awailibleTimeButtons = []

          timeList.forEach(time => {

            awailibleTimeButtons.push(
              [{ text: time, callback_data: time }]
            )
          })

          let awailibleTime = {
            reply_markup: JSON.stringify({
              inline_keyboard: awailibleTimeButtons
            })
          }
          bot.sendMessage(msg.chat.id, 'Выберите время:', awailibleTime);
        } else {
          console.log('failed to update weather data')
          weather = 'failed to update weather data';
        }
      });
  } else {
    fetch(API)
      .then((response) => response.json())
      .then((result) => {
        if (result) {
          let weather = null;
          const weatherList = result.list;
          weatherList.forEach(weatherData => {
            const date = weatherData.dt_txt
            if (date === callbackData) {
              weather = weatherData
            }
          });
          if (weather) {
            let description = weather.weather[0].description
            description = description[0].toUpperCase() + description.slice(1)
            bot.sendMessage(msg.chat.id,
              `Погода на ${weather.dt_txt}:\nТемпература воздуха: ${Math.round(weather.main.temp)}\u00B0\nОщущается как: ${Math.round(weather.main.feels_like)}\u00B0\n${description}`
            )
          } else {
            bot.sendMessage(msg.chat.id, "Не найдено")
          }

        } else {
          console.log('failed to update weather data')
          weather = 'failed to update weather data';
        }
      });
  }
});