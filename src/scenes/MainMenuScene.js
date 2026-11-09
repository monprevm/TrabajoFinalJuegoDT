import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { KEYS } from '../enums/keys.js';
import { EN, ES } from '../enums/languages.js';
import { FETCHING, READY } from '../enums/status.js';
import { getPhrase, getTranslations } from '../services/translations.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;
    this.input.mouse.disableContextMenu();
    this.currentLanguage = this.registry.get('language') === EN ? EN : ES;
    this.languageState = READY;

    this.add
      .tileSprite(0, 0, width, height, 'tiles', CONFIG.TILE_FRAMES.FLOOR)
      .setOrigin(0, 0);
    this.add.rectangle(0, 0, width, height, 0x000000, 0.55).setOrigin(0);
    this.startZone = this.add
      .zone(0, 0, width, height)
      .setOrigin(0)
      .setDepth(-1)
      .setInteractive();

    this.titleText = this.add
      .text(width / 2, height / 2 - 140, getPhrase(KEYS.EL_LABERINTO_MALDITO), {
        fontFamily: 'monospace',
        fontSize: '46px',
        color: '#ffd83d',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.controlsText = this.add
      .text(width / 2, height / 2 + 20, this.#getControlsText(), {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    this.promptText = this.add
      .text(
        width / 2,
        height - 90,
        getPhrase(KEYS.PRESIONA_ENTER_O_CLICK_PARA_EMPEZAR),
        {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#66ff99',
          stroke: '#000000',
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5);

    this.#createLanguageSelector(width);
    this.#updateLanguageUi();

    const start = () => {
      if (this.languageState === FETCHING) return;
      this.registry.set('level', 1);
      this.registry.set('score', 0);
      this.scene.start('GameScene');
    };
    const handleEnter = () => {
      if (this.languageMenuVisible) {
        this.#setLanguageMenuVisible(false);
        return;
      }
      start();
    };
    this.input.keyboard.on('keydown-ENTER', handleEnter);
    this.startZone.on('pointerdown', () => {
      if (this.languageState === FETCHING) return;
      if (this.languageMenuVisible) {
        this.#setLanguageMenuVisible(false);
        return;
      }
      start();
    });
  }

  #getControlsText() {
    return `${getPhrase(KEYS.CONTROLES)}\n\n${getPhrase(KEYS.WASD_MOVER)}\n${getPhrase(KEYS.CLICK_DERECHO_DISPARAR)}\n${getPhrase(KEYS.C_COMER)}`;
  }

  #refreshTexts() {
    this.titleText.setText(getPhrase(KEYS.EL_LABERINTO_MALDITO));
    this.controlsText.setText(this.#getControlsText());
    this.promptText.setText(getPhrase(KEYS.PRESIONA_ENTER_O_CLICK_PARA_EMPEZAR));
  }

  #createLanguageSelector(width) {
    const buttonWidth = 96;
    const buttonHeight = 34;
    const margin = 24;
    const buttonRight = width - margin;
    const buttonTop = margin;

    this.languageMenuVisible = false;

    this.languageButtonBg = this.add
      .rectangle(buttonRight, buttonTop, buttonWidth, buttonHeight, 0x111318, 0.86)
      .setOrigin(1, 0)
      .setStrokeStyle(2, 0x66ff99, 0.9)
      .setDepth(30)
      .setInteractive({ useHandCursor: true });
    this.languageButtonText = this.add
      .text(buttonRight - buttonWidth / 2, buttonTop + buttonHeight / 2, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#66ff99',
      })
      .setOrigin(0.5)
      .setDepth(31);

    const panelWidth = 156;
    const panelHeight = 92;
    const panelRight = buttonRight;
    const panelTop = buttonTop + buttonHeight + 8;
    const rowHeight = 32;
    const rowWidth = panelWidth - 16;
    const esRowY = panelTop + 10 + rowHeight / 2;
    const enRowY = esRowY + rowHeight;

    this.languagePanelBg = this.add
      .rectangle(panelRight, panelTop, panelWidth, panelHeight, 0x111318, 0.96)
      .setOrigin(1, 0)
      .setStrokeStyle(2, 0x66ff99, 0.6)
      .setDepth(30)
      .setVisible(false);

    this.languageEsRow = this.#createLanguageRow(
      panelRight - 8,
      esRowY,
      rowWidth,
      rowHeight,
    );
    this.languageEnRow = this.#createLanguageRow(
      panelRight - 8,
      enRowY,
      rowWidth,
      rowHeight,
    );
    this.languageEsText = this.add
      .text(panelRight - panelWidth + 16, esRowY, 'Español', {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)
      .setDepth(32)
      .setVisible(false);
    this.languageEnText = this.add
      .text(panelRight - panelWidth + 16, enRowY, 'English', {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)
      .setDepth(32)
      .setVisible(false);

    this.languageButtonBg.on('pointerdown', () => {
      if (this.languageState === FETCHING) return;
      this.#setLanguageMenuVisible(!this.languageMenuVisible);
    });
    this.languageButtonBg.on('pointerover', () => {
      if (this.languageState !== FETCHING) {
        this.languageButtonBg.setFillStyle(0x1c2230, 0.95);
      }
    });
    this.languageButtonBg.on('pointerout', () => {
      this.languageButtonBg.setFillStyle(0x111318, 0.86);
    });

    this.languageEsRow.on('pointerdown', () => this.#selectLanguage(ES));
    this.languageEnRow.on('pointerdown', () => this.#selectLanguage(EN));
    this.#bindRowHover(this.languageEsRow, this.languageEsText);
    this.#bindRowHover(this.languageEnRow, this.languageEnText);
  }

  #createLanguageRow(x, y, width, height) {
    return this.add
      .rectangle(x, y, width, height, 0xffffff, 0.001)
      .setOrigin(1, 0.5)
      .setDepth(31)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
  }

  #bindRowHover(row, text) {
    row.on('pointerover', () => {
      if (this.languageState === FETCHING) return;
      row.setFillStyle(0xffffff, 0.12);
      text.setColor('#ffd83d');
    });
    row.on('pointerout', () => {
      row.setFillStyle(0xffffff, 0.001);
      this.#updateLanguageOptionColors();
    });
  }

  #setLanguageMenuVisible(visible) {
    this.languageMenuVisible = visible;
    this.languagePanelBg.setVisible(visible);
    this.languageEsRow.setVisible(visible);
    this.languageEnRow.setVisible(visible);
    this.languageEsText.setVisible(visible);
    this.languageEnText.setVisible(visible);
    this.languageButtonBg.setStrokeStyle(2, visible ? 0xffd83d : 0x66ff99, 0.9);
    if (!visible) {
      this.languageEsRow.setFillStyle(0xffffff, 0.001);
      this.languageEnRow.setFillStyle(0xffffff, 0.001);
      this.#updateLanguageOptionColors();
    }
  }

  #updateLanguageUi() {
    const isEnglish = this.currentLanguage === EN;
    this.languageButtonText.setText(isEnglish ? 'EN ▾' : 'ES ▾');
    this.#updateLanguageOptionColors();
  }

  #updateLanguageOptionColors() {
    const isEnglish = this.currentLanguage === EN;
    this.languageEsText.setColor(isEnglish ? '#ffffff' : '#ffd83d');
    this.languageEnText.setColor(isEnglish ? '#ffd83d' : '#ffffff');
  }

  async #selectLanguage(language) {
    if (this.languageState === FETCHING) return;
    this.#setLanguageMenuVisible(false);
    if (language === this.currentLanguage) {
      this.#updateLanguageUi();
      return;
    }

    this.languageState = FETCHING;
    this.languageButtonBg.disableInteractive();
    this.languageButtonText.setText('...');

    try {
      await getTranslations(language);
      this.currentLanguage = language;
    } catch (error) {
      console.error('[Traducila] No se pudo cambiar el idioma.', error);
      try {
        await getTranslations(ES);
      } catch (fallbackError) {
        console.error('[Traducila] No se pudo restaurar el español.', fallbackError);
      }
      this.currentLanguage = ES;
    } finally {
      this.registry.set('language', this.currentLanguage);
      this.languageState = READY;
      this.languageButtonBg.setInteractive({ useHandCursor: true });
      this.languageButtonBg.setFillStyle(0x111318, 0.86);
      this.#refreshTexts();
      this.#updateLanguageUi();
    }
  }
}
