class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        //this.translations = {};  // json
	this.translations = window.translations;  // non-json
        this.observers = [];
    }

    async init() {
        // 1. 检测首选语言
        const savedLang = localStorage.getItem('preferredLanguage');
        const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
        const defaultLang = savedLang || browserLang;
        
        // 2. 预加载默认语言
        //await this.loadLanguage(defaultLang); // json
        
        // 3. 应用语言
        await this.applyLanguage(defaultLang);

        console.log(defaultLang);
	
        // 4. 设置语言切换事件
        this.setupLanguageSwitcher();
    }

    async loadLanguage(lang) {
        if (this.translations[lang]) return true;
        
        try {
            const response = await fetch(`assets/locales/${lang}.json`);
            this.translations[lang] = await response.json();
            return true;
        } catch (error) {
            console.error(`Failed to load language: ${lang}`, error);
            return false;
        }
    }

    async applyLanguage(lang) {

        //if (!this.translations[lang]) {
        //const loaded = await this.loadLanguage(lang);
        //if (!loaded) return false;
	//}
        
        // 更新UI状态
        this.currentLanguage = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        // 更新语言切换按钮状态
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // 翻译所有元素
        this.translateAll();
        
        // 通知观察者
        this.notifyObservers(lang);
        
        return true;
    }

    translateAll() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const keys = element.getAttribute('data-i18n').split('.');

	    //console.log(keys);
	    //console.log("Translations loaded!", window.translations);
	    
            let translation = this.translations[this.currentLanguage];
            
            for (const key of keys) {
                translation = translation?.[key];
                if (translation === undefined) break;
            }
            
            if (translation !== undefined) {
                if (element.tagName === 'INPUT' && element.type !== 'button') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    setupLanguageSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyLanguage(btn.dataset.lang);
            });
        });
    }

    addObserver(callback) {
        this.observers.push(callback);
    }

    notifyObservers(lang) {
        this.observers.forEach(callback => callback(lang));
    }
}

// 初始化多语言管理器
const i18n = new I18nManager();
document.addEventListener('DOMContentLoaded', () => i18n.init());

// 暴露到全局
window.i18n = i18n;
