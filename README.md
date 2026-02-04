This is a [Next.js](https://nextjs.org) project with [Contentstack Personalize](https://www.contentstack.com/docs/personalize) integration.

## Contentstack Personalize Demo

This project demonstrates a simple implementation of Contentstack Personalize, showing how to:
- Fetch content entries from Contentstack CMS
- Apply personalization based on user attributes
- Display different content variants based on selected attributes

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@contentstack/personalize-edge-sdk` - Contentstack Personalize SDK
- `contentstack` - Contentstack JavaScript SDK

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env.local
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

### 3. Update Content Type and Entry UIDs

Edit `app/page.tsx` and update these values:
- `contentTypeUid`: Your content type UID
- `entryUid`: Your entry UID that has personalization variants set up

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 5. Test Personalization

- Use the dropdowns to select different attributes (Location, Age Group)
- The page will automatically fetch and display the personalized variant based on your selections
- The variant information will be displayed at the top of the content area

## How It Works

1. **Initialization**: The Personalize SDK is initialized with your project UID
2. **Attribute Setting**: User attributes are set based on dropdown selections
3. **Content Fetching**: Content is fetched from Contentstack with Personalize headers
4. **Variant Resolution**: Contentstack automatically resolves the correct variant based on attributes
5. **Impression Tracking**: Variant impressions are tracked using `triggerImpression()`

## Resources

- [Contentstack Personalize Documentation](https://www.contentstack.com/docs/personalize)
- [Personalize Edge SDK Reference](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/reference)
- [Contentstack Content Delivery API](https://www.contentstack.com/docs/developers/apis/content-delivery-api)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
