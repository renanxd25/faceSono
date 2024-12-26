import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-semconexaocomservidor',
  templateUrl: './semconexaocomservidor.page.html',
  styleUrls: ['./semconexaocomservidor.page.scss'],
})
export class SemconexaocomservidorPage implements OnInit {

  retryConnection() {
    console.log('Tentando reconectar...');
    // Adicione aqui a lógica para verificar ou restabelecer a conexão com o servidor.
  }

  constructor() { }

  ngOnInit() {
  }

}
