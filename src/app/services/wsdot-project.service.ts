import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WsdotProject } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WsdotProjectService {
  private apiUrl = environment.apiUrl + '/wsdot-projects';

  constructor(private http: HttpClient) {}

  getAll(): Observable<WsdotProject[]> {
    return this.http.get<WsdotProject[]>(this.apiUrl);
  }

  create(project: WsdotProject): Observable<WsdotProject> {
    return this.http.post<WsdotProject>(this.apiUrl, project);
  }

  update(id: number, project: Partial<WsdotProject>): Observable<WsdotProject> {
    return this.http.put<WsdotProject>(`${this.apiUrl}/${id}`, project);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
