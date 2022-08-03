import { Component, OnInit } from '@angular/core';
import { MainComponent, Product } from '../../../core-client/components/MainComponent';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  products: Product[] = [];

  name = "";
  price = 0;

  constructor(
    private main: MainComponent
  ) {  }

  ngOnInit() {
    this.main.getAll().then(products => {
      this.products = products;
    })
  }

  add() {
    this.main.createProduct(this.name, this.price).then(product => {
      this.products.push(product);
      this.name = "";
      this.price = 0;
    })
  }

  remove(id: number) {
    this.main.remove(id).then(() => this.products = this.products.filter(p => p.id !== id));
  }
}
