import React from 'react';
import { setLanguage } from './../../services/useTranslation';

export default function SuperFooterComponent() {

    function Language() {
        return (
            <div id='languagesetter' key='screen-languagesetter' >
                <span key='screen-en' onClick={()=>setLanguage('en')}>English</span>
                <span key='screen-es' onClick={()=>setLanguage('es')}>Español</span>
                <span key='screen-de' onClick={()=>setLanguage('de')}>Deutsch</span>
                <span key='screen-fr' onClick={()=>setLanguage('fr')}>Français(France)</span>
                <span key='screen-frca' onClick={()=>setLanguage('fr-ca')}>Français(Québec)</span>
                <span key='screen-it' onClick={()=>setLanguage('it')}>Italiano</span>
                <span key='screen-pt' onClick={()=>setLanguage('pt')}>Português</span>
                <span key='screen-nl' onClick={()=>setLanguage('nl')}>Nederlands</span>
                <span key='screen-jp' onClick={()=>setLanguage('jp')}>日本語</span>
                <span key='screen-tr' onClick={()=>setLanguage('tr')}>Türkçe</span>
                <span key='screen-el' onClick={()=>setLanguage('el')}>Ελληνικά</span>
                <span key='screen-fa' onClick={()=>setLanguage('fa')}>فارسی</span>
                <span key='screen-ar' onClick={()=>setLanguage('ar')}>لغةعربي</span>
                <span key='screen-zh' onClick={()=>setLanguage('zh')}>中文(简体)</span>
                <span key='screen-he' onClick={()=>setLanguage('he')}>עברית</span>
            </div>
        );
    }
    return <>
        <Language />
        <footer className="superfooter" id="superfooter">
            <div>YGOPro Salvation Server is not affiliated with Konami, NAS, Shueisha, or Kazuki Takahashi. YGOSalvation
                &amp;copy; 2013 - 2020. Powered by Yu - Jo Friendship and fans of Yu - Gi - Oh! worldwide. Please support the offical release.</div>
        </footer>
    </>;
}