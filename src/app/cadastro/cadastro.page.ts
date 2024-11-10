import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage implements OnInit {
  email!: string;
  password!: string;

  constructor(private afAuth: AngularFireAuth, private router: Router) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  async signup() {
    try {
      await this.afAuth.createUserWithEmailAndPassword(this.email, this.password);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao criar conta:', error);
    }
  }

}
