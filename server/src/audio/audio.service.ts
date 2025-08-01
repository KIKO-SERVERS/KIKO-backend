import { Injectable, Logger } from '@nestjs/common';
import { CameraService } from '../camera/camera.service';
import { AudioStream, AudioStatus } from './interfaces/audio.interface';

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);
  private microphoneEnabled = false;
  private audioStream: AudioStream = null;
  private readonly cameraIp = '192.168.1.100'; // Замените на IP вашей камеры
  private readonly credentials = 'admin:123456'; // Замените на реальные credentials

  constructor(private readonly cameraService: CameraService) {}

  async getAudioStream(): Promise<AudioStream> {
    if (!this.microphoneEnabled) {
      throw new Error('Microphone is disabled');
    }

    if (!this.audioStream) {
      this.audioStream = await this.cameraService.getAudioStream(
        this.cameraIp,
        this.credentials,
      );
    }

    return this.audioStream;
  }

  async enableMicrophone(): Promise<AudioStatus> {
    this.microphoneEnabled = true;
    this.logger.log('Microphone enabled');
    return this.getStatus();
  }

  async disableMicrophone(): Promise<AudioStatus> {
    this.microphoneEnabled = false;
    if (this.audioStream) {
      await this.cameraService.stopAudioStream();
      this.audioStream = null;
    }
    this.logger.log('Microphone disabled');
    return this.getStatus();
  }

  async getStatus(): Promise<AudioStatus> {
    return {
      enabled: this.microphoneEnabled,
      lastActivity: new Date(),
      streamActive: !!this.audioStream,
    };
  }
}
