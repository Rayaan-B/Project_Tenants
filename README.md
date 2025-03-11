# Tenant Management System

A comprehensive web application for property owners and managers to track tenants, properties, units, and payments.

## Features

### Dashboard
- Overview of key metrics including total properties, units, tenants, and payments
- Quick access to recent activities and important notifications
- Visual summaries of occupancy rates and payment statuses

### Property Management
- Add, edit, and delete properties
- View detailed property information
- Manage units within properties
- Track property details and documentation

### Tenant Management
- Comprehensive tenant profiles with contact information
- Lease period tracking
- Payment due day tracking
- Next payment date calculation

### Payment Tracking
- Record and manage payments with detailed information
- Payment history with monthly breakdowns
- Payment status tracking (paid, pending, overdue)
- Support for different payment methods including Mpesa
- Group payments by tenant with expandable history view

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase
- **Authentication**: Supabase Auth

## Installation and Setup

1. Clone the repository
```bash
git clone https://github.com/Rayaan-B/TenantUpdate.git
cd TenantUpdate/project
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## Design Features

The application features a clean, modern UI with:

- Light/dark mode support
- Responsive design for mobile and desktop
- Card-based layout for consistent information display
- Status indicators with appropriate colors
- Compact text sizes for efficient information display
- Detailed payment breakdowns with expandable sections

## Recent Improvements

### Payment List Enhancements
- Grouped payments by tenant for better organization
- Display only the most recent payment by default
- Added "Show All Payments" button to expand and view complete payment history
- Maintained consistent styling with indigo accents
- Improved visual hierarchy with centered expansion controls

For a complete list of changes, please see the [CHANGELOG.md](CHANGELOG.md).

## Live Demo

You can view the live application at:
- [https://rayaan-b.github.io/TenantUpdate/](https://rayaan-b.github.io/TenantUpdate/)

## License

MIT
