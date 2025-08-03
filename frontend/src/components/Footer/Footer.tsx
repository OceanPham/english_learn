import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.leftSection}>
          <div className={styles.logo}>BandBoost ✨</div>
          <p className={styles.description}>
            BandBoost is a versatile AI-powered service helping people learn & write in a second language.
          </p>
          <button className={styles.liveChatButton}>🗨️ Live Chat</button>
        </div>
        <div className={styles.centerSection}>
          <a href="#" className={styles.link}>Privacy Policy</a>
          <a href="#" className={styles.link}>Terms of Service</a>
          <div className={styles.socialIcons}>
            {/* Placeholder for social icons */}
            <span>FB</span> <span>YT</span> <span>IG</span> <span>TT</span>
          </div>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.supportInfo}>
            <strong>Support:</strong> support@bandboost.me or <a href="#">Live chat</a>
          </div>
          <div className={styles.hours}>8:00 AM - 11:00 PM (GMT +7)</div>
          <div className={styles.copyright}>© BandBoost 2025</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 