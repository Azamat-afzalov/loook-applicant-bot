const kb = require('./keyboardButtons');
module.exports = {
  home : [
    [
      {
        text : kb.home.uz
      },
      {
        text : kb.home.ru
      }
    ]
  ],
  application : {
    uz : [
      [
        {
          text : kb.application.uz.apply
        }
      ],
      [
        {
          text : kb.application.uz.goBack
        }
      ]
    ],
    ru : [
      [
        {
          text: kb.application.ru.apply
        }
      ],
      [
        {
          text: kb.application.ru.goBack
        }
      ]
    ]
  }
}
  
  