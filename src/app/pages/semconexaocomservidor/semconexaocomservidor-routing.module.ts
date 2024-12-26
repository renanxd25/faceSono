import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SemconexaocomservidorPage } from './semconexaocomservidor.page';

const routes: Routes = [
  {
    path: '',
    component: SemconexaocomservidorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SemconexaocomservidorPageRoutingModule {}
