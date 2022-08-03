import { Client } from "../../server/app/databse";

export type Product = {
    id: number,
    name: string,
    price: number,
};

export class MainComponent {
    constructor(
        private client: Client
    ) {}

    private async send(query: string) {
        return this.client.query(query).then(r => r.rows);
    }
    
    public async findById(id: string): Promise<Product|undefined> {        
        return this.send(`SELECT * FROM products WHERE id = ${id}`).then(rows => rows[0]);
    }
    public async getAll(): Promise<Product[]> {
        return this.send(`SELECT * FROM products`);
    }
    public async createProduct(name: string, price: number): Promise<Product> {
        return this.send(`INSERT INTO products (name, price) VALUES ('${name}', ${price}) RETURNING id, name, price`).then(rows => rows[0]);
    }
    public async remove(id: number): Promise<void> {        
        await this.send(`DELETE FROM products WHERE id = ${id}`);
    }
}
