# Admin Password Authentication Setup

## Overview

This admin panel is now protected with password-based authentication. Users must:

1. Have an ADMIN role in the user account
2. Enter the correct admin password each session

## Setup Instructions

### 1. Generate Admin Password Hash

Run the password generation script:

```bash
npx ts-node scripts/generate-admin-password.ts
```

Or if you want to generate with a custom password:

```bash
ADMIN_PASSWORD="your-secure-password" npx ts-node scripts/generate-admin-password.ts
```

### 2. Add to Environment Variables

Copy the generated hash and add it to your `.env.local` file:

```
ADMIN_PASSWORD_HASH=<paste-the-hash-here>
```

### 3. Test Access

1. Login with your user account that has ADMIN role
2. Try to access `/admin` - you'll be redirected to `/admin-login`
3. Enter the admin password you set
4. You'll have access to the admin panel for 24 hours

## Features

✅ Password-based access control for admin area
✅ Secure password hashing with bcryptjs
✅ Session persistence (24-hour expiry)
✅ Automatic redirection to login if not authenticated
✅ Logout functionality available in admin panel
✅ HttpOnly cookies for security
✅ Works alongside existing NextAuth authentication

## Routes

- `/admin-login` - Admin password login page
- `/api/admin/verify-password` - POST endpoint to verify password
- `/api/admin/logout` - POST endpoint to logout from admin area

## Security Considerations

1. Change your admin password regularly
2. Use a strong, unique password
3. The password hash is stored in environment variables
4. Sessions expire after 24 hours of inactivity
5. Cookies are HttpOnly to prevent XSS attacks
6. Passwords are compared using bcryptjs timing-safe comparison

## Customization

You can adjust the session timeout by modifying the `maxAge` in `/src/app/api/admin/verify-password/route.ts`:

```typescript
maxAge: 86400, // Change this value (in seconds)
```

For example:

- 3600 = 1 hour
- 86400 = 24 hours (default)
- 604800 = 7 days
