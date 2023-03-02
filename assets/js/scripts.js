class Translator {
    constructor() {
        this.language = null;
        this.dictionary = null;
        this.requestPath = null;

        this.defaultLangPath = './assets/var/';
        this.translateAttribute = 'data-translate';
    }

    initTranslate(lang, callback = null) {
        this.language = lang;
        this.dictionary = null;
        this.requestPath = this.defaultLangPath + 'translate-' + this.language + '.json';

        this.requestToTranslate(callback);
    }

    translatePage() {
        let translateElements = document.querySelectorAll('[' + this.translateAttribute + ']');

        if (!translateElements)
            return;

        translateElements.forEach(el => {
            el.innerHTML = this.translate(el.getAttribute(this.translateAttribute));
        });
    }

    translate(translateKey) {
        this.throwIfNotInit();

        return (typeof this.dictionary[translateKey] === 'undefined' ? translateKey : this.dictionary[translateKey]);
    }



    requestToTranslate(callback) {

        this.dictionary = {};

        this.throwIfNotInit();


        fetch(this.requestPath).then((response) => {
            if (response.ok) {
                response.json().then((resp) => {
                    this.dictionary = resp;
                    if (typeof callback === 'function')
                        callback(this.dictionary);
                });
            } else {
                this.dictionary = null;
                this.requestPath = null;
                throw ('Dictionary for "' + this.language + "' not found");
            }
        });
    }

    throwIfNotInit() {
        if (this.dictionary === null || this.requestPath === null)
            throw ('Do make call "Translator.initTranslate(lang)" for set translate dictionary');
    }
}

class ContentAnimation {
    constructor() {
    }

    getLineFillProc(element) {
        let proc = (!element.getAttribute('data-fill') ? '0' : element.getAttribute('data-fill')).replace('%', '');
        return Math.abs(100 - parseInt(proc)).toString() + '%';
    }

    fillSkillLines(timeout = 300) {
        let lines = document.querySelectorAll('.skills__box .skills__it-stacks .fill-line');

        if (!lines.length)
            return;

        lines.forEach(line => {
            setTimeout(() => {
                line.style.right = this.getLineFillProc(line);
            }, timeout);
        });
    }

    animateInElement(element) {
        element.style.transform = 'scale(.8)';
        element.style.opacity = 0;
        setTimeout(() => {
            element.style.transition = '.4s cubic-bezier(.46, 0, 0, 1.17)';
            element.style.transform = 'scale(1)';
            element.style.opacity = 1;
        }, 100);
    }

    animateContent() {
        let timeOutTick = Math.round(400 / document.querySelectorAll('.resume__box').length);
        let timeOut = 0;

        document.querySelectorAll('.resume__box').forEach(el => {
            setTimeout(() => {
                this.animateInElement(el);
            }, timeOut);
            timeOut += timeOutTick;
        });

        timeOut = Math.round(400 / document.querySelectorAll('.skills__box').length);
        document.querySelectorAll('.skills__box').forEach(el => {
            timeOut += timeOutTick;
            setTimeout(() => {
                this.animateInElement(el);
            }, timeOut);
        });

        return timeOut;
    }

}

class Attentions {

    constructor() {
        this.lastrAttention = null;
        this.lastCall = null;
    }

    init() {
        this.elements = document.querySelectorAll('[data-attention]');

        if (!this.elements)
            return;


        this.elements.forEach(el => {
            el.addEventListener('mouseover', () => {
                this.attentionShow(el);
            });

            el.addEventListener("touchstart", () => {
                this.attentionShow(el);
            }, true);
        });
    }

    hideAllAttentions() {
        document.querySelector('#attentions-container').childNodes.forEach(el => {
            if (typeof el.style === 'undefined' || el.style.display === 'none')
                return;

            el.style.opacity = 0;

            setTimeout(() => {
                el.style.display = null;
                el.style.top = null;
                el.style.left = null;
            }, 300);

        });
    }

    attentionHide() {
        this.lastCall.removeEventListener('mouseout', this.mouseoutHandler);
        this.lastCall.removeEventListener('touchend', this.mouseoutHandler);

        this.hideAllAttentions();

    }

    attentionShow(callElement) {
        let attentionBlockElement = document.querySelector('.attention__' + callElement.getAttribute('data-attention'));

        if (attentionBlockElement.style.display === 'display')
            return;

        // this.hideAllAttentions();

        this.lastCall = callElement;


        attentionBlockElement.style.display = 'block';

        let rect = callElement.getBoundingClientRect();
        let bodyHeight = document.querySelector('body').getBoundingClientRect();
        let rect2 = attentionBlockElement.getBoundingClientRect();


        if (bodyHeight.bottom < rect.top + rect.height + rect2.height) {
            attentionBlockElement.style.top = (rect.top - rect2.height) + 'px';
        } else
            attentionBlockElement.style.top = (rect.top + rect.height) + 'px';
        attentionBlockElement.style.left = rect.left + 'px';
        attentionBlockElement.style.opacity = 1;

        setTimeout(() => {

            this.mouseoutHandler = this.attentionHide.bind(this);
            callElement.addEventListener('mouseout', this.mouseoutHandler);
            callElement.addEventListener('touchend', this.mouseoutHandler);
        }, 100);

    }
}

class SelectDropDown {
    constructor() {
        this.container = null;
        this.items = null;
        this.selectedItem = null;

        this.containerSelector = 'select-container';
    }

    dropDownRemove(e) {
        if (!this.container.classList.contains('hover'))
            return;

        if (e.target.getAttribute('id') === this.containerSelector)
            return this.container.classList.remove('hover');

        this.container.childNodes.forEach((el) => {
            if (el == e.target)
                return this.container.classList.remove('hover');
        });
    }

    dropDownClick(e) {
        this.container.classList.toggle('hover');
    }

    run(onSelectCall = null) {
        this.container = document.getElementById(this.containerSelector);

        if (!this.container)
            return;

        this.items = this.container.getElementsByTagName('ul')[0].getElementsByTagName('li');
        this.selectedItem = this.items[0];

        this.container.addEventListener('click', (e) => {
            this.dropDownClick(e);
        });
        document.querySelector('.content').addEventListener('click', (e) => {
            this.dropDownRemove(e);
        });


        let currentLang = document.documentElement.getAttribute('data-lang');

        for (let el of this.items) {
            el.addEventListener('click', () => {
                this.onSelect(el, onSelectCall);
            });

            if (currentLang == el.getAttribute('lang-selection'))
                this.onSelect(el);
        }

        this.hideSelected();
    }


    onSelect(item, onSelectCall = null) {
        this.showUnselected();
        this.selectedItem.innerHTML = item.innerHTML;
        this.selectedItem.setAttribute('lang-selection', item.getAttribute('lang-selection'));
        this.selectedItem.setAttribute('tooltip', item.getAttribute('tooltip'));
        this.hideSelected();
        this.unwrapSelector();

        if (typeof onSelectCall === 'function')
            onSelectCall(item.getAttribute('lang-selection'));

    }

    unwrapSelector() {
        this.container.style.pointerEvents = 'none';
        setTimeout(() => this.container.style.pointerEvents = 'auto', 200);
    }

    showUnselected() {
        let selectedLangCode = this.selectedItem.getAttribute('lang-selection')

        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].getAttribute('lang-selection') == selectedLangCode) {
                this.items[i].style.opacity = '1';
                this.items[i].style.display = '';
                break;
            }
        }
    }

    hideSelected() {
        let selectedLangCode = this.selectedItem.getAttribute('lang-selection');

        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].getAttribute('lang-selection') == selectedLangCode) {
                this.items[i].style.opacity = '0';
                setTimeout(() => this.items[i].style.display = 'none', 200)
                break;
            }
        }
    }
}

class LanguagePage {
    constructor() {
        this.dictionaries = (typeof dictionaries === 'undefined' ? ['RU-ru', 'EN-en'] : dictionaries);

        this.installPageLanguage();
    }

    getPageLang() {
        return localStorage.getItem('user-language');
    }

    setPageLang(lang) {
        return localStorage.setItem('user-language', lang);
    }

    changeLanguage(lang = null) {

        if (lang === null)
            lang = this.getPageLang();
        else if (this.dictionaries.indexOf(lang) === -1 || lang == this.getPageLang())
            return;

        this.setPageLang(lang);

        translator.translatePage();
        location.reload();
    }

    installPageLanguage() {
        if (!this.getPageLang())
            localStorage.setItem('user-language', this.dictionaries[0]);

        document.documentElement.setAttribute('data-lang', this.getPageLang());
    }
}



const dictionaries = ['RU-ru', 'EN-en'];
const translator = new Translator();
const contentAnimation = new ContentAnimation();
const attentions = new Attentions();
const customSelect = new SelectDropDown();
const languagePage = new LanguagePage();


const darkModeToogle = () => {

    let toggleElement = document.querySelector('#darkmode-toggle');

    if (localStorage.getItem('darkmode') == 1) 
        document.documentElement.setAttribute('data-theme', localStorage.getItem('darkmode') == 1 ? 'dark' : 'light');

    if (!toggleElement)
        return;

    toggleElement.checked = (localStorage.getItem('darkmode') == 1 ? true : false);
    toggleElement.addEventListener('change', () => {
        let trig = (toggleElement.checked + 0);

        localStorage.setItem('darkmode', trig);
        document.documentElement.setAttribute('data-theme', trig === 1 ? 'dark' : 'light');

    });
}


document.addEventListener('DOMContentLoaded', () => {
    translator.initTranslate(languagePage.getPageLang(), () => {
        attentions.init();
        customSelect.run((lang) => {
            languagePage.changeLanguage(lang)
        });
        translator.translatePage();
    });
});

let timeOut = 0;


darkModeToogle();

timeOut = contentAnimation.animateContent();

contentAnimation.fillSkillLines(timeOut);

// alert('make letter and mobile styles');