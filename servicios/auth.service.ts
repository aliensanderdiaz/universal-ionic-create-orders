import { Injectable } from '@angular/core';
import { ApiProviderService } from './api-provider.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  nombreVendedora: string = '';
  loggeado: boolean = false;

  constructor(
    private apiService: ApiProviderService
  ) { }

  login({ numeroId, pass }) {
    this.apiService.peticionPost('signin-local', { numeroId, password: pass })
      .subscribe(
        (data: any) => {
          console.log({data});
          // this.nombreVendedora = data.usuario.primerNombre;
          this.nombreVendedora = 'Vendedora';
          this.loggeado = true;
        },
        (error: any) => {
          console.log('ERROR #####################################################')
          console.log('ERROR #####################################################')
          console.log(error);
          console.log('ERROR #####################################################')
          console.log('ERROR #####################################################')
        },
        () => {
          console.log('TERMINADO');
        }
      )
  }
}
