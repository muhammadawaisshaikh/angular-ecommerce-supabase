# Angular E-commerce App with Supabase

A modern e-commerce application built with Angular 20 and Supabase, featuring a responsive design with Tailwind CSS. This app focuses on product browsing, cart management, and guest checkout without requiring user authentication.

## 🚀 Features

- **Modern Angular 20** with TypeScript
- **Supabase Backend** for products, cart, and orders
- **Responsive Design** with Tailwind CSS
- **Client-Side Rendering** for optimal performance and simplicity
- **Guest Checkout** - No login required to place orders
- **Shopping Cart** with persistent storage
- **Product Catalog** with categories and search
- **Order Management** for tracking purchases

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Angular CLI](https://angular.io/cli) (version 20 or higher)
- [Git](https://git-scm.com/)

## 🛠️ Installation

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

- `database-setup-guest-orders.sql` - **Recommended**: Database schema with guest order support
- `database-setup.sql` - Original database schema (requires authentication)
- `database-setup-safe.sql` - Safe version with proper constraints
- `check-database.sql` - Verification queries

**For Guest Orders (Recommended):**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `database-setup-guest-orders.sql`
3. Run the SQL commands

This will create tables that support both authenticated users and guest orders.

## 🚀 Running the Application

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

## 📁 Project Structure

```
angular-ecommerce-supabase/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── home/           # Home page with featured products
│   │   │   ├── products/       # Product listing and detail views
│   │   │   ├── cart/           # Shopping cart management
│   │   │   └── checkout/       # Checkout form and order processing
│   │   ├── services/
│   │   │   ├── supabase.service.ts    # Supabase API integration
│   │   │   └── cart.service.ts        # Cart state management
│   │   └── environments/       # Environment configuration
│   ├── database-setup-guest-orders.sql # Database schema with guest orders
│   ├── angular.json            # Angular configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── package.json            # Dependencies and scripts
```

## 🔐 Environment Variables

The application uses the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `supabase.url` | Your Supabase project URL | `https://yourproject.supabase.co` |
| `supabase.anonKey` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 🗄️ Database Schema

The application includes a comprehensive e-commerce database schema with:

- **Products** - Product catalog with categories, prices, and stock
- **Orders** - Order management supporting both authenticated and guest users
- **Cart** - Shopping cart functionality with local storage persistence

### Guest Order Support

The updated schema supports guest orders by:
- Making `user_id` optional in the orders table
- Adding `customer_info` JSONB field for guest contact details
- Allowing anyone to insert orders (no authentication required)
- Maintaining security through Row Level Security policies

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to Netlify

### Other Platforms

The app can be deployed to any static hosting platform since it's a client-side only application.

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
