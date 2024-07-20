import { drizzle, OPSQLiteDatabase } from "drizzle-orm/op-sqlite";
import { migrate } from "drizzle-orm/op-sqlite/migrator";
import { open } from '@op-engineering/op-sqlite';
import * as schema from '../../drizzle/schema';
import x from '../../drizzle/migrations'
import Crypto from 'react-native-quick-crypto';
let db: OPSQLiteDatabase<typeof schema>;

export const Init = async (name: string) => {
    const key = Crypto.createHash('sha256').update(name).digest().toString('hex');
    const sqlite = open({
        name: name,
        encryptionKey: key,
    });
    db = drizzle(sqlite, { schema });
    await migrate(db, x);
}
export const GetDB = () => db;