import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import * as faceapi from 'face-api.js';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit, OnDestroy, OnInit {
  video!: HTMLVideoElement;
  isEyesClosed = false;
  eyesClosedTime = 0;
  detectionInterval: any;
  EAR_THRESHOLD = 0.3; // Ajuste conforme necessário para maior precisão
  userName: string | null = null;

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  ngOnInit() {
    // Verifica se o usuário está autenticado
    this.afAuth.authState.subscribe(user => {
      if (user) {
        if (user.displayName === null) {
          this.userName = user.email;
        } else {
          this.userName = user.displayName;
        }
      } else {
        // Redireciona para a página de login se o usuário não estiver autenticado
        this.router.navigate(['/login']);
      }
    });
  }

  async ngAfterViewInit() {
    this.video = document.getElementById('videoElement') as HTMLVideoElement;

    if (!this.video) {
      console.error('Erro: elemento de vídeo não encontrado');
      return;
    }

    try {
      // Carregar modelos de forma assíncrona e paralela para otimização
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models')
      ]);
      this.startVideo();
    } catch (error) {
      console.error('Erro ao carregar os modelos:', error);
    }
  }

  startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.video.srcObject = stream;
        this.video.play();
        this.detectFace();
      })
      .catch(err => console.error('Erro ao acessar a webcam:', err));
  }

  async detectFace() {
    const canvas = document.getElementById('overlay') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Erro: elemento canvas não encontrado');
      return;
    }

    faceapi.matchDimensions(canvas, this.video);

    this.detectionInterval = setInterval(async () => {
      const detections = await faceapi.detectAllFaces(
        this.video,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (detections.length > 0) {
        const resizedDetections = faceapi.resizeResults(detections, {
          width: this.video.videoWidth,
          height: this.video.videoHeight
        });

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        this.evaluateEyeStatus(resizedDetections[0].landmarks);
      } else {
        this.updateStatus('Buscando face', 'white');
      }
    }, 150); // Redução no intervalo para balancear precisão e performance
  }

  evaluateEyeStatus(landmarks: faceapi.FaceLandmarks68) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const isClosed = this.checkIfEyesClosed(leftEye, rightEye);
    const statusElement = document.getElementById('status');

    if (statusElement) {
      if (isClosed) {
        statusElement.textContent = 'Status: Olhos fechados';
        statusElement.style.color = 'red';
        if (!this.isEyesClosed) {
          this.isEyesClosed = true;
          this.eyesClosedTime = Date.now();
        } else if (Date.now() - this.eyesClosedTime > 4000) {
          this.emitSound();
        }
      } else {
        statusElement.textContent = 'Status: Olhos abertos';
        statusElement.style.color = 'green';
        this.isEyesClosed = false;
        this.eyesClosedTime = 0;
      }
    }
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
    const averageEAR = (leftEAR + rightEAR) / 2;

    // Ajuste do limiar para diferentes condições de iluminação e tipos de rosto
    return averageEAR < this.EAR_THRESHOLD;
  }

  emitSound() {
    const audio = new Audio('../../assets/alert.mp3');
    audio.play();
  }

  ngOnDestroy() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
  }

  updateStatus(message: string, color: string) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.style.color = color;
    }
  }

  async logout() {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/login']); // Redireciona para a página de login após o logout
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  }
}
