import { Observable } from 'rxjs';

export interface CommentSource {
    connect(params: any): Observable<any>;
}