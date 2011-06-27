/**
 * @param {String} text Text that need to translate
 * @param {String} originLang Original language of the text
 * @param {String} targetLang In which language text would be translated
 * @param {Function} callback Callback which will be invoked when the text would be translated
 *            and this translated text will be passed as first argument of this callback
 */
window['yaTranslate'] = function(text, originLang, targetLang, callback) {
  var langs = {'en': {'ru': 1<<0}, 'ru': {'en':1<<1, 'ua':1<<2}, 'ua': {'ru':1<<3}};
  if (typeof window['console'] == 'undefined') {
    console = {warn: function() {}};
  }
  
  if (arguments.length < 4) {
    console.warn('Function yaTranslate accept 4 arguments:\
    \n1. text — Text that need to translate\
    \n2. originLang — Original language of the text\
    \n3. targetLang — In which language text would be translated\
    \n4. callback — Callback which will be invoked when the text would be translated\
 and this translated text will be passed as first argument of this callback');
    return;
  }
  
  if (!langs[originLang] || !(targetLang in langs[originLang])) {
    console.warn('Yandex Translate can not produce translation from "' + originLang + '" to "' + targetLang + '"');
    return;
  }
  
  var sentences = text.split('.'),
      translated = [],
      queryStringLimit = 2000,
      queryStringParts = [],
      offset = 0;
  
  for (var i=0, l=sentences.length; i < l; i++) {
    var sentence = encodeURIComponent(sentences[i]);
    
    if (queryStringParts[offset] && queryStringParts[offset].length >= queryStringLimit) {
      offset += 1;
    }
    
    if (!queryStringParts[offset]) {
      queryStringParts[offset] = sentence;
    }
    
    else if (queryStringParts[offset].length < queryStringLimit 
      && (queryStringParts[offset].length + (sentence.length + 1)) < queryStringLimit) {
      queryStringParts[offset] += '.' + sentence;
    }
    
    else {
      offset += 1;
      queryStringParts[offset] = '.' + sentence;
    }
  }
  
  offset = 0;
  var timestamp = (new Date).getTime();
  
  var translateText = function() {
    var scr = document.createElement('script'),
        params = [
          'callback=_tmp_translate_callback_' + timestamp,
          'lang=' + originLang + '-' + targetLang,
          'srv=tr-text',
          'id=adb7aca1-0-0',
          'text=' + queryStringParts[offset]
        ];
    scr.type = 'text/javascript';
    scr.src = 'http://translate.yandex.ru/tr.json/translate?' + params.join('&');
    document.body.appendChild(scr);
  };
  
  window['_tmp_translate_callback_' + timestamp] = function(response) {
    offset += 1;
    
    if (response) {
      translated.push(response);
    }
    
    if (queryStringParts.length == offset) {
      delete window['_tmp_translate_callback_' + timestamp];
      callback(translated.join('.'));
    }
    
    else {
      translateText();
    }
  };
  
  translateText();
};