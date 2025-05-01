import type {
  BuildQueryResult,
  DBQueryConfig,
  ExtractTablesWithRelations,
} from 'drizzle-orm';
import * as schema from './schema';

type Schema = typeof schema;
type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
  'one' | 'many',
  boolean,
  TSchema,
  TSchema[TableName]
>['with'];

export type InferResultType<
  TableName extends keyof TSchema,
  With extends IncludeRelation<TableName> | undefined = undefined,
> = BuildQueryResult<
  TSchema,
  TSchema[TableName],
  {
    with: With;
  }
>;

export type Listing = typeof schema.listings.$inferSelect;
export type User = typeof schema.users.$inferSelect;
export type Category = typeof schema.categories.$inferSelect;
export type Comment = typeof schema.comments.$inferSelect;
export type ListingWithCategories = InferResultType<'listings', { categories: true }>;
export type ListingWithCategoriesAndAttributes = InferResultType<
  'listings',
  { categories: true; listingAttributes: { with: { attribute: true } } }
>;
export type AllCategoriesWithAttribute = InferResultType<
  'categoryToAttribute',
  {
    attribute: {
      with: {
        values: true;
      };
    };
  }
>;
