# Angular E-commerce App with Supabase

A modern e-commerce application built with Angular 20 and Supabase, featuring a responsive design with Tailwind CSS.

## Features

- **Modern Angular 20** with TypeScript
- **Supabase Backend** for authentication, database, and storage
- **Responsive Design** with Tailwind CSS
- **Server-Side Rendering** (SSR) support
- **E-commerce Functionality** including products, cart, and user management

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Angular CLI](https://angular.io/cli) (version 20 or higher)
- [Git](https://git-scm.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/angular-ecommerce-supabase.git
cd angular-ecommerce-supabase
```

### 2. Install Dependencies

```bash
npm install
```

## 🔧 Supabase Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in/sign up
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "ecommerce-app")
5. Set a database password (save this securely)
6. Choose a region close to your users
7. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://yourproject.supabase.co`)
   - **Anon (public) key** (starts with `eyJ...`)

### 3. Configure Environment Variables

#### Development Environment

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_PROJECT_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

#### Production Environment

Update `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'YOUR_SUPABASE_PROJECT_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

**⚠️ Important:** Never commit your actual Supabase credentials to version control. Use environment variables or `.env` files for production deployments.

### 4. Database Setup

The project includes SQL setup files for the database schema:

- `database-setup.sql` - Complete database schema
- `database-setup-safe.sql` - Safe version with proper constraints
- `check-database.sql` - Verification queries

To set up your database:

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `database-setup.sql` or `database-setup-safe.sql`
3. Run the SQL commands

## Running the Application

### Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/` in your browser.

### Build for Production

```bash
npm run build
# or
ng build
```

### Run Tests

```bash
npm test
# or
ng test
```

### End-to-End Testing

```bash
ng e2e
```

## 📁 Project Structure

```
angular-ecommerce-supabase/
├── src/
│   ├── app/                 # Application components
│   ├── environments/        # Environment configuration
│   └── assets/             # Static assets
├── public/                  # Public assets
├── database-setup.sql      # Database schema
├── angular.json            # Angular configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## 🔐 Environment Variables

The application uses the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `supabase.url` | Your Supabase project URL | `https://yourproject.supabase.co` |
| `supabase.anonKey` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 🗄️ Database Schema

The application includes a comprehensive e-commerce database schema with:

- **Users** - User authentication and profiles
- **Products** - Product catalog with categories
- **Orders** - Order management and tracking
- **Cart** - Shopping cart functionality
- **Categories** - Product categorization

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to Netlify

### Other Platforms

The app supports SSR and can be deployed to any Node.js hosting platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Angular documentation](https://angular.io/docs)
3. Open an issue in this repository

## 🔄 Updates

To update the project dependencies:

```bash
npm update
ng update
```

---

**Happy coding! 🎉**
