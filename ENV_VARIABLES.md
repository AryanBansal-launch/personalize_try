# Required Environment Variables

Create a `.env.local` file in the root of your project (`personalize/` directory) with the following environment variables:

## Contentstack CMS Configuration

### `NEXT_PUBLIC_CONTENTSTACK_API_KEY`
- **Description**: Your Contentstack Stack API Key
- **Required**: Yes
- **Where to find**: 
  - Contentstack Dashboard → Your Stack → Settings → Stack Settings → API Key
  - Or: Settings → Stack → API Key

### `NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN`
- **Description**: Your Content Delivery API Token
- **Required**: Yes
- **Where to find**: 
  - Contentstack Dashboard → Your Stack → Settings → Tokens
  - Create a new Delivery Token if you don't have one
  - Make sure it has read permissions for your content types

### `NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT`
- **Description**: The environment name where your content is published
- **Required**: Yes
- **Common values**: `production`, `development`, `staging`, or your custom environment name
- **Where to find**: 
  - Contentstack Dashboard → Your Stack → Environments
  - Use the exact name of the environment (case-sensitive)

### `NEXT_PUBLIC_CONTENTSTACK_REGION`
- **Description**: The region where your Contentstack stack is hosted
- **Required**: Yes (defaults to `aws-na` for setup scripts, `us` for app)
- **Possible values**: 
  - `us` - United States
  - `eu` - Europe
  - `aws-na` - AWS North America
  - `azure-na` - Azure North America
  - `azure-eu` - Azure Europe
- **Where to find**: 
  - Usually shown in your stack settings or URL
  - Check your Contentstack dashboard URL (e.g., `app.contentstack.com` = `us`)

### `CONTENTSTACK_MANAGEMENT_TOKEN` (for setup scripts only)
- **Description**: Management API Token for creating content types and entries
- **Required**: Yes (only for running setup scripts)
- **Note**: This is NOT needed for the app to run, only for the setup script
- **Where to find**: 
  - Contentstack Dashboard → Your Profile (top right) → Tokens → Management Tokens
  - Create a new token or use an existing one
  - Make sure it has permissions to create/update content types and entries

## Contentstack Personalize Configuration

### `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID`
- **Description**: Your Personalize Project UID
- **Required**: Yes
- **Where to find**: 
  - Contentstack Dashboard → Personalize → Your Project
  - Go to Settings → General tab → Project Details
  - Copy the "Project UID" value

## Example `.env.local` File

```env
# Contentstack CMS Configuration
NEXT_PUBLIC_CONTENTSTACK_API_KEY=blt1234567890abcdef
NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN=cs1234567890abcdefghijklmnop
NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT=production
NEXT_PUBLIC_CONTENTSTACK_REGION=aws-na

# Contentstack Management Token (for setup scripts only)
CONTENTSTACK_MANAGEMENT_TOKEN=cs1234567890abcdefghijklmnop

# Contentstack Personalize Configuration
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=prj_1234567890abcdef
```

**Note**: You can also use the `NEXT_PUBLIC_` prefixed versions for API_KEY, DELIVERY_TOKEN, and ENVIRONMENT in the setup script - it will check both.

## Important Notes

1. **`NEXT_PUBLIC_` prefix**: All variables must start with `NEXT_PUBLIC_` because they're used in client-side code (Next.js requirement)

2. **Security**: Never commit `.env.local` to version control. It's already in `.gitignore` by default in Next.js projects.

3. **Restart required**: After adding or modifying environment variables, restart your Next.js development server:
   ```bash
   npm run dev
   ```

4. **Variable names**: Make sure the variable names match exactly (case-sensitive)

5. **No quotes needed**: Don't wrap the values in quotes in the `.env.local` file

## Verification

After setting up your environment variables, you can verify they're loaded correctly by checking the browser console or adding a temporary log in your code (remove it before production).

