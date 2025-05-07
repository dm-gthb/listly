# Listly

**Listly** is a full-stack web application that allows users to buy and sell items.

**Demo**: [https://listly.dmbx.workers.dev/](https://listly.dmbx.workers.dev/)

🚧 This project is a work in progress — key features are implemented, with UI improvements and code refactoring planned.

## Key Features
- **Search Listings**: Easily search for listings across multiple categories and subcategories.
- **Create, Update, and Delete Listings**: Manage listings by adding, editing, or removing them.
- **Authentication**: Secure login with user roles.
- **Filtering, Sorting, and Pagination**: Filter and sort listings based on category parameters, and navigate results with pagination.
- **Image Upload**: Upload images for listings.

## Technologies Used
- React
- Remix / React Router 7 framework mode
- D1 (Cloudflare's SQL database)
- Drizzle ORM
- Conform
- Zod
- R2 (Cloudflare's object storage)
- Tailwind CSS
- Cloudflare Workers (for deployment)

## User Roles & Demo Access
This app includes multiple user roles to ensure safe and flexible interaction:

| Role        | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| **admin**   | Full access to manage listings and users.                                  |
| **user**    | Verified user. Can create, edit, and delete their own listings.            |
| **unverified** | Default role after signup. Can explore the UI but cannot create, edit, or delete any data. |
| **demo**    | Pre-created user to explore features. Can view and interact with the UI, but all write actions are disabled. |

### 💡 How to explore the app
To explore how a verified user dashboard looks, browse pre-created listings, and interact with forms, log in as a demo user:
- **Email**: demo@demo.com
- **Password**: password123
