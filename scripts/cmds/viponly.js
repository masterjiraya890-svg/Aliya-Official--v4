const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
  config: {
    name: "viponly",
    aliases: ["vipon", "onlyvip"],
    version: "1.0",
    author: "NTKhang | Saimx69x",
    countDown: 5,
    role: 3,
    description: {
      vi: "Bật/tắt chế độ chỉ VIP user mới có thể sử dụng bot",
      en: "Turn on/off only VIP users can use bot"
    },
    category: "owner",
    guide: {
      vi: "   {pn} [on | off]: Bật/tắt chế độ chỉ VIP mới có thể sử dụng bot"
        + "\n   {pn} noti [on | off]: Bật/tắt thông báo khi người dùng không phải VIP sử dụng bot",
      en: "   {pn} [on | off]: Turn on/off the mode only VIP can use bot"
        + "\n   {pn} noti [on | off]: Turn on/off the notification when user is not VIP use bot"
    }
  },

  langs: {
    vi: {
      turnedOn: "Đã bật chế độ chỉ VIP mới có thể sử dụng bot",
      turnedOff: "Đã tắt chế độ chỉ VIP mới có thể sử dụng bot",
      turnedOnNoti: "Đã bật thông báo khi người dùng không phải VIP sử dụng bot",
      turnedOffNoti: "Đã tắt thông báo khi người dùng không phải VIP sử dụng bot"
    },
    en: {
      turnedOn: "Turned on the mode only VIP can use bot",
      turnedOff: "Turned off the mode only VIP can use bot",
      turnedOnNoti: "Turned on the notification when user is not VIP use bot",
      turnedOffNoti: "Turned off the notification when user is not VIP use bot"
    }
  },

  onStart: function ({ args, message, getLang }) {
    let isSetNoti = false;
    let value;
    let indexGetVal = 0;

    if (args[0] == "noti") {
      isSetNoti = true;
      indexGetVal = 1;
    }

    if (args[indexGetVal] == "on")
      value = true;
    else if (args[indexGetVal] == "off")
      value = false;
    else
      return message.SyntaxError();

    if (isSetNoti) {
      config.hideNotiMessage.vipOnly = !value;
      message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
    }
    else {
      config.vipOnly.enable = value;
      message.reply(getLang(value ? "turnedOn" : "turnedOff"));
    }

    fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
  }
};
