# Contentstack Personalize Demo

This is a [Next.js](https://nextjs.org) project demonstrating how to integrate [Contentstack Personalize](https://www.contentstack.com/docs/personalize) into a web application. The project shows how to deliver personalized content variants to users based on their attributes (such as location, age group, etc.) using Contentstack's Personalization engine.

## What This Project Does

This demo application showcases:

- **Content Personalization**: Dynamically serve different content variants to users based on their attributes
- **Real-time Variant Resolution**: Use Contentstack Personalize SDK to determine which content variant to show
- **Attribute-based Targeting**: Personalize content based on user attributes like location (US, UK) and age group (Adult, Senior, Youth)
- **Content Delivery Integration**: Fetch personalized content from Contentstack CMS using variant aliases
- **Interactive Demo UI**: A simple interface with dropdowns to simulate different user attributes and see personalized content in real-time

### How Personalization Works

1. User selects attributes (e.g., Location: US, Age Group: Adult) via dropdowns
2. Personalize SDK evaluates which experiences match these attributes
3. SDK returns variant aliases for matched experiences
4. Content Delivery API fetches the entry with variant aliases
5. Contentstack returns the personalized variant content
6. UI displays the variant-specific content to the user

---

## Project Structure

### Core Application Files

#### `app/page.tsx`
The main page component that:
- Renders the UI with attribute selection dropdowns (Location, Age Group)
- Initializes the Personalize SDK with user attributes
- Fetches personalized content from Contentstack
- Displays the variant information and content
- Handles loading and error states

### Library Files

#### `lib/personalize.ts`
Personalize SDK wrapper that provides:
- `initializePersonalize()` - Initialize the Personalize SDK with project UID and attributes
- `reinitializePersonalize()` - Re-initialize SDK when attributes change (replaces previous attributes)
- `updatePersonalizeAttributes()` - Update user attributes in the SDK
- `getActiveExperiences()` - Get active experiences that match current attributes
- `getVariantAliases()` - Get variant aliases to pass to Content Delivery API
- `getPersonalizeHeader()` - Get the x-personalize header value for API calls

#### `lib/contentstack.ts`
Contentstack SDK helper that:
- Exports `getStack()` function to initialize Contentstack Stack instance
- Configures Stack with API key, delivery token, environment, and region from environment variables

### Setup Scripts

#### `scripts/setup-content.ts`
Automation script that:
- Creates the `personalized_content` content type in Contentstack
- Creates 5 sample entries with different content
- Publishes the content type and entries
- Verifies the setup was successful
- Run with: `npm run setup:content`

#### `scripts/setup-personalize.ts`
Helper script that:
- Fetches existing entries from Contentstack
- Displays variant configuration information
- Provides guidance on creating variants in Personalize Dashboard
- Shows what variants should be created for location and age group personalization
- Run with: `npm run setup:personalize`



#### `SETUP_GUIDE.md`
Comprehensive step-by-step setup guide that covers:
- Prerequisites checklist
- Content setup (content types and entries)
- Personalize project configuration
- Creating attributes, audiences, and experiences
- Testing personalization
- Troubleshooting common issues
- Includes screenshots for each step



## Getting Started

### Prerequisites

- Node.js installed (v18 or higher recommended)
- Contentstack account with a stack
- Personalize project created in Contentstack

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@contentstack/personalize-edge-sdk` - Contentstack Personalize SDK
- `@contentstack/delivery-sdk` - Contentstack JavaScript SDK
- Next.js, React, and other dependencies

### 2. Configure Environment Variables

Create a `.env` file in the root directory (you can use `sample-env` as a template):

```bash
cp sample-env .env
```

Fill in your Contentstack credentials:

```env
NEXT_PUBLIC_CONTENTSTACK_API_KEY=your_api_key_here
NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token_here
NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT=your_environment_here
NEXT_PUBLIC_CONTENTSTACK_REGION=us
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid_here
```

**Where to find these values:**
- **API Key & Delivery Token**: Contentstack Dashboard → Settings → Stack → API Key
- **Environment**: Your environment name (e.g., "production", "development")
- **Region**: Your stack region (us, eu, azure-na, azure-eu, etc.)
- **Personalize Project UID**: Contentstack Dashboard → Personalize → Your Project → Settings → General → Project Details

For detailed information, see [`ENV_VARIABLES.md`](./ENV_VARIABLES.md).

### 3. Set Up Content

Run the content setup script to create content types and sample entries:

```bash
npm run setup:content
```

This will:
- Create the `personalized_content` content type
- Create 5 sample entries
- Publish everything to your environment

### 4. Configure Personalize

Follow the detailed setup guide in [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) to:
- Create attributes (location, ageGroup)
- Create audiences (US Users, UK Users, Adult Users, etc.)
- Create experiences with variants
- Publish experiences

### 5. Update Entry UID

Edit `app/page.tsx` and update the `entryUid` with one of your entry UIDs:

```typescript
const entryUid = 'your_entry_uid_here';
```

You can find entry UIDs in Contentstack Dashboard → Content → Personalized Content → [Entry Name].

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Test Personalization

- Use the dropdown to select different attributes (Location: US/UK, or Default)
- The page will automatically fetch and display the personalized variant
- Variant information is displayed at the top of the content area
- Check the browser console for any errors

---

## How It Works

### Personalization Flow

1. **SDK Initialization**: Personalize SDK is initialized with project UID and user attributes
2. **Attribute Evaluation**: SDK evaluates which experiences match the provided attributes
3. **Variant Resolution**: SDK returns variant aliases for matched experiences
4. **Content Fetching**: Content Delivery API is called with variant aliases
5. **Content Delivery**: Contentstack returns the personalized variant content
6. **UI Update**: React component updates to display the variant content

### Key Concepts

- **Attributes**: User characteristics (location, ageGroup) used for personalization
- **Audiences**: User segments defined by attribute conditions
- **Experiences**: Personalization rules that link audiences to content variants
- **Variants**: Personalized versions of content entries
- **Variant Aliases**: Identifiers used to fetch specific variants from Content Delivery API

---

## Available Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality
- `npm run setup:content` - Run content setup script (creates content types and entries)
- `npm run setup:personalize` - Run personalize setup script (displays variant information)

---

## Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete step-by-step setup instructions with screenshots

---

## Resources

- [Contentstack Personalize Documentation](https://www.contentstack.com/docs/personalize)
- [Personalize Edge SDK Reference](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/reference)
- [Contentstack Content Delivery API](https://www.contentstack.com/docs/developers/apis/content-delivery-api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

---

## Troubleshooting

Common issues and solutions are documented in the [SETUP_GUIDE.md](./SETUP_GUIDE.md) troubleshooting section. Key things to check:

- Environment variables are set correctly
- Content type and entry UIDs are correct
- Personalize project is connected to your stack
- Attributes, audiences, and experiences are created and published
- Variant aliases match between Personalize and Contentstack

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Make sure to add all environment variables in your Vercel project settings.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
