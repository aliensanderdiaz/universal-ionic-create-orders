import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiProviderService {

  urlApi: string = 'http://localhost:3001';
  // urlApi: string = 'http://192.168.1.6:3001';

  // urlApi: string = 'http://192.168.1.100';

  constructor(
    public http: HttpClient
  ) { }

  peticionPost(url, body) {
    return this.http.post(`${this.urlApi}/${url}`, body);
  }

  peticionPut(url, body) {
    return this.http.put(`${this.urlApi}/${url}`, body);
  }

  peticionGet(url) {
    // return this.http.get(`${this.urlApi}/${url}`);
    return this.http.get(`${this.urlApi}/${url}`, {withCredentials: true});
  }
}
