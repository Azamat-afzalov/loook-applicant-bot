require('dotenv').config();
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');
const app = express();
const cloudinary = require('cloudinary');

const keyboard = require('./keyboards');
const kb = require('./keyboardButtons');
const texts = require('./texts');
const constants = require('./constants');

app.use(express.json());

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
let config ;
if(process.env.NODE_ENV === 'production') {
  config = {
    webHook : {
      port : process.env.PORT || 4040
    }
  }
} else {
  config = {
    polling : true
  }
}

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN,config);

if(process.env.NODE_ENV === 'production') {
  const url = 'https://loook-applicant-bot.herokuapp.com';
  bot.setWebHook(`${url}/bot${process.env.TELEGRAM_TOKEN}`);
}


let lang='uz';
const answerCallbacks = {};
const questions = [
  //fullName
  {
    uz: "Familiya, ism, sharifingizni quyidagi ko'rinishda kiriting: ➡️ \nMurodov Sardor Bahrom o'g'li",
    ru: 'Фамилия Имя Отчество',
    label: 'fullName',
    createOptions : () => ({
      // reply_markup : {
      //   keyboard : [
      //     // [kb.cancel.uz.cancel]
      //   ],
      //   resize_keyboard : true
      // }
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
  //birthDate
  {
    uz: "Tug'ilgan sanangizni quyidagi ko'rinishda kiriting: ➡️ 1992.03.22",
    ru: 'Дата рождение в виде (год-месяц-день).Например: 1992-03-22',
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
      uz : "Tug'ilgan sana (yil-kun-oy) ko'rinishida bo'lishi kerak",
      ru: 'Дата рождение должен быть в виде (год-месяц-день)'
    }
  },
  //phone
  {
    uz: "📱Telefon nomeringizni quyidagi ko'rinishda kiriting: ➡️ \n974342121",
    ru: 'Введите номер телефона в формате 901234567',
    label : 'phoneNumber',
    createOptions : () => ({}),
    validate : (value) =>  (value.length === 9),
    validationMessage : {
      uz : "Telefon raqamingiz 901234567 ko\'rinishida bo'lishi kerak",
      ru: 'Номер телефона должен быть в формате 901234567'
    }
  },
  //education
  {
    uz: "🎓 Ma'lumotingizni tanlang 👇",
    ru: 'Образование',
    label: 'education',
    options :{
      reply_markup: {
        keyboard : constants.education.map(br => {
          return  [
            {
              text : br[lang],
              callback_data: JSON.stringify({
                id: br.value,
                name: 'education'
              })
            }
          ]
        }),
        
      }
    },
    createOptions : () => ({
      reply_markup: {
        keyboard : constants.education.map(br => {
          return  [
            {
              text : br[lang],
              callback_data: JSON.stringify({
                id: br.value,
                name: 'education'
              })
            }
          ]
        }),
        remove_keyboard : true,
        one_time_keyboard : true,
        resize_keyboard : true
      }
    }),
    validate: (value) => {
      let isEducation = false; // check if value is real branch 
      constants.education.forEach(edu => {
        if(edu[lang] === value) {
          isEducation = true
        }
      })
      return isEducation;
    },
    validationMessage : {
      ru : "Неправильный вариант",
      uz : "Noto'g'ri variant"
    }
  },
  //address
  {
    uz: "📍Hozirgi yashash manzilingizni quyidagi ko'rinishda kiriting: ➡️ \nToshkent, Uch tepa tuman, Botu 4, 25 uy",
    ru: 'Введите адрес',
    label : 'address',
    createOptions : () => ({}),
    validate : (value) =>  true,
    validationMessage : {
      uz : "",
      ru: ''
    }
  },
  //languages
  {
    uz: "🇺🇿 Qaysi tillarni bilishingizni quyidagi ko'rinishda kiriting: ➡️\n O'zbek, Rus, Ingliz",
    ru: 'Какие языки знаете?',
    label : 'languages',
    createOptions : () => ({}),
    validate : (value) =>  true,
    validationMessage : {
      uz : "",
      ru: ''
    }
  },
  //branch
  {
    uz: "🏪 Qaysi filialimizda ishlash sizga qulay? Tanlang 👇",
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
  //position
  {
    uz: "Pozitsiyani tanlang👇",
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
        }),
        resize_keyboard : true
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
  //shift
  {
    uz: "🕖 Ish vaqtini tanlang 👇",
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
  //salary
  {
    uz: "💴 Bizning korxonamizdan qancha maosh kutyapsiz? Tanlang 👇",
    ru: 'Какое зарплату ожидаете от нас?',
    label: 'salary',
    options :{
      reply_markup: {
        keyboard : constants.salary.map(br => {
          return  [
            {
              text : br[lang],
              callback_data: JSON.stringify({
                id: br.value,
                name: 'salary'
              })
            }
          ]
        }),
        resize_keyboard : true,
      }
    },
    createOptions : () => ({
      reply_markup: {
        keyboard : constants.salary.map(br => {
          return  [
            {
              text : br[lang],
              callback_data: JSON.stringify({
                id: br.value,
                name: 'salary'
              })
            }
          ]
        })
        
      }
    }),
    validate: (value) => {
      let isSalary = false; // check if value is real branch 
      constants.salary.forEach(val => {
        if(val[lang] === value) {
          isSalary = true;
        }
      })
      return isSalary;
    },
    validationMessage : {
      ru : "Неправильный вариант",
      uz : "Noto'g'ri variant"
    }
  },
  //photo
  {
    uz: "📸 O'zingizni suratingizni selfi qilib jo'nating",
    ru: 'Отправляйте свою фотографию в виде селфи.',
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
  console.log(msg.text);
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
  
  const branch_id = constants.branches.find(b => b[lang] === getAnswer('branch'))?.value;
  const [last_name, first_name, ...middle_name] = getAnswer('fullName')?.split(' ');
  const shift = constants.shifts.find(sh => sh[lang] === getAnswer('shift'))?.value;
  const position = constants.positions.find(sh => sh[lang] === getAnswer('position'))?.value;
  const education = constants.education.find(sh => sh[lang] === getAnswer('education'))?.value;
  const salary = constants.salary.find(sh => sh[lang] === getAnswer('salary'))?.value;
  
  try {
    const response = await axios
      .default
      .post('https://api.sieves.uz/v1/waiter-system/create-applicant',{
        birth_date : getAnswer('birthDate'),
        branch_id,
        company_id: 1,
        first_name,
        last_name,
        middle_name: middle_name.join(' '),
        phone : getAnswer('phoneNumber'),
        photo : getAnswer('photo'),
        education,
        languages: getAnswer('languages'),
        salary,
        position,
        shift,
        address : getAnswer('address'),
        status : 'NEW',
        deleted : 0
      });
    console.log(response.data);
    answers = [];
    bot.sendMessage(chatId, texts.successfulRegister[lang], {
      reply_markup : {
        keyboard : keyboard.application[lang],
          resize_keyboard : true,
          remove_keyboard : true,
          one_time_keyboard : true
      }
    });
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId,texts.errorMessage[lang]);
  }
});
