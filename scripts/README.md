# Setup Scripts

This folder contains scripts to set up your Contentstack content for the Personalize demo.

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your `.env.local` file with the following variables:
   - `CONTENTSTACK_API_KEY` (or `NEXT_PUBLIC_CONTENTSTACK_API_KEY`)
   - `CONTENTSTACK_MANAGEMENT_TOKEN` (required for creating content)
   - `CONTENTSTACK_DELIVERY_TOKEN` (or `NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN`)
   - `CONTENTSTACK_ENVIRONMENT` (or `NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT`)
   - `CONTENTSTACK_REGION` (defaults to `aws-na`)

## Setup Scripts

### 1. Setup Content Script

The `setup-content.ts` script will:

1. **Create a Content Type** called "Personalized Content" with the following fields:
   - `title` (text, required)
   - `description` (text)
   - `content` (text/markdown)
   - `cta_text` (text)
   - `cta_link` (link)

2. **Publish the Content Type** to your specified environment

3. **Create Sample Entries**:
   - Default welcome message
   - US-specific content
   - UK-specific content
   - Adult age group content
   - Senior age group content

4. **Verify Entries** using the Content Delivery API

### Running the Script

```bash
npm run setup:content
```

Or directly with tsx:

```bash
npx tsx scripts/setup-content.ts
```

### What You'll Get

After running the script, you'll have:
- A content type UID: `personalized_content`
- Multiple sample entries with different content
- All entries published and ready to use

### Next Steps

1. **Update your page.tsx**:
   ```typescript
   const contentTypeUid = 'personalized_content';
   const entryUid = '<one of the created entry UIDs>'; // Check console output
   ```

2. **Set up Personalize in Contentstack Dashboard**:
   - Go to Personalize → Your Project
   - Create experiences and variants
   - Map variants to your entries based on attributes (location, ageGroup)

3. **Test personalization** in your app by changing the dropdown values

### 2. Setup Personalize Variants Script

The `setup-personalize.ts` script will:

1. **Fetch existing entries** from the `personalized_content` content type
2. **Create entry variants** for different user segments:
   - Location-based variants (US, UK)
   - Age group-based variants (Adult, Senior, Youth)
3. **Publish variants** to your specified environment

#### Running the Personalize Setup Script

```bash
npm run setup:personalize
```

Or directly with tsx:

```bash
npx tsx scripts/setup-personalize.ts
```

#### Prerequisites

- Run `setup-content.ts` first to create entries
- Set `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` in your `.env.local`

#### What You'll Get

After running the script, you'll have:
- Entry variants created for location-based personalization
- Entry variants created for age group-based personalization
- Variants published and ready to use

#### Next Steps After Running

1. **Go to Contentstack Dashboard → Personalize → Your Project**
2. **Create Attributes**:
   - `location` (values: us, uk, ca, au, de)
   - `ageGroup` (values: adult, senior, youth)
3. **Create Experiences**:
   - Location Experience: Target users by location attribute
   - Age Group Experience: Target users by ageGroup attribute
4. **Map Variants to Experiences**:
   - Link the created variants to your experiences in the dashboard
5. **Test personalization** in your app

**Note**: Experiences and Attributes are typically created via the Personalize Dashboard UI, as they require visual configuration. This script creates the entry variants that will be used by those experiences.

## Getting Management Token

To get your Management Token:

1. Go to Contentstack Dashboard
2. Click on your profile (top right)
3. Go to **Tokens** → **Management Tokens**
4. Create a new token or use an existing one
5. Make sure it has permissions to:
   - Create/Update Content Types
   - Create/Update Entries
   - Publish Content

## Troubleshooting

### Error: "Content type already exists"
- This is normal if you've run the script before
- The script will skip creation and continue

### Error: "Management Token not found"
- Make sure `CONTENTSTACK_MANAGEMENT_TOKEN` is set in `.env.local`
- Restart your terminal after adding the variable

### Error: "Region not supported"
- Make sure your region is one of: `us`, `eu`, `azure-na`, `azure-eu`
- The script defaults to `aws-na` if not specified

