import { Client } from "../../server/app/databse/index";

export class DatabaseComponent {
    constructor(
        private client: Client
    ) {}

    public async test(): Promise<any[]> {
        return (await this.client.query("SELECT * FROM products")).rows;
    }
}