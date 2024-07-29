// 本人是一名初学者，该代码为自行编写加chatgpt修改，整体比较潦草( ´▽｀)
// 我的GitHub地址，https://github.com/MadQHawk，查找后续更新

// 默认设置
let previewSize = Keychain.contains("previewSize") ? Keychain.get("previewSize") : "Medium"
let backgroundColor = Keychain.contains("backgroundColor") ? Keychain.get("backgroundColor") : "ffffff"
let nightBackgroundColor = Keychain.contains("nightBackgroundColor") ? Keychain.get("nightBackgroundColor") : "000000"
let titleFontSize = Keychain.contains("titleFontSize") ? parseInt(Keychain.get("titleFontSize")) : 12
let textFontSize = Keychain.contains("textFontSize") ? parseInt(Keychain.get("textFontSize")) : 12
let titleFontColor = Keychain.contains("titleFontColor") ? Keychain.get("titleFontColor") : "000000"
let nightTitleFontColor = Keychain.contains("nightTitleFontColor") ? Keychain.get("nightTitleFontColor") : "ffffff"
let textFontColor = Keychain.contains("textFontColor") ? Keychain.get("textFontColor") : "000000"
let nightTextFontColor = Keychain.contains("nightTextFontColor") ? Keychain.get("nightTextFontColor") : "ffffff"
let RSSlink = Keychain.contains("RSSlink") ? Keychain.get("RSSlink") : "https://rsshub.app/apnews/topics/apf-topnews?format=json"
let newsCount = 6
let widgetTitle = Keychain.contains("widgetTitle") ? Keychain.get("widgetTitle") : "Latest News"
let translationEnabled = Keychain.contains("translationEnabled") ? Keychain.get("translationEnabled") === "true" : false
let translationApiKey = Keychain.contains("translationApiKey") ? Keychain.get("translationApiKey") : ""

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
    Keychain.set("previewSize", previewSize)
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
        Keychain.set("widgetTitle", widgetTitle)
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
        Keychain.set("backgroundColor", backgroundColor)
        Keychain.set("nightBackgroundColor", nightBackgroundColor)
        settingsChanged = true
      }
    }
  
    if (!isCancelled && settingsResponse === 2) {
      // 文字大小
      let SizeAlert = new Alert()
      SizeAlert.title = "文字大小"
      SizeAlert.message = "第一项为标题大小\n第二项为正文大小"
      SizeAlert.addTextField("Title Font Size", String(titleFontSize))
      SizeAlert.addTextField("Title Font Size", String(textFontSize))
      SizeAlert.addAction("确定")
      SizeAlert.addCancelAction("取消")
      let SizeResponse = await SizeAlert.presentAlert()
      if (SizeResponse === -1) {
        isCancelled = true
      } else {
        titleFontSize = parseInt(SizeAlert.textFieldValue(0))
        textFontSize = parseInt(SizeAlert.textFieldValue(1))
        Keychain.set("titleFontSize", String(titleFontSize))
        Keychain.set("textFontSize", String(textFontSize))
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
        Keychain.set("titleFontColor", titleFontColor)
        Keychain.set("nightTitleFontColor", nightTitleFontColor)
        textFontColor = ColorAlert.textFieldValue(3)
        nightTextFontColor = ColorAlert.textFieldValue(4)
        Keychain.set("textFontColor", textFontColor)
        Keychain.set("nightTextFontColor", nightTextFontColor)
        settingsChanged = true
      }
    }
  
    if (!isCancelled && settingsResponse === 4) {
    // 订阅
      let RSSlinkAlert = new Alert()
      RSSlinkAlert.message = "输入Json格式的订阅链接，链接推荐从rsshub获取"
      RSSlinkAlert.title = "RSS链接"
      RSSlinkAlert.addTextField("Json格式", RSSlink)
      RSSlinkAlert.addAction("确定")
      RSSlinkAlert.addCancelAction("取消")
      let RSSlinkResponse = await RSSlinkAlert.presentAlert()
      if (RSSlinkResponse === -1) {
        isCancelled = true
      } else {
        RSSlink = RSSlinkAlert.textFieldValue(0)
        Keychain.set("RSSlink", RSSlink)
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
          Keychain.set("translationApiKey", translationApiKey)
          translationEnabled = true
          Keychain.set("translationEnabled", "true")
          settingsChanged = true
        }
      } else if (translationResponse === 1) {
        // 禁用翻译
        translationEnabled = false
        Keychain.set("translationEnabled", "false")
        settingsChanged = true
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

Script.complete()

async function createWidget(items) {
  let widget = new ListWidget()
  
  // 根据当前系统外观确定合适的背景颜色
  const isDarkMode = Device.isUsingDarkAppearance()
  widget.backgroundColor = new Color(isDarkMode ? `#${nightBackgroundColor}` : `#${backgroundColor}`)

  // 添加自定义标题
  let titleElement = widget.addText(widgetTitle)
  titleElement.font = Font.boldSystemFont(titleFontSize)
  titleElement.textColor = new Color(isDarkMode ? `#${nightTitleFontColor}` : `#${titleFontColor}`)
  titleElement.leftAlignText()
  widget.addSpacer(10)

  for (let i = 0; i < items.length; i++) {
    let item = items[i]
    let title = decode(item.title)
    let newsElement = widget.addText(`${i + 1}. ${title}`)
    newsElement.font = Font.systemFont(textFontSize)
    newsElement.textColor = new Color(isDarkMode ? `#${nightTextFontColor}` : `#${textFontColor}`)
    newsElement.minimumScaleFactor = 0.75
    newsElement.url = item.url

    if (i < items.length - 1) {
      widget.addSpacer(8)
    }
  }

  return widget
}

async function loadItems() {
  let url = RSSlink
  let req = new Request(url)
  let json = await req.loadJSON()
  return json.items
}

function decode(text) {
  let parser = new HTMLParser()
  return parser.htmlDecode(text)
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
}
