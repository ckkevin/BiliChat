import { Observable } from 'rxjs';

export interface CommentVendor {
    connect(params: any): Observable<any>;
}