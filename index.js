require('dotenv').config();
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const {PrismaClient} = require('@prisma/client');
const express = require('express');
const app = express();
app.use(express.json());

const prisma = new PrismaClient();
const cloudinary = require('cloudinary');

const keyboard = require('./keyboards');
const kb = require('./keyboardButtons');
const texts = require('./texts');
const constants = require('./constants');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});



const url = process.env.APP_URL || 'https://loook-applicant-bot.herokuapp.com:433';
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN,{
  polling:true,
  webHook : {
    port : process.env.PORT || 8080,
    host : process.env.HOST
  }
});
bot.setWebHook(`${url}/bot${process.env.TELEGRAM_TOKEN}`);


let lang='uz';
const answerCallbacks = {};
const questions = [
  {
    uz: 'Familiya ism sharifingizni kiriting',
    ru: 'Фамилия Имя Отчество',
    label: 'fullName',
    createOptions : () => ({
      reply_markup : {
        keyboard : [
          kb.cancel.uz.cancel
        ]
      }
    }),
    validate : (value) => {
      const valueArr = value.split(" ")
      if(valueArr.length < 3) {
        return false;
      }
      return true;
    },
    validationMessage : {
      uz : 'Familiya ism sharifingizni (AAA BBB CCC) ko\'rinishida bo\'lishi kerak',
      ru : 'Фамилия Имя Отчество должен быть в формате (AAA BBB CCC)'
    }
  },
  {
    uz: 'Tug\'ilgan sanangiz (yil-oy-kun) ko\'rinishida',
    ru: 'Дата рождение в виде (год-месяц-день)',
    label : 'birthDate',
    createOptions : () => ({
      keyboard : constants.cancel.map(br => {
        return  [
          {
            text : br[lang],
            callback_data: JSON.stringify({
              id: br.value,
              name: 'branch'
            })
          }
        ]
      })
    }),
    validate : (value) => {
      const valueArr = value
        .split('-')
        .map(v => Number(v))
        .filter(v => (!isNaN(v)));  
      if(valueArr.length !== 3){
        return false;
      }
      return true
    },
    validationMessage : {
      uz : "Tug'ilgan sana (kun.oy.yil) ko'rinishida bo'lishi kerak",
      ru: 'Дата рождение должен быть в виде (день.месяц.год)'
    }
  },
  {
    uz: 'Telefon raqamingizni kiriting 998901234567 ko\'rinishida',
    ru: 'Введите номер телефона в формате 998901234567',
    label : 'phoneNumber',
    createOptions : () => ({}),
    validate : (value) =>  (value.startsWith('998') && value.length === 12),
    validationMessage : {
      uz : "Telefon raqamingiz 998901234567 ko\'rinishida bo'lishi kerak",
      ru: 'Номер телефона должен быть в формате 998901234567'
    }
  },
  {
    uz: 'Manzilingizni kiriting',
    ru: 'Введите адрес',
    label : 'address',
    createOptions : () => ({}),
    validate : (value) =>  true,
    validationMessage : {
      uz : "Telefon raqamingiz 998901234567 ko\'rinishida bo'lishi kerak",
      ru: 'Номер телефона должен быть в формате 998901234567'
    }
  },
  {
    uz: 'Filialni tanlang',
    ru: 'Виберите филиал',
    label: 'branch',
    options :{
      reply_markup: {
        keyboard : constants.branches.map(br => {
          return  [
            {
              text : br[lang],
              callback_data: JSON.stringify({
                id: br.value,
                name: 'branch'
              })
            }
          ]
        })
        
      }
    },
    createOptions : () => ({
      reply_markup: {
        keyboard : constants.branches.map(br => {
          return  [
            {
              text : br[lang],
              callback_data: JSON.stringify({
                id: br.value,
                name: 'branch'
              })
            }
          ]
        })
        
      }
    }),
    validate: (value) => {
      let isBranch = false; // check if value is real branch 
      constants.branches.forEach(branch => {
        if(branch[lang] === value) {
          isBranch = true
        }
      })
      return isBranch;
    },
    validationMessage : {
      ru : "Неправильный филиал",
      uz : "Noto'g'ri filial"
    }
  },
  {
    uz: 'Pozitsiyani tanlang',
    ru: 'Выберите позицию',
    label: 'position',
    options :{
      reply_markup: {
        keyboard : constants.positions.map(position => {
          return  [
            {
              text : position[lang],
              callback_data: JSON.stringify({
                id: position.value,
                name: 'position'
              })
            }
          ]
        })
        
      }
    },
    createOptions : () => ({
      reply_markup: {
        keyboard : constants.positions.map(position => {
          return  [
            {
              text : position[lang],
              callback_data: JSON.stringify({
                id: position.value,
                name: 'position'
              })
            }
          ]
        })
        
      }
    }),
    validate: (value) => {
      let isPosition = false; // check if value is real position 
      constants.positions.forEach(position => {
        if(position[lang] === value) {
          isPosition = true;
        }
      })
      return isPosition;
    },
    validationMessage : {
      ru : "Выбрана неправильная позиция",
      uz : "Noto'g'ri pozitsiya tanlangan"
    }
  },
  {
    uz: 'Ish vaqtini tanlang',
    ru: 'Виберите время работы',
    label: 'shift',
    createOptions : () => {
      return {
        reply_markup : {
          keyboard : constants.shifts.map(shift => {
            return  [
              {
                text : shift[lang],
                callback_data: JSON.stringify({
                  id: shift.value,
                  name: 'shift'
                })
              }
            ]
          }),
          resize_keyboard : true,
      }}
    },
    options : {
      reply_markup : {
        keyboard : constants.shifts.map(shift => {
          return  [
            {
              text : shift[lang],
              callback_data: JSON.stringify({
                id: shift.value,
                name: 'shift'
              })
            }
          ]
        }),
        resize_keyboard : true,
      }
    },
    validate: (value) => {
      let isShift = false; // check if value is real branch 
      constants.shifts.forEach(shift => {
        if(shift[lang] === value) {
          isShift = true;
        }
      })
      return isShift;
    },
    validationMessage : {
      ru : "Выбран неправильная время работы",
      uz : "Noto'g'ri ish vaqti tanlangan"
    }
  },
  {
    uz: 'Rasmingizni yuboring',
    ru: 'Отправляйте свою фотографию',
    label: 'photo',
    createOptions : () => ({
      reply_markup : {
        remove_keyboard : true,
        resize_keyboard : true,
      }
    }),
    validate: (value) => {
      return true;
    },
    validationMessage : {
      ru : "",
      uz : ""
    }
  }
];
let answers = [];
let isAnswering = false;

bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Tilni tanlang\n\nВыберите языка` , {
    reply_markup : {
      resize_keyboard : true,
      keyboard : keyboard.home
    }
  })
});

bot.on('message' , async msg => {
  const chatId = msg.chat.id;
  const callback = answerCallbacks[chatId];
  if (callback) {
    delete answerCallbacks[chatId];
    return callback(msg);
  }
  switch(msg.text) {
    case kb.home.uz: 
      lang = 'uz';
      bot.sendMessage(chatId,texts.pickLanguage.uz,{
        reply_markup : {
          keyboard : keyboard.application.uz,
          resize_keyboard : true,
          remove_keyboard : true,
          one_time_keyboard : true
        }
      })
      break;
    case kb.home.ru: 
      lang = 'ru';
      bot.sendMessage(chatId,texts.pickLanguage.ru, {
        reply_markup : {
          keyboard : keyboard.application.ru,
          resize_keyboard : true,
          remove_keyboard : true,
          one_time_keyboard : true
        }
      })
      break;
    case kb.application[lang]['goBack']: 
      bot.sendMessage(chatId, texts.pickLanguage[lang], {
        reply_markup : {
          keyboard: keyboard.home,
          resize_keyboard: true
        }
      })
      break;  
    case kb.application[lang]['apply']: 
      isAnswering = true;
      for await (let question of questions) {
        const options = question.createOptions();
        let answer
        while (true) {
          answer = await askQuestion(
            chatId, 
            question[lang], 
            options
          );
          const isCorrect = question.validate(answer.text);
          if(!isCorrect) {
            bot.sendMessage(chatId,question.validationMessage[lang]);
            continue;
          }
          break;
        }
        answers.push({
          label : question.label,
          question : question[lang],
          answer : answer.text
        });
      }
    break;
  }
});
const askQuestion = async (chatId, question, options) => {  
  await bot.sendMessage(chatId, question, options)
  return new Promise(fullfill => {
    answerCallbacks[chatId] = msg => {
      if (msg.hasOwnProperty('text') && msg.text[0] !== "/") {
        fullfill(msg);
      }
      if(msg.hasOwnProperty('photo')) {
        fullfill(msg);
      }
    };
  });
};
const getAnswer = (field) => {
  return answers.find(a => a.label === field).answer;
}

bot.on('photo', async (msg) => {
  if(!isAnswering) {
    return;
  }
  const chatId = msg.chat.id;
  const photo = msg.photo[0].file_id;
  const file = await bot.getFile(photo);    
  const photoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;
  const userPhoto = await cloudinary.v2.uploader.upload(photoUrl);
  answers = answers.filter(a => a.label !== 'photo');
  answers.push({
    label : 'photo',
    question : 'photo',
    answer : userPhoto.url
  })
  
  const branch = constants.branches.find(b => b[lang] === getAnswer('branch'));
  const foundBranch = await prisma.t_branch.findFirst({
    where : {
      name : branch.value
    },
    select: {
      name : true,
      id : true
    }
  });
  const [last_name, first_name, ...middle_name] = getAnswer('fullName').split(' ');
  const shift = constants.shifts.find(sh => sh[lang] === getAnswer('shift')).value;
  const position = constants.positions.find(sh => sh[lang] === getAnswer('position')).value;
  try {
    const user = await prisma.t_applicant.create({
      data : {
        birth_date : getAnswer('birthDate'),
        branchId : foundBranch.id,
        first_name,
        last_name,
        middle_name: middle_name.join(' '),
        phone : getAnswer('phoneNumber'),
        photo : getAnswer('photo'),
        position,
        shift,
        address : getAnswer('address'),
        status : 'NEW',
        deleted : false
      }
    }); 
    answers = [];
    bot.sendMessage(chatId, texts.successfulRegister[lang]);
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId,texts.errorMessage[lang]);
  }
});




  // bot.on('callback_query', async query => {
  //   const chatId = query.message.chat.id;
  //   let data;
  //   try {
  //     data = JSON.parse(query.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   if(data.name === 'branch') {
  //     const branch = constants.branches.find(br => br.value === data.id)[lang];
  //     console.log('branch',branch);
  //     bot.answerCallbackQuery(query.id,{
  //       cache_time:0,
  //       text:branch
  //     });
  //     answers.push({
  //       question : data.name,
  //       answer : data.id
  //     });
  //     console.log('Answers', answers);
  //     const question = questions.find(question => question.label === 'position');
  //     const answer = await askQuestion(chatId,question,question.options);
  //   }
  //   //  else if(data.name === 'position') {
      
  //   // }
  // });