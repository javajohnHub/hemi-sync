import { Component } from '@angular/core';

@Component({
  selector: 'app-oscillator',
  template: `<label for="leftFreq">Left Frequency</label>
    <p-knob
      [(ngModel)]="leftFreq"
      [min]="10"
      [max]="100"
      [strokeWidth]="5"
      [disabled]="isDisabled"
    ></p-knob>
    <label for="rightFreq">Right Frequency</label>
    <p-knob
      [(ngModel)]="rightFreq"
      [min]="10"
      [max]="100"
      [strokeWidth]="5"
      [disabled]="isDisabled"
    ></p-knob>
    <p-dropdown [options]="typeDropdown" [(ngModel)]="type"></p-dropdown>
    <p-button
      (click)="play()"
      [disabled]="isDisabled"
      label="Play"
    ></p-button>
    <p-button (click)="stop()" label="Stop" [disabled]="!isDisabled"></p-button>`,
})
export class OscillatorComponent {
  private _isLoading = false;

  leftFreq = 43;
  rightFreq = 44;
  type: OscillatorType = 'sine';
  state: any[] = [];
  typeDropdown = [
    { label: 'Sine', value: 'sine' },
    { label: 'Square', value: 'square' },
    { label: 'Sawtooth', value: 'sawtooth' },
    { label: 'Triangle', value: 'triangle' },
  ];

  play() {
    this._isLoading = true;
    this.startSounds(this.leftFreq, 0);
    this.startSounds(this.rightFreq, 1);
  }

  //channel 0 = left, channel 1 = right
  startSounds(frequency: number, channel: number) {
    const audioContext = new AudioContext();
    const gain = audioContext.createGain();

    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.type = this.type;
    oscillator.connect(gain);

    const merger = audioContext.createChannelMerger(2);
    merger.connect(audioContext.destination);
    gain.connect(merger, 0, channel);

    oscillator.start();
    this.state.push({ gain, oscillator, context: audioContext });
  }

  stop() {
    this.state.length && this.state.forEach((state) => {
      state.oscillator.stop(state.context.currentTime + 0.03);
      state.gain.gain.setValueAtTime(
        state.gain.gain.value,
        state.context.currentTime
      );

      state.gain.gain.exponentialRampToValueAtTime(
        0.0001,
        state.context.currentTime + 0.03
      );
    });
    this._isLoading = false;
    this.state = [];
  }

  get isDisabled(): boolean {
    return this._isLoading;
  }
}
