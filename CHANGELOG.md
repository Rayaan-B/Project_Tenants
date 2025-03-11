# Changelog

All notable changes to the Tenant Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-03-10

### Added
- Initial release of the Tenant Management System
- User authentication and login functionality
- Dashboard with summary statistics and overview
- Property management with property details modal
- Unit management within properties
- Tenant management system
- Payment tracking and history
- Mobile-responsive design for all components

### Changed
- Optimized property details modal for mobile devices:
  - Added vertical scrolling with overflow-y-auto and max-h-[90vh]
  - Changed layout to single column for better mobile viewing
  - Fixed header with border-bottom for better visual separation
  - Added flex-grow to content area to utilize available space
  - Added text truncation for potentially long text
  - Made unit cards more responsive with flex-wrap and gap-y-1
  - Added flex-shrink-0 to icons to prevent shrinking
  - Added min-w-0 to content containers to enable text truncation

### Improved
- Enhanced payment history display with card design:
  - Light background with matching borders
  - Compact text sizes (text-sm for main content, text-xs for secondary information)
  - Detailed payment breakdown showing individual payments
  - Highlighted Mpesa codes with indigo styling
  - Summary cards for total paid and balance
  - Status badges with appropriate colors (green for paid, yellow for partial, red for unpaid)
  - Reduced padding for compact layout
  - Show/Hide Monthly Breakdown toggle with indigo styling
- Enhanced payment list functionality:
  - Grouped payments by tenant for better organization
  - Display only the most recent payment by default to reduce clutter
  - Added "Show All Payments" button to expand and view complete payment history for each tenant
  - Maintained consistent styling with indigo accents for buttons and Mpesa codes
  - Improved visual hierarchy with centered expansion controls

## How to Update
1. Pull the latest changes from the repository
2. Run `npm install` to install any new dependencies
3. Run `npm run dev` to start the development server
