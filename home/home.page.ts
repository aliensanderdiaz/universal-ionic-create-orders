import { Component, OnInit } from '@angular/core';
import { ApiProviderService } from '../servicios/api-provider.service';

import { fromEvent, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  nombreVendedora: string;
  loggeado: boolean = false; 

  loginID: string;
  loginPass: string;

  numeroIdentificacion: number;
  digitoVerificacion: number;
  cliente: any;
  clienteEncontrado: boolean = false;
  clienteElegido: boolean = false;
  mostrarFormulario: boolean = false;
  mostrarProductos: boolean = false;

  tipoIdentificacion: string = 'cc';
  razonSocial: string;
  nombreComercial: string;
  primerNombre: string;
  segundoNombre: string;
  apellidos: string;
  ciudad: string = 'Neiva';
  departamento: string = 'Huila';
  direccion: string;
  telefono: number;
  email: string;

  tipoBusqueda: string = 'Producto';
  queryBusqueda: string;


  productosApi: any[] = [];
  productosApiCargados: boolean = false;
  productosCompra: any[] = [];
  productosFiltrados: any[] = [];

  total: number = 0;

  // SERVICIO TECNICO

  queryBusquedaProdServ: string = '';

  apiConectada: boolean = false;


  constructor(
    private apiProvider: ApiProviderService,
    private authService: AuthService
  ) {

  }

  ngOnInit() {
    // this.datosPrueba();
    // this.cargarProductos();
    this.test();
    this.loggeado = this.authService.loggeado;
  }

  login() {
    this.authService.login({ numeroId: this.loginID, pass: this.loginPass });
  }

  reset() {
    this.numeroIdentificacion = undefined;
    this.digitoVerificacion = undefined;
    this.cliente = undefined;
    this.clienteEncontrado = false;
    this.clienteElegido = false;
    this.mostrarFormulario = false;
    this.mostrarProductos = false;

    this.tipoIdentificacion = 'cc';
    this.razonSocial = undefined;
    this.nombreComercial = undefined;
    this.primerNombre = undefined;
    this.segundoNombre = undefined;
    this.apellidos = undefined;
    this.ciudad = 'Neiva';
    this.departamento = 'Huila';
    this.direccion = undefined;
    this.telefono = undefined;
    this.email = undefined;

    this.tipoBusqueda = 'Producto';
    this.queryBusqueda = undefined;

    this.productosCompra = [];
    this.productosFiltrados = [];

    this.total = 0;
  }

  elegirClienteOcasional() {
    this.clienteElegido = true;
    this.clienteEncontrado = true;
    this.cliente = {
      tipoId: 'cc',
      numeroId: '22222222',
      primerNombre: 'Cliente',
      apellidos: 'Ocasional',
      _id: '5ce48057b8549c079cef1eb9'
    };
    this.mostrarProductos = true;
  }

  datosPrueba() {
    this.clienteEncontrado = true;
    this.cliente = {
      tipoId: 'cc',
      numeroId: 1075235031,
      primerNombre: 'John',
      apellidos: 'Diaz',
      _id: '5c36140d68e87952b060a0d5'
    };
    this.mostrarProductos = true;
  }

  cargarProductos() {
    // this.apiProvider.peticionGet('productos-lista-completa')
    //   .subscribe((data: any) => {
    //     this.productosApi = data.productos;
    //     console.log('Productos Cargados Observable');
    //   },
    //     (error) => {
    //       console.log('ERROR');
    //     },
    //     () => {
    //       this.productosApiCargados = true;
    //       console.log('TODOS LOS PRODUCTOS');
    //     }
    //   )
  }

  test() {
    this.apiProvider.peticionGet('api-conectada')
      .subscribe(
        (data: any) => {
          this.apiConectada = true;
        },
        (err: any) => {
          this.apiConectada = false;
        },
        () => {
          console.log('Test terminado');
        }
      )
  }

  calcularDV() {
    var arreglo, x, y, z, i, nit1, dv1;
    nit1 = this.numeroIdentificacion;

    // console.log({ nit1 });

    if (!nit1 || nit1.toString().length <= 5) {
      this.digitoVerificacion = undefined;
      return;
    }

    if (isNaN(nit1)) {
      return;
    } else {
      arreglo = new Array(16);
      arreglo[0] = 0;
      // console.log({ arreglo });
      x = 0; y = 0; z = nit1.toString().length;
      // console.log({ length: z });

      arreglo[1] = 3; arreglo[2] = 7; arreglo[3] = 13;
      arreglo[4] = 17; arreglo[5] = 19; arreglo[6] = 23;
      arreglo[7] = 29; arreglo[8] = 37; arreglo[9] = 41;
      arreglo[10] = 43; arreglo[11] = 47; arreglo[12] = 53;
      arreglo[13] = 59; arreglo[14] = 67; arreglo[15] = 71;
      // console.log({ arreglo, z });
      for (i = 0; i < z; i++) {
        y = (nit1.toString().substr(i, 1));
        x += (y * arreglo[z - i]);
      }
      y = x % 11
      if (y > 1) { dv1 = 11 - y; } else { dv1 = y; }
      this.digitoVerificacion = dv1;
    }
  }

  buscarCliente() {
    this.cliente = null;
    if (this.numeroIdentificacion.toString().length <= 5) {
      console.log(`Numero bastante corto`);
      return;
    }
    this.apiProvider.peticionGet(`usuarios/usuario-por-numero/${this.numeroIdentificacion}`)
      .subscribe((data: any) => {
        if (data.ok) {
          this.cliente = data.usuario;
          console.log({ cliente: this.cliente });
          // this.clienteProvider.cliente = this.cliente;
          this.clienteEncontrado = true;
          this.mostrarProductos = true;
        }
      }, (error: any) => {
        this.mostrarFormulario = true;
      });
  }

  crearCliente() {

    if (this.tipoIdentificacion === 'nit' && !this.razonSocial) {
      return;
    }

    if (
      this.tipoIdentificacion === 'cc' && !this.nombreComercial &&
      (!this.primerNombre || !this.apellidos)
    ) {
      return;
    }

    const CLIENTE = {
      razonSocial: this.razonSocial,
      nombreComercial: this.nombreComercial,
      primerNombre: this.primerNombre,
      segundoNombre: this.segundoNombre,
      apellidos: this.apellidos,
      tipoId: this.tipoIdentificacion,
      numeroId: this.numeroIdentificacion,
      ciudad: this.ciudad,
      departamento: this.departamento,
      direccion: this.direccion,
      telefono: this.telefono,
      email: this.email,
      tipo: 'cliente',
    }


    this.apiProvider.peticionPost('usuarios', CLIENTE)
      .subscribe((data: any) => {
        this.cliente = data.usuario;
        console.log({ data });
        // this.navCtrl.push(HomePage);

        this.cliente = data.usuario;
        this.clienteEncontrado = true;
        this.mostrarFormulario = false;
        this.mostrarProductos = true;
      }, (error) => {
        console.log('Error', error)
      })

  }

  buscarProductos() {
    console.log({
      tipoBusqueda: this.tipoBusqueda,
      queryBusqueda: this.queryBusqueda
    });
    let query = encodeURI(this.queryBusqueda)
    // this.obtenerProductosFiltrados(this.queryBusqueda)
    //   .subscribe((data: any) => {
    //     this.productosFiltrados = data;
    //     console.log({ data });
    //   })

    this.apiProvider.peticionGet(`productos-por-etiqueta-y-termino/${this.tipoBusqueda}/${query}`)
      .subscribe((data: any) => {
        this.productosFiltrados = data.productos;
        // console.log('Productos Cargados Observable');
      },
        (error) => {
          // console.log('ERROR');
        },
        () => {
          // this.productosApiCargados = true;
          // console.log('TODOS LOS PRODUCTOS');
        }
      )

  }

  

  obtenerProductosFiltrados(name: string): Observable<any[]> {
    if (name === '') {
      return of([]);
    } else {
      return of(this.filtrarProductos(name));
    }
  }

  filtrarProductos(name) {
    console.log('filtra productos', name, this.tipoBusqueda);

    return this.productosApi.filter(
      (producto) => {
        return producto.etiqueta === this.tipoBusqueda && (
          new RegExp(name, 'gi').test(producto.nombre) 
          || new RegExp(name, 'gi').test(producto.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '')) 
          || new RegExp(name, 'gi').test(producto.caracteristicas.referencia) 
          || new RegExp(name, 'gi').test(producto.caracteristicas.modelo)
          // || new RegExp(name, 'gi').test(producto.caracteristicas.ean13)
          // || new RegExp(name, 'gi').test(producto.caracteristicas.ean14)
          // || producto.cmmf.find(element => new RegExp(name, 'gi').test(element.codigo)) ? true : false
        )
      }
    )
  }

  elegirProducto(indice) {

    const PRODUCTO_ELEGIDO = this.productosFiltrados[indice];

    const PRODUCTO = {
      nombre: PRODUCTO_ELEGIDO.nombre,
      referencia: PRODUCTO_ELEGIDO.caracteristicas.referencia,
      productoId: PRODUCTO_ELEGIDO._id,
      cantidad: 1,
      valorVenta: 0
    }

    this.productosCompra.push(PRODUCTO);
    this.queryBusqueda = '';
    this.productosFiltrados = [];
  }

  actualizar(e) {

    let _total = 0;

    for (const product of this.productosCompra) {
      _total += product.cantidad * product.valorVenta;
    }

    this.total = (Math.round(_total * 100)) / 100;

  }

  eliminarProducto(indice) {
    this.productosCompra.splice(indice, 1);
    this.actualizar('e');
  }

  guardarOrden() {
    this.actualizar('e');
    
    const ORDEN = {
      // clienteId: this.cliente._id,
      // productos: this.productosCompra,
      // total: this.total,
      // etiqueta: 'CREADA'
    }

    console.log({
      ORDEN
    });

    this.apiProvider.peticionPost('ordenes-pos', ORDEN)
      .subscribe((data: any) => {

        console.log({ data });
        this.reset();

      }, (error) => {
        console.log('Error', error)
      })
  }


  // SERVICIO TECNICO 

  buscarProductosServicio(tipo) {

    this.tipoBusqueda = tipo;

    this.obtenerProductosFiltrados(this.queryBusquedaProdServ)
      .subscribe((data: any) => {
        this.productosFiltrados = data;
        console.log({ data });
      })
  }
}
