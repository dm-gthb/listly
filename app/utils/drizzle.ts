import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../drizzle/schema';

export const getDB = (db: Env['DB']) => drizzle(db, { schema });
