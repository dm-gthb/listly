import { sqliteTable, text, integer, primaryKey, unique } from 'drizzle-orm/sqlite-core';
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

export const passwords = sqliteTable(
  'passwords',
  {
    hash: text().notNull(),
    userId: integer()
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId] })],
);

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
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
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
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  listingId: integer()
    .notNull()
    .references(() => listings.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  ...timestamps,
});

export const listingToCategory = sqliteTable(
  'listingToCategory',
  {
    listingId: integer()
      .notNull()
      .references(() => listings.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    categoryId: integer()
      .notNull()
      .references(() => categories.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.categoryId] })],
);

export const roles = sqliteTable('roles', {
  id: integer().primaryKey(),
  name: text().notNull().unique(),
  description: text().default(''),
  ...timestamps,
});

export const usersToRoles = sqliteTable(
  'usersToRoles',
  {
    userId: integer()
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    roleId: integer()
      .notNull()
      .references(() => roles.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);

export const permissions = sqliteTable(
  'permissions',
  {
    id: integer().primaryKey(),
    action: text().notNull(),
    entity: text().notNull(),
    access: text().notNull(),
    description: text().default(''),
    ...timestamps,
  },
  (t) => ({
    uniqueActionEntityAccess: unique().on(t.action, t.entity, t.access),
  }),
);

export const permissionsToRoles = sqliteTable(
  'permissionsToRoles',
  {
    permissionId: integer()
      .notNull()
      .references(() => permissions.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    roleId: integer()
      .notNull()
      .references(() => roles.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (t) => [primaryKey({ columns: [t.permissionId, t.roleId] })],
);

export const userRelations = relations(users, ({ one, many }) => ({
  listings: many(listings),
  comments: many(comments),
  password: one(passwords),
  usersToRoles: many(usersToRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  usersToRoles: many(usersToRoles),
  permissionsToRoles: many(permissionsToRoles),
}));

export const usersToRolesRelations = relations(usersToRoles, ({ one }) => ({
  role: one(roles, {
    fields: [usersToRoles.roleId],
    references: [roles.id],
  }),
  user: one(users, {
    fields: [usersToRoles.userId],
    references: [users.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  permissionsToRoles: many(permissionsToRoles),
}));

export const permissionsToRolesRelations = relations(permissionsToRoles, ({ one }) => ({
  role: one(roles, {
    fields: [permissionsToRoles.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [permissionsToRoles.permissionId],
    references: [permissions.id],
  }),
}));

export const passwordsRelations = relations(passwords, ({ one }) => ({
  user: one(users, { fields: [passwords.userId], references: [users.id] }),
}));

export const listingRelations = relations(listings, ({ one, many }) => ({
  owner: one(users, {
    fields: [listings.ownerId],
    references: [users.id],
  }),
  comments: many(comments),
  categories: many(listingToCategory),
  listingAttributes: many(listingAttributes),
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

// ATTRIBUTES AND ITS RELATIONS WITH LISTINGS AND CATEGORIES
// Attribute definitions (metadata about attributes like 'RAM', 'Color')
export const attributes = sqliteTable('attributes', {
  id: integer().primaryKey(),
  name: text().notNull(), // 'RAM'
  slug: text().notNull().unique(), // 'ram'
  inputType: text().notNull(), // 'number', 'select', etc.
  unit: text(), // optional unit: 'GB', 'cm'
  ...timestamps,
});

// Available values for select-like attributes (e.g., "Silver", "Black")
export const attributeValues = sqliteTable('attributeValues', {
  id: integer().primaryKey(),
  attributeId: integer()
    .notNull()
    .references(() => attributes.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  value: text().notNull(),
});

// Mapping which attributes belong to which category (e.g., Laptops → RAM, Storage)
export const categoryToAttribute = sqliteTable(
  'categoryToAttribute',
  {
    categoryId: integer()
      .notNull()
      .references(() => categories.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    attributeId: integer()
      .notNull()
      .references(() => attributes.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (t) => [primaryKey({ columns: [t.categoryId, t.attributeId] })],
);

// Actual attribute values for a listing (e.g., listing #1 has RAM = 16)
export const listingAttributes = sqliteTable(
  'listingAttributes',
  {
    listingId: integer()
      .notNull()
      .references(() => listings.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    attributeId: integer()
      .notNull()
      .references(() => attributes.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    value: text().notNull(),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.attributeId] })],
);

// relations
export const attributeRelations = relations(attributes, ({ many }) => ({
  values: many(attributeValues),
  listingAttributes: many(listingAttributes),
}));

export const attributeValueRelations = relations(attributeValues, ({ one }) => ({
  attribute: one(attributes, {
    fields: [attributeValues.attributeId],
    references: [attributes.id],
  }),
}));

export const listingAttributesRelations = relations(listingAttributes, ({ one }) => ({
  listing: one(listings, {
    fields: [listingAttributes.listingId],
    references: [listings.id],
  }),
  attribute: one(attributes, {
    fields: [listingAttributes.attributeId],
    references: [attributes.id],
  }),
}));

export const categoryToAttributeRelations = relations(categoryToAttribute, ({ one }) => ({
  category: one(categories, {
    fields: [categoryToAttribute.categoryId],
    references: [categories.id],
  }),
  attribute: one(attributes, {
    fields: [categoryToAttribute.attributeId],
    references: [attributes.id],
  }),
}));
