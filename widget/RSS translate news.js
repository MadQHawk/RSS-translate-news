// 本人是一名初学者，该代码为自行编写加chatgpt修改，整体比较潦草( ´▽｀)

// 默认设置
const defaultSettings = {
  previewSize: "Large",
  backgroundColor: "ffffff", 
  nightBackgroundColor: "020202", 
  titleFontSize: "18", 
  textFontSize: "16", 
  titleFontColor: "000000", 
  nightTitleFontColor: "ffffff", 
  textFontColor: "000000", 
  nightTextFontColor: "ffffff", 
  newsRSSlink: "https://rsshub.app/apnews/topics/apf-topnews?format=json", 
  newsCount: 5, 
  widgetTitle: "news",
  translationEnabled: false, 
  translationApiKey: ""
};

// 将设置储存在keychain
let scriptName = Script.name();
let storedSettings;
try {
  let storedSettingsString = Keychain.get(scriptName);
  storedSettings = storedSettingsString ? JSON.parse(storedSettingsString) : defaultSettings;
  } catch {
    
    storedSettings = defaultSettings;
  }

// 访问存储的设置
let {
  previewSize, backgroundColor, nightBackgroundColor, titleFontSize, textFontSize, titleFontColor, nightTitleFontColor, textFontColor, nightTextFontColor, newsRSSlink, newsCount,widgetTitle,translationEnabled, translationApiKey
} = storedSettings;

// 小组件预览
let previewOptions = ["Small", "Medium", "Large"]

// 可以启用RSS翻译功能，翻译标题，调用api暂时只支持谷歌
async function translateText(text, targetLang) {
  if (!translationEnabled) {
    return text
  }
  const apiKey = translationApiKey
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`
  const body = {
    q: text,
    target: targetLang
  }
  
  const req = new Request(url)
  req.method = "POST"
  req.headers = { "Content-Type": "application/json" }
  req.body = JSON.stringify(body)
  
  const res = await req.loadJSON()
  return res.data.translations[0].translatedText
}

if (config.runsInApp) {
// 主菜单
let mainAlert = new Alert()
mainAlert.title = "主菜单"
mainAlert.addAction("预览组件")
mainAlert.addAction("设置")
mainAlert.addCancelAction("取消")

let mainResponse = await mainAlert.presentSheet()

if (mainResponse === -1) {
  return 
}

if (mainResponse === 0) {
  // 预览菜单
  let previewAlert = new Alert()
  previewAlert.title = "选择预览大小"
  for (const option of previewOptions) {
    previewAlert.addAction(option)
  }
  let previewResponse = await previewAlert.presentSheet()
  if (previewResponse !== -1) {
    previewSize = previewOptions[previewResponse]
    storedSettings.previewSize = previewSize;
    Keychain.set(scriptName, JSON.stringify(storedSettings));
  }
}

if (mainResponse === 1) {
  let settingsChanged = false
  
  while (true) {
    // 设置菜单
    let settingsAlert = new Alert()
    settingsAlert.title = "设置"
    settingsAlert.addAction("标题内容")
    settingsAlert.addAction("背景颜色")
    settingsAlert.addAction("文字大小")
    settingsAlert.addAction("文字颜色")
    settingsAlert.addAction("RSS链接")
    settingsAlert.addAction("翻译选项")
    settingsAlert.addCancelAction("确定")
    
    let settingsResponse = await settingsAlert.presentSheet()
  
    if (settingsResponse === -1) {
      return
    }

    let isCancelled = false
    
    if (settingsResponse === 0) {
      // 设置标题
      let titleAlert = new Alert()
      titleAlert.title = "设置标题"
      titleAlert.addTextField("Title", widgetTitle)
      titleAlert.addAction("确定")
      titleAlert.addCancelAction("取消")
      let titleResponse = await titleAlert.presentAlert()
      if (titleResponse === -1) {
        isCancelled = true
      } else {
        widgetTitle = titleAlert.textFieldValue(0)
        storedSettings.widgetTitle = widgetTitle;
        Keychain.set(scriptName, JSON.stringify(storedSettings));
        settingsChanged = true
      }
    }

    if (!isCancelled && settingsResponse === 1) {
      // 背景颜色
      let bgAlert = new Alert()
      bgAlert.title = "背景颜色"
      bgAlert.message = "第一项为日间模式颜色\n第二项为夜间模式颜色"
      bgAlert.addTextField("Day Background Color", backgroundColor)
      bgAlert.addTextField("Night Background Color", nightBackgroundColor)
      bgAlert.addAction("确定")
      bgAlert.addCancelAction("取消")
      let bgResponse = await bgAlert.presentAlert()
      if (bgResponse === -1) {
        isCancelled = true
      } else {
        backgroundColor = bgAlert.textFieldValue(0)
        nightBackgroundColor = bgAlert.textFieldValue(1)
        storedSettings.backgroundColor = backgroundColor;
        storedSettings.nightBackgroundColor = nightBackgroundColor;
        Keychain.set(scriptName, JSON.stringify(storedSettings));
        settingsChanged = true
      }
    }
  
    if (!isCancelled && settingsResponse === 2) {
      // 文字大小
      let SizeAlert = new Alert()
      SizeAlert.title = "文字大小"
      SizeAlert.message = "第一项为标题大小\n第二项为正文大小"
      SizeAlert.addTextField("Title Font Size", titleFontSize)
      SizeAlert.addTextField("Title Font Size", textFontSize)
      SizeAlert.addAction("确定")
      SizeAlert.addCancelAction("取消")
      let SizeResponse = await SizeAlert.presentAlert()
      if (SizeResponse === -1) {
        isCancelled = true
      } else {
        titleFontSize = SizeAlert.textFieldValue(0)
        textFontSize = SizeAlert.textFieldValue(1)
        storedSettings.titleFontSize = titleFontSize;
        storedSettings.textFontSize = textFontSize;
        Keychain.set(scriptName, JSON.stringify(storedSettings));
        settingsChanged = true
      }
    }
  
    if (!isCancelled && settingsResponse === 3) {
      // 字体颜色
      let ColorAlert = new Alert()
      ColorAlert.title = "文字颜色"
      ColorAlert.message = "第一项为标题文字日间默认的颜色\n第二项为标题文字夜间默认的颜色\n第三项为正文文字日间默认的颜色\n第四项为正文文字夜间默认的颜色"
      ColorAlert.addTextField("Day Title Font Color", titleFontColor)
      ColorAlert.addTextField("Night Title Font Color", nightTitleFontColor)
      ColorAlert.addTextField("Day Title Font Color", textFontColor)
      ColorAlert.addTextField("Night Title Font Color", nightTextFontColor)
      ColorAlert.addAction("确定")
      ColorAlert.addCancelAction("取消")
      let titleColorResponse = await ColorAlert.presentAlert()
      if (titleColorResponse === -1) {
        isCancelled = true
      } else {
        titleFontColor = ColorAlert.textFieldValue(0)
        nightTitleFontColor = ColorAlert.textFieldValue(1)
        textFontColor = ColorAlert.textFieldValue(2)
        nightTextFontColor = ColorAlert.textFieldValue(3)
        storedSettings.titleFontColor = titleFontColor;
        storedSettings.nightTitleFontColor = nightTitleFontColor;
        storedSettings.textFontColor = textFontColor;
        storedSettings.nightTextFontColor = nightTextFontColor;
        Keychain.set(scriptName, JSON.stringify(storedSettings));
        settingsChanged = true
      }
    }
  
    if (!isCancelled && settingsResponse === 4) {
    // 订阅
      let RSSlinkAlert = new Alert()
      RSSlinkAlert.message = "输入Json格式的订阅链接，链接推荐从rsshub获取"
      RSSlinkAlert.title = "RSS链接"
      RSSlinkAlert.addTextField("Json格式", newsRSSlink)
      RSSlinkAlert.addAction("确定")
      RSSlinkAlert.addCancelAction("取消")
      let RSSlinkResponse = await RSSlinkAlert.presentAlert()
      if (RSSlinkResponse === -1) {
        isCancelled = true
      } else {
        newsRSSlink = RSSlinkAlert.textFieldValue(0)
        storedSettings.newsRSSlink = newsRSSlink;
        Keychain.set(scriptName, JSON.stringify(storedSettings));
        settingsChanged = true
      }
    }

    if (!isCancelled && settingsResponse === 5) {
      // 翻译
      let translationAlert = new Alert()
      translationAlert.title = "翻译"
      translationAlert.addAction("开启翻译")
      translationAlert.addAction("关闭翻译")
      translationAlert.addCancelAction("取消")
      
      let translationResponse = await translationAlert.presentSheet()
      
      if (translationResponse === 0) {
        //开启&关闭翻译
        let enableTranslationAlert = new Alert()
        enableTranslationAlert.title = "开启翻译"
        enableTranslationAlert.message = "输入谷歌翻译api"
        enableTranslationAlert.addTextField("Translation API Key", translationApiKey)
        enableTranslationAlert.addAction("确定")
        enableTranslationAlert.addCancelAction("取消")
        let enableTranslationResponse = await enableTranslationAlert.presentAlert()
        if (enableTranslationResponse !== -1) {
          translationApiKey = enableTranslationAlert.textFieldValue(

0)
          storedSettings.translationApiKey = translationApiKey;
          translationEnabled = true
          storedSettings.translationEnabled = true;
          Keychain.set(scriptName, JSON.stringify(storedSettings));
          settingsChanged = true
        }
      } else if (translationResponse === 1) {
        // 禁用翻译
          translationEnabled = false;
          storedSettings.translationEnabled = false;
          Keychain.set(scriptName, JSON.stringify(storedSettings));
        settingsChanged = true
      }
    }
  }
 }
}

let items = await loadItems()
items = items.slice(0, newsCount)

// 翻译正文
for (let i = 0; i < items.length; i++) {
  items[i].title = await translateText(items[i].title, "zh")
}

async function createWidget(items) {
  let widget = new ListWidget()
  
  // 根据当前系统外观确定合适的背景颜色
  const isDarkMode = Device.isUsingDarkAppearance()
  widget.backgroundColor = new Color(isDarkMode ? `#${nightBackgroundColor}` : `#${backgroundColor}`)

  // 添加自定义标题
  let titleElement = widget.addText(widgetTitle)
  titleElement.font = Font.boldSystemFont(Number(titleFontSize))
  titleElement.textColor = new Color(isDarkMode ? `#${nightTitleFontColor}` : `#${titleFontColor}`)
  titleElement.leftAlignText()
  widget.addSpacer(10)

  for (let i = 0; i < items.length; i++) {
    let item = items[i]
    let title = decode(item.title)
    let newsElement = widget.addText(`${i + 1}. ${title}`)
    newsElement.font = Font.systemFont(Number(textFontSize))
    newsElement.textColor = new Color(isDarkMode ? `#${nightTextFontColor}` : `#${textFontColor}`)
    newsElement.url = item.url
      widget.addSpacer(8)
  }

    return widget
  }


async function loadItems() {
  let url = newsRSSlink
  let req = new Request(url)
  let json = await req.loadJSON()
  return json.items
}

function decode(str) {
  let regex = /&#(\d+);/g
  return str.replace(regex, (match, dec) => {
    return String.fromCharCode(dec)
  })
}

// 预览
if (config.runsInWidget) {
  let widget = await createWidget(items)
  Script.setWidget(widget)
} else if (config.runsInApp) {
  let widget = await createWidget(items)
  if (previewSize === "Small") {
    widget.presentSmall()
  } else if (previewSize === "Medium") {
    widget.presentMedium()
  } else {
    widget.presentLarge()
  }
  return
 }