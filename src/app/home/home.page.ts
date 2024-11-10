import { Component, AfterViewInit } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  video!: HTMLVideoElement;
  isEyesClosed = false;
  eyesClosedTime = 0;
  interval: any;

  async ngAfterViewInit() {
    this.video = document.getElementById('videoElement') as HTMLVideoElement;

    if (!this.video) {
      console.error('Erro: elemento de vídeo não encontrado');
      return;
    }

    await faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models');

    this.startVideo();
  }

  startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        this.video.srcObject = stream;
        this.video.play();
        this.detectFace();
      })
      .catch(err => console.error('Erro ao acessar a webcam:', err));
  }

  async detectFace() {
    const canvas = document.getElementById('overlay') as HTMLCanvasElement | null;
    if (!canvas) {
      console.error('Erro: elemento canvas não encontrado');
      return;
    }

    faceapi.matchDimensions(canvas, this.video);

    this.interval = setInterval(async () => {
      const detections = await faceapi.detectAllFaces(
        this.video,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      const resizedDetections = faceapi.resizeResults(detections, {
        width: this.video.videoWidth,
        height: this.video.videoHeight,
      });

      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      } else {
        console.error('Erro: não foi possível obter o contexto 2D do canvas');
        return;
      }

      const statusElement = document.getElementById('status');
      if (resizedDetections.length > 0) {
        const landmarks = resizedDetections[0].landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        
        const isClosed = this.checkIfEyesClosed(leftEye, rightEye);
        if (statusElement) {
          if (isClosed) {
            statusElement.textContent = 'Status: Olhos fechados';
            statusElement.style.color = 'red';
          } else {
            statusElement.textContent = 'Status: Olhos abertos';
            statusElement.style.color = 'green';
          }
        }

        // Verifica continuamente se os olhos estão fechados
        if (isClosed) {
          if (!this.isEyesClosed) {
            this.isEyesClosed = true;
            this.eyesClosedTime = Date.now();
          } else if (Date.now() - this.eyesClosedTime > 2000) {
            // Emite som se os olhos estiverem fechados por mais de 2 segundos
            this.emitSound();
          }
        } else {
          this.isEyesClosed = false;
          this.eyesClosedTime = 0; // Reseta o tempo se os olhos estiverem abertos
        }
      } else {
        if (statusElement) {
          statusElement.textContent = 'Buscando face';
          statusElement.style.color = 'white';
        }
      }
    }, 100);
  }

  checkIfEyesClosed(leftEye: any, rightEye: any): boolean {
    const eyeAspectRatio = (eye: any) => {
      const a = Math.hypot(eye[1]._x - eye[5]._x, eye[1]._y - eye[5]._y);
      const b = Math.hypot(eye[2]._x - eye[4]._x, eye[2]._y - eye[4]._y);
      const c = Math.hypot(eye[0]._x - eye[3]._x, eye[0]._y - eye[3]._y);
      return (a + b) / (2.0 * c);
    };

    const leftEAR = eyeAspectRatio(leftEye);
    const rightEAR = eyeAspectRatio(rightEye);

    // Um limiar para olhos fechados; ajuste conforme necessário
    return (leftEAR + rightEAR) / 2 < 0.25;
  }

  emitSound() {
    const audio = new Audio('../../assets/alert.mp3');
    audio.play();
  }
}
