import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.less']
})
export class IndexComponent {

  constructor(private title: Title,
    private meta: Meta,
    private api: ApiService) {
    title.setTitle('BILICHAT by 3Shain');
    meta.addTags([{

    }, {

    }]);
  }

  ngAfterViewInit() {

  }
}
