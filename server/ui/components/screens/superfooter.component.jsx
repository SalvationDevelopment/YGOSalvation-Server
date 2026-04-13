import React from 'react';
import styles from './superfooter.component.module.scss';

export default function SuperFooterComponent() {
    return <footer className={styles.footer} id="superfooter">
        <div>YGOPro Salvation Server is not affiliated with Konami, NAS, Shueisha, or Kazuki Takahashi. YGOSalvation
            &amp;copy; 2013 - 2020. Powered by Yu - Jo Friendship and fans of Yu - Gi - Oh! worldwide. Please support the offical release.</div>
    </footer>;
}
