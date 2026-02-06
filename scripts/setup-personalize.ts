

import * as contentstack from '@contentstack/management';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createCmaClient, CmaError } from './cma';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_KEY = process.env.CONTENTSTACK_API_KEY || process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || '';
const MANAGEMENT_TOKEN = process.env.NEXT_PUBLIC_CONTENTSTACK_MANAGEMENT_TOKEN || '';
const ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT || process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || '';
const REGION = process.env.CONTENTSTACK_REGION || process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || 'aws-na';
const PERSONALIZE_PROJECT_UID = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID || '';
const LOCALE = process.env.CONTENTSTACK_LOCALE || process.env.NEXT_PUBLIC_CONTENTSTACK_LOCALE || 'en-us';

// Flags
const SHOULD_CREATE_VARIANTS =
  (process.env.CONTENTSTACK_CREATE_ENTRY_VARIANTS || '').toLowerCase() === 'true';
const SHOULD_PUBLISH_VARIANTS =
  (process.env.CONTENTSTACK_PUBLISH_ENTRY_VARIANTS || '').toLowerCase() === 'true';

// Configuration
const CONTENT_TYPE_UID = 'personalized_content';

// Variant configurations for different user segments
interface VariantConfig {
  name: string;
  uid: string;
  entryTitle: string;
  entryUid?: string; // Will be fetched if not provided
  personalizeMetadata: {
    experience_uid?: string;
    experience_short_uid?: string;
    project_uid: string;
    variant_short_uid: string;
  };
  entryData: {
    title: string;
    description: string;
    content: string;
    cta_text?: string;
    cta_link?: string;
  };
}

type CreatedVariantInfo = {
  uid?: string;
  variant_uid?: string;
  name?: string;
  // keep index signature for any future fields
  [key: string]: unknown;
};

/**
 * Create an entry variant via CMA (REST).
 *
 * Doc reference: Create Entry Variant endpoint in CMA
 * `https://www.contentstack.com/docs/developers/apis/content-management-api#create-entry-variant`
 */
async function createEntryVariantViaCma(args: {
  entryUid: string;
  variant: VariantConfig;
}): Promise<CreatedVariantInfo> {
  const cma = createCmaClient({
    apiKey: API_KEY,
    managementToken: MANAGEMENT_TOKEN,
    region: REGION,
  });

  // NOTE: The exact schema is driven by the CMA docs.
  // We send the variant's entry fields under `entry`, and include personalize metadata
  // (project_uid + variant_short_uid) so Personalize can resolve the alias.
  const payload = {
    entry_variant: {
      uid: args.variant.uid,
      name: args.variant.name,
      locale: LOCALE,
      entry: args.variant.entryData,
      personalize: args.variant.personalizeMetadata,
    },
  };

  const res = await cma.request<{ entry_variant?: CreatedVariantInfo }>(
    'POST',
    `/v3/content_types/${CONTENT_TYPE_UID}/entries/${args.entryUid}/variants`,
    payload
  );

  return res.entry_variant || (res as unknown as CreatedVariantInfo);
}

/**
 * Publish an entry variant via CMA (REST).
 *
 * We keep this optional because some stacks prefer creating variants first,
 * then publishing after verification.
 */
async function publishEntryVariantViaCma(args: {
  entryUid: string;
  variantUid: string;
}): Promise<void> {
  const cma = createCmaClient({
    apiKey: API_KEY,
    managementToken: MANAGEMENT_TOKEN,
    region: REGION,
  });

  await cma.request(
    'POST',
    `/v3/content_types/${CONTENT_TYPE_UID}/entries/${args.entryUid}/variants/${args.variantUid}/publish`,
    {
      publishDetails: {
        environments: [ENVIRONMENT],
        locales: [LOCALE],
      },
    }
  );
}

/**
 * Fetch all entries of the content type
 */
async function fetchEntries(
  client: ReturnType<typeof contentstack.client>
): Promise<Array<{ uid: string; title: string }>> {
  try {
    const entries = await client
      .stack({ api_key: API_KEY, management_token: MANAGEMENT_TOKEN })
      .contentType(CONTENT_TYPE_UID)
      .entry()
      .query()
      .find();

    if (entries && Array.isArray(entries.items)) {
      return entries.items.map((entry: { uid: string; title?: string }) => ({
        uid: entry.uid,
        title: (entry as { title?: string }).title || 'Untitled',
      }));
    }
    return [];
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error fetching entries:', err?.message);
    return [];
  }
}


/**
 * Display entry variant configuration information
 * Note: Entry variants can be created via CMA REST (this script can do it),
 * or created automatically when you create experiences in Personalize Dashboard.
 */
async function displayVariantInfo(
  entryUid: string,
  variantConfig: VariantConfig
): Promise<void> {
  console.log(`ℹ️  Variant: "${variantConfig.name}"`);
  console.log(`   Entry UID: ${entryUid}`);
  console.log(`   Suggested Variant Name: ${variantConfig.name}`);
  console.log(`   Content Preview: ${variantConfig.entryData.title}`);
  console.log(
    SHOULD_CREATE_VARIANTS
      ? `   → This script will attempt to create this entry variant via CMA`
      : `   → Create this variant in Personalize Dashboard (or set CONTENTSTACK_CREATE_ENTRY_VARIANTS=true)`
  );
}


/**
 * Setup variants for location-based personalization
 */
async function setupLocationVariants(
  client: ReturnType<typeof contentstack.client>,
  baseEntryUid: string
): Promise<void> {
  console.log('\n🌍 Setting up location-based variants...');

  const locationVariants: VariantConfig[] = [
    {
      name: 'US Location Variant',
      uid: 'variant_us_location',
      entryTitle: 'Welcome US Users',
      personalizeMetadata: {
        project_uid: PERSONALIZE_PROJECT_UID,
        variant_short_uid: 'us_loc',
      },
      entryData: {
        title: 'Welcome US Users',
        description: 'Personalized message for users in the United States',
        content: 'Hello from the US! We\'re excited to have you here. Check out our US-specific offers and content.',
        cta_text: 'Explore US Content',
        cta_link: '/us-content',
      },
    },
    {
      name: 'UK Location Variant',
      uid: 'variant_uk_location',
      entryTitle: 'Welcome UK Users',
      personalizeMetadata: {
        project_uid: PERSONALIZE_PROJECT_UID,
        variant_short_uid: 'uk_loc',
      },
      entryData: {
        title: 'Welcome UK Users',
        description: 'Personalized message for users in the United Kingdom',
        content: 'Welcome, UK visitor! Discover our UK-specific content and offers tailored just for you.',
        cta_text: 'View UK Offers',
        cta_link: '/uk-offers',
      },
    },
  ];

  for (const variant of locationVariants) {
    await displayVariantInfo(baseEntryUid, variant);
    if (SHOULD_CREATE_VARIANTS) {
      try {
        const created = await createEntryVariantViaCma({ entryUid: baseEntryUid, variant });
        const createdUid = (created.uid || created.variant_uid) as string | undefined;
        console.log(`✅ Created entry variant "${variant.name}"${createdUid ? ` (UID: ${createdUid})` : ''}`);

        if (SHOULD_PUBLISH_VARIANTS && createdUid) {
          await publishEntryVariantViaCma({ entryUid: baseEntryUid, variantUid: createdUid });
          console.log(`   Published variant to ${ENVIRONMENT} (${LOCALE})`);
        } else if (SHOULD_PUBLISH_VARIANTS && !createdUid) {
          console.log(`⚠️  Variant created but UID missing in response; skipping publish.`);
        }
      } catch (error: unknown) {
        if (error instanceof CmaError) {
          console.error(`❌ CMA error creating/publishing variant "${variant.name}": ${error.status} ${error.statusText}`);
          if (error.responseBody) {
            console.error('   Response:', JSON.stringify(error.responseBody, null, 2));
          }
        } else {
          const err = error as { message?: string };
          console.error(`❌ Error creating/publishing variant "${variant.name}":`, err?.message || 'Unknown error');
        }
      }
    }
  }
}


/**
 * Main setup function
 */
async function main() {
  console.log('🎯 Starting Contentstack Personalize Variants Setup...\n');

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
  if (!PERSONALIZE_PROJECT_UID) {
    console.warn('⚠️  NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID not set. Variants will be created but may need manual configuration.');
  }

  console.log('Configuration:');
  console.log(`  API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`  Environment: ${ENVIRONMENT}`);
  console.log(`  Region: ${REGION}`);
  console.log(`  Personalize Project UID: ${PERSONALIZE_PROJECT_UID || 'Not set'}`);
  console.log(`  Locale: ${LOCALE}`);
  console.log(`  Create entry variants via CMA: ${SHOULD_CREATE_VARIANTS ? 'YES' : 'no'}`);
  console.log(`  Publish entry variants via CMA: ${SHOULD_PUBLISH_VARIANTS ? 'YES' : 'no'}`);

  // Initialize Management API client
  const client = contentstack.client({
    region: REGION as 'us' | 'eu' | 'azure-na' | 'azure-eu',
  });

  try {
    // Fetch existing entries
    console.log('\n📋 Fetching existing entries...');
    const entries = await fetchEntries(client);

    if (entries.length === 0) {
      console.log('❌ No entries found. Please run setup-content.ts first to create entries.');
      process.exit(1);
    }

    console.log(`✅ Found ${entries.length} entries:`);
    entries.forEach((entry) => {
      console.log(`   - ${entry.title} (UID: ${entry.uid})`);
    });

    // Use the first entry as the base entry for variants
    // You can modify this to use a specific entry
    const baseEntry = entries.find((e) => e.title.includes('Welcome to Our Platform')) || entries[0];
    console.log(`\n📌 Using entry "${baseEntry.title}" (${baseEntry.uid}) as base for variants`);

    console.log('\n📝 Entry Variant Information:');
    console.log(
      SHOULD_CREATE_VARIANTS
        ? '   This run will attempt to create entry variants via the CMA REST API.'
        : '   This run will only show variant configs (no API writes).'
    );
    console.log('   You can also create variants automatically when you create experiences in Personalize Dashboard.\n');

    // Setup location-based variants (just for information)
    await setupLocationVariants(client, baseEntry.uid);

    console.log('\n✅ Personalize setup information provided!');
    console.log('\n📋 Next steps (IMPORTANT - Do these in Personalize Dashboard):');
    console.log('   1. Go to Contentstack Dashboard → Personalize → Your Project');
    console.log('   2. Create Attributes (if not already done):');
    console.log('      - Name: location, Key: location');
    console.log('   3. Create Experiences (this is where variants are created):');
    console.log('      - Go to Experiences → Create Experience');
    console.log('      - Select your entry: "Welcome to Our Platform"');
    console.log('      - Add Audience Condition:');
    console.log('        * Attribute: location (select from dropdown)');
    console.log('        * Operator: equals');
    console.log('        * Value: us');
    console.log('      - Create Variant:');
    console.log('        * When you create a variant in the experience, it will create the entry variant');
    console.log('        * Customize the content fields (title, description, content, etc.)');
    console.log('        * This creates the variant automatically');
    console.log('      - Save and Publish the experience');
    console.log('   4. Repeat for other variants (UK, etc.)');
    console.log('   5. Test personalization in your app\n');
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

