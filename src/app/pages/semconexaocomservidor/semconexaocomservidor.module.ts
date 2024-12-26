import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SemconexaocomservidorPageRoutingModule } from './semconexaocomservidor-routing.module';

import { SemconexaocomservidorPage } from './semconexaocomservidor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SemconexaocomservidorPageRoutingModule
  ],
  declarations: [SemconexaocomservidorPage]
})
export class SemconexaocomservidorPageModule {}
