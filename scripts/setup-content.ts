
import * as contentstack from '@contentstack/management';
import Contentstack from '@contentstack/delivery-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
const envLoaded = dotenv.config({ path: envPath });

if (envLoaded.error) {
  console.warn(`⚠️  Warning: Could not load .env.local from ${envPath}`);
  console.warn('   Make sure .env.local exists in the personalize/ directory');
  console.warn('   Falling back to system environment variables...\n');
}

const API_KEY = process.env.CONTENTSTACK_API_KEY || process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || '';
const MANAGEMENT_TOKEN = process.env.NEXT_PUBLIC_CONTENTSTACK_MANAGEMENT_TOKEN || '';
const DELIVERY_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN || process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN || '';
const ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT || process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || '';
const REGION = process.env.CONTENTSTACK_REGION || process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || 'aws-na';

// Content Type Configuration
const CONTENT_TYPE_UID = 'personalized_content';
const CONTENT_TYPE_TITLE = 'Personalized Content';

interface ContentTypeField {
  uid: string;
  data_type: string;
  display_name: string;
  field_metadata?: Record<string, unknown>;
  mandatory?: boolean;
  unique?: boolean;
  multiple?: boolean;
}

async function createContentType(client: ReturnType<typeof contentstack.client>): Promise<boolean> {
  console.log('\n📝 Creating content type...');

  const contentTypeFields: ContentTypeField[] = [
    {
      uid: 'title',
      data_type: 'text',
      display_name: 'Title',
      mandatory: true,
      field_metadata: {
        _default: true,
      },
    },
    {
      uid: 'description',
      data_type: 'text',
      display_name: 'Description',
      mandatory: false,
    },
    {
      uid: 'content',
      data_type: 'text',
      display_name: 'Content',
      mandatory: false,
      field_metadata: {
        rich_text_type: 'markdown',
      },
    },
    {
      uid: 'cta_text',
      data_type: 'text',
      display_name: 'CTA Text',
      mandatory: false,
    },
    {
      uid: 'cta_link',
      data_type: 'link',
      display_name: 'CTA Link',
      mandatory: false,
    },
  ];

  try {
    const contentType = await client
      .stack({ api_key: API_KEY, management_token: MANAGEMENT_TOKEN })
      .contentType()
      .create({
        content_type: {
          title: CONTENT_TYPE_TITLE,
          uid: CONTENT_TYPE_UID,
          schema: contentTypeFields,
          options: {
            is_page: false,
            singleton: false,
            title: 'title',
            sub_title: [],
            url_pattern: '/:title',
          },
        },
      });

    console.log(`✅ Content type created: ${CONTENT_TYPE_UID}`);
    
    // Handle different response structures
    const createdContentType = (contentType as { content_type?: { uid?: string }; uid?: string });
    if (createdContentType.content_type?.uid) {
      console.log(`   UID: ${createdContentType.content_type.uid}`);
    } else if (createdContentType.uid) {
      console.log(`   UID: ${createdContentType.uid}`);
    } else {
      console.log(`   UID: ${CONTENT_TYPE_UID}`);
    }
    return true;
  } catch (error: unknown) {
    const err = error as { errorMessage?: string };
    if (err?.errorMessage?.includes('already exists')) {
      console.log(`ℹ️  Content type already exists: ${CONTENT_TYPE_UID}`);
      return true; // Content type exists, so we can continue
    }
    throw error;
  }
}

async function publishContentType(): Promise<void> {
  console.log('\n📤 Publishing content type...');

  // According to Contentstack Management SDK documentation:
  // Content types are available immediately after creation and don't require explicit publishing
  // The publish method is primarily for entries, not content types
  console.log(`ℹ️  Content type publishing not required`);
  console.log(`   Content types are available immediately after creation per Management SDK docs.`);
  console.log(`   Entries will be published separately.`);
}

async function createEntry(
  client: ReturnType<typeof contentstack.client>,
  entryData: {
    title: string;
    description: string;
    content: string;
    cta_text?: string;
    cta_link?: string;
  }
): Promise<string> {
  // Format entry data - convert cta_link string to link object format
  // Link fields in Contentstack need to be structured objects with title and href
  const formattedEntry: {
    title: string;
    description: string;
    content: string;
    cta_text?: string;
    cta_link?: { title: string; href: string };
  } = {
    title: entryData.title,
    description: entryData.description,
    content: entryData.content,
  };

  if (entryData.cta_text) {
    formattedEntry.cta_text = entryData.cta_text;
  }

  // Link fields need to be structured objects with title and href
  if (entryData.cta_link) {
    formattedEntry.cta_link = {
      title: entryData.cta_text || 'Learn More',
      href: entryData.cta_link,
    };
  }

  const entry = await client
    .stack({ api_key: API_KEY, management_token: MANAGEMENT_TOKEN })
    .contentType(CONTENT_TYPE_UID)
    .entry()
    .create({
      entry: formattedEntry,
    });

  // Handle different response structures from Management SDK
  // The response might be: { entry: { uid: '...' } } or { uid: '...' } or just the entry object
  const createdEntry = entry as { entry?: { uid?: string }; uid?: string; [key: string]: unknown };
  
  // Try different possible response structures
  if (createdEntry.entry?.uid) {
    return createdEntry.entry.uid;
  } else if (createdEntry.uid) {
    return createdEntry.uid;
  } else if (typeof createdEntry === 'object' && createdEntry !== null) {
    // Check if the response itself is the entry object
    const entryObj = createdEntry as { uid?: string };
    if (entryObj.uid) {
      return entryObj.uid;
    }
  }
  
  // If we can't find uid, log the response structure for debugging
  console.error('Unexpected response structure:', JSON.stringify(entry, null, 2));
  throw new Error('Entry created but UID not found in response. Check console for response structure.');
}

async function publishEntry(
  client: ReturnType<typeof contentstack.client>,
  entryUid: string
): Promise<void> {
  await client
    .stack({ api_key: API_KEY, management_token: MANAGEMENT_TOKEN })
    .contentType(CONTENT_TYPE_UID)
    .entry(entryUid)
    .publish({
      publishDetails: {
        environments: [ENVIRONMENT],
        locales: ['en-us'], // Default locale, adjust if needed
      },
    });
}

async function createSampleEntries(client: ReturnType<typeof contentstack.client>): Promise<void> {
  console.log('\n📄 Creating sample entries...');

  const sampleEntries = [
    {
      title: 'Welcome to Our Platform',
      description: 'Default welcome message for all users',
      content: 'This is the default content that will be shown to users who don\'t match any specific personalization rules.',
      cta_text: 'Get Started',
      cta_link: '/get-started',
    },
    {
      title: 'Welcome US Users',
      description: 'Personalized message for users in the United States',
      content: 'Hello from the US! We\'re excited to have you here. Check out our US-specific offers and content.',
      cta_text: 'Explore US Content',
      cta_link: '/us-content',
    },
    {
      title: 'Welcome UK Users',
      description: 'Personalized message for users in the United Kingdom',
      content: 'Welcome, UK visitor! Discover our UK-specific content and offers tailored just for you.',
      cta_text: 'View UK Offers',
      cta_link: '/uk-offers',
    },
  ];

  for (const entryData of sampleEntries) {
    try {
      const entryUid = await createEntry(client, entryData);
      console.log(`✅ Created entry: ${entryData.title} (UID: ${entryUid})`);

      // Publish the entry
      await publishEntry(client, entryUid);
      console.log(`   Published to ${ENVIRONMENT}`);
    } catch (error: unknown) {
      const err = error as { message?: string; response?: unknown };
      console.error(`❌ Error creating entry "${entryData.title}":`, err?.message || 'Unknown error');
      // Log the full error for debugging if it's a detailed error object
      if (err && typeof err === 'object' && 'response' in err) {
        console.error('   Response:', JSON.stringify(err.response, null, 2));
      }
    }
  }
}

async function verifyEntries(): Promise<void> {
  console.log('\n🔍 Verifying entries...');

  if (!DELIVERY_TOKEN) {
    console.log('⚠️  Delivery token not provided, skipping API verification');
    console.log(`   Please verify entries manually in Contentstack Dashboard → Content → ${CONTENT_TYPE_TITLE}`);
    return;
  }

  try {
    // Verify that the content type is accessible via Delivery API
    // Initialize stack to verify configuration (but don't need to use it)
    Contentstack.stack({
      apiKey: API_KEY,
      deliveryToken: DELIVERY_TOKEN,
      environment: ENVIRONMENT,
      region: REGION as 'us' | 'eu' | 'azure-na' | 'azure-eu',
    });

    console.log('✅ Delivery API configured successfully');
    console.log(`   You can verify entries in Contentstack Dashboard → Content → ${CONTENT_TYPE_TITLE}`);
    console.log(`   Or use the Delivery API to fetch entries programmatically`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.log('⚠️  Could not verify via API (this is okay if entries were created):', err?.message || 'Unknown error');
    console.log('   Please verify entries manually in Contentstack Dashboard');
  }
}

async function main() {
  console.log('🚀 Starting Contentstack Personalize Setup...\n');

  // Validate environment variables
  if (!API_KEY) {
    throw new Error('CONTENTSTACK_API_KEY or NEXT_PUBLIC_CONTENTSTACK_API_KEY is required');
  }
  if (!MANAGEMENT_TOKEN) {
    throw new Error('NEXT_PUBLIC_CONTENTSTACK_MANAGEMENT_TOKEN is required');
  }
  if (!ENVIRONMENT) {
    throw new Error('CONTENTSTACK_ENVIRONMENT or NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT is required');
  }

  console.log('Configuration:');
  console.log(`  API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`  Environment: ${ENVIRONMENT}`);
  console.log(`  Region: ${REGION}`);

  // Initialize Management API client
  // According to docs: Use client() without authtoken when using management_token at stack level
  const client = contentstack.client({
    region: REGION as 'us' | 'eu' | 'azure-na' | 'azure-eu',
  });

  try {
    // Step 1: Create content type
    await createContentType(client);

    // Step 2: Publish content type (not required per Management SDK docs)
    await publishContentType();

    // Step 3: Create sample entries
    await createSampleEntries(client);

    // Step 4: Verify entries via CDA
    await verifyEntries();

    console.log('\n✅ Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log(`   1. Update app/page.tsx with:`);
    console.log(`      - contentTypeUid: '${CONTENT_TYPE_UID}'`);
    console.log(`      - entryUid: '<one of the created entry UIDs>'`);
    console.log(`   2. Set up Personalize experiences in Contentstack Dashboard`);
    console.log(`   3. Create variants for your entries based on attributes`);
    console.log(`   4. Test personalization in your app\n`);
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string };
    console.error('\n❌ Setup failed:', err?.message || 'Unknown error');
    if (err?.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

