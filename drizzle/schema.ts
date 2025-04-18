import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

const timestamps = {
  createdAt: text()
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text()
    .notNull()
    .default(sql`(current_timestamp)`),
};

export const users = sqliteTable('users', {
  id: integer().primaryKey(),
  email: text().unique().notNull(),
  name: text().notNull(),
  avatarUrl: text(),
  ...timestamps,
});

export const listings = sqliteTable('listings', {
  id: integer().primaryKey(),
  title: text().notNull(),
  description: text().notNull(),
  sum: integer().notNull(),
  condition: text().notNull(),
  images: text({ mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
  ownerId: integer()
    .notNull()
    .references(() => users.id),
  ...timestamps,
});

export const categories = sqliteTable('categories', {
  id: integer().primaryKey(),
  name: text().unique().notNull(),
  parentId: integer(),
  ...timestamps,
});

export const comments = sqliteTable('comments', {
  id: integer().primaryKey(),
  text: text().notNull(),
  userId: integer()
    .notNull()
    .references(() => users.id),
  listingId: integer()
    .notNull()
    .references(() => listings.id),
  ...timestamps,
});

export const listingToCategory = sqliteTable(
  'listingToCategory',
  {
    listingId: integer()
      .notNull()
      .references(() => listings.id),
    categoryId: integer()
      .notNull()
      .references(() => categories.id),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.categoryId] })],
);

export const userRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  comments: many(comments),
}));

export const listingRelations = relations(listings, ({ one, many }) => ({
  owner: one(users, {
    fields: [listings.ownerId],
    references: [users.id],
  }),
  comments: many(comments),
  categories: many(listingToCategory),
}));

export const commentRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [comments.listingId],
    references: [listings.id],
  }),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  listings: many(listingToCategory),
}));

export const listingToCategoryRelations = relations(listingToCategory, ({ one }) => ({
  listing: one(listings, {
    fields: [listingToCategory.listingId],
    references: [listings.id],
  }),
  category: one(categories, {
    fields: [listingToCategory.categoryId],
    references: [categories.id],
  }),
}));
