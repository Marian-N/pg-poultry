import { ui } from './globals';
import theme_music from '../resources/audio/music/theme_music.mp3';
import pickup_sound from '../resources/audio/sounds/pickup.ogg';
import hatch_egg_sound from '../resources/audio/sounds/hatch_egg.ogg';
import coin_sound from '../resources/audio/sounds/coin.ogg';
import click_sound from '../resources/audio/sounds/click.ogg';

export type Audios = 'theme_music' | 'pickup' | 'hatch_egg' | 'coin' | 'click';

class AudioController {
  private _allowed: boolean;
  public audioMap: Record<Audios, HTMLAudioElement>;

  get allowed() {
    return this._allowed;
  }

  set allowed(value: boolean) {
    this._allowed = value;
    if (value) {
      this.audioMap.theme_music.play();
    } else {
      // pause all audio in audioMap
      Object.values(this.audioMap).forEach((audio) => {
        audio.pause();
      });
    }
    ui.hud.toggleAudio(value);
  }

  constructor() {
    this._allowed = false;
    this.audioMap = {
      pickup: new Audio(pickup_sound),
      theme_music: new Audio(theme_music),
      hatch_egg: new Audio(hatch_egg_sound),
      coin: new Audio(coin_sound),
      click: new Audio(click_sound)
    };
    this.setVolume();
  }

  setVolume() {
    this.audioMap.theme_music.volume = 0.2;
    this.audioMap.pickup.volume = 0.5;
    this.audioMap.hatch_egg.volume = 0.5;
    this.audioMap.coin.volume = 0.5;
    this.audioMap.click.volume = 0.8;
  }

  play(audio: Audios) {
    if (this._allowed) {
      const audioElement = this.audioMap[audio];
      audioElement.currentTime = 0;
      audioElement.play();
    }
  }

  init() {
    this.allowed = true;
    this.audioMap.theme_music.play();
  }
}

export default AudioController;
