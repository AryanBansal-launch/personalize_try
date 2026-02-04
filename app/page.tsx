'use client';

import { useState, useEffect, useCallback } from 'react';
import Contentstack from '@contentstack/delivery-sdk';
import {
  getActiveExperiences,
  getVariantAliases,
  reinitializePersonalize,
} from '@/lib/personalize';

interface ContentEntry {
  title?: string;
  description?: string;
  content?: string | unknown;
  publish_details?: {
    variants?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

export default function Home() {
  const [entry, setEntry] = useState<ContentEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<string>('default');
  const [variantInfo, setVariantInfo] = useState<string>('');

  const initializeAndFetch = useCallback(async () => {
    // Fetch entry from Contentstack
    // Replace 'content_type_uid' and 'entry_uid' with your actual values
    const contentTypeUid = 'personalized_content'; // Update this
    const entryUid = 'blt24da7724269342c0'; // Update this

    try {
      setLoading(true);
      setError(null);

      // Initialize Contentstack Stack
      const Stack = Contentstack.stack({
        apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || '',
        deliveryToken: process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN || '',
        environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || '',
        region: process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || 'us',
      });

      // Initialize Personalize SDK
      const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID || '';
      if (!projectUid) {
        throw new Error('Personalize Project UID is not configured');
      }

      // Parse the selected location attribute
      // Format: "location:us", "location:uk", or "default"
      const userAttributes: { location?: string } = {};
      if (selectedAttribute === 'default') {
        // Default: don't send any location attribute, will fall back to base entry
        // userAttributes remains empty
      } else {
        const [key, value] = selectedAttribute.split(':');
        if (key === 'location') {
          userAttributes.location = value;
        }
      }

      // Log the attributes being sent to Personalize
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Personalize Attributes Being Sent:');
      console.log('  Selected Attribute:', selectedAttribute);
      if (selectedAttribute === 'default') {
        console.log('  ⚠️  Default selected - no attributes sent, will fetch base entry');
      } else {
        const [key, value] = selectedAttribute.split(':');
        console.log('  Parsed Key:', key);
        console.log('  Parsed Value:', value);
      }
      console.log('  Attributes Object (before sending):', JSON.parse(JSON.stringify(userAttributes)));
      if (userAttributes.location) {
        console.log('  ✅ Location:', userAttributes.location);
      } else {
        console.log('  ❌ Location: NOT SET (will use base entry)');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Initialize Personalize with ONLY the selected user attributes
      // This should replace any previous attributes
      await reinitializePersonalize(projectUid, userAttributes);

      // Get active experiences
      const activeExperiences = getActiveExperiences();
      console.log('✅ Active Experiences:', activeExperiences);

      // Analyze which experiences matched and which didn't
      const matchedExperiences = activeExperiences.filter(
        (exp: { shortUid?: string; activeVariantShortUid?: string | null }) =>
          exp.activeVariantShortUid !== null && exp.activeVariantShortUid !== undefined
      );
      const unmatchedExperiences = activeExperiences.filter(
        (exp: { shortUid?: string; activeVariantShortUid?: string | null }) =>
          exp.activeVariantShortUid === null || exp.activeVariantShortUid === undefined
      );

      console.log('\n📋 Experience Matching Analysis:');
      console.log(`   Total Experiences: ${activeExperiences.length}`);
      console.log(`   ✅ Matched: ${matchedExperiences.length} experience(s)`);
      matchedExperiences.forEach((exp: { shortUid?: string; activeVariantShortUid?: string | null }) => {
        console.log(`      - Experience "${exp.shortUid}" → Variant "${exp.activeVariantShortUid}"`);
      });
      console.log(`   ❌ Not Matched: ${unmatchedExperiences.length} experience(s)`);
      unmatchedExperiences.forEach((exp: { shortUid?: string }) => {
        console.log(`      - Experience "${exp.shortUid}" (no matching variant)`);
      });

      // Get variant aliases to pass to Content Delivery API
      const variantAliases = getVariantAliases();
      console.log('\n✅ Variant Aliases:', variantAliases);
      
      // Log which attributes determined these variants
      console.log('\n🎯 Variant Matching Logic:');
      if (userAttributes.location) {
        console.log(`   Attributes sent: location="${userAttributes.location}"`);
      } else {
        console.log(`   Attributes sent: none`);
      }
      console.log(`   Personalize evaluates each experience's audience conditions:`);
      console.log(`   - If audience uses AND: all conditions must match`);
      console.log(`   - If audience uses OR: any condition can match`);
      console.log(`   - Result: ${variantAliases.length} variant(s) active from ${matchedExperiences.length} matched experience(s)`);
      
      if (matchedExperiences.length > 0) {
        console.log(`\n💡 The matched experiences have audiences that include:`);
        if (userAttributes.location) {
          console.log(`   - Location: "${userAttributes.location}"`);
        }
        console.log(`   (Check your Personalize Dashboard to see the exact AND/OR conditions)`);
      }

      console.log(`Fetching entry: ${entryUid} from content type: ${contentTypeUid}`);

      // Build the entry query
      const entryCall = Stack.contentType(contentTypeUid).entry(entryUid);
      
      console.log('\n📤 Fetching from Content Delivery API:');
      console.log('   Variant Aliases:', variantAliases);
      
      let result;
      if (variantAliases && variantAliases.length > 0) {
        // Convert variant aliases array to comma-separated string
        const variantAlias = variantAliases.join(',');
        console.log('   ✅ Fetching entry with variants:', variantAlias);
        // Use .variants() method to fetch variant content
        result = await entryCall.variants(variantAlias).fetch();
      } else {
        console.log('   ⚠️  No variants active, fetching base entry');
        // Fetch the entry without variant aliases
        result = await entryCall.fetch();
      }

      // Log the raw result for debugging
      console.log('Contentstack API Response:', result);
      console.log('Result type:', typeof result);
      console.log('Is array:', Array.isArray(result));

      // Handle the result - it might be an array or a single entry
      let fetchedEntry: ContentEntry | null = null;
      if (Array.isArray(result) && result.length > 0) {
        fetchedEntry = result[0]?.toJSON() as ContentEntry;
      } else if (result && typeof result === 'object' && 'toJSON' in result) {
        fetchedEntry = (result as { toJSON: () => ContentEntry }).toJSON();
      } else if (result && typeof result === 'object') {
        // Try to handle direct object response
        fetchedEntry = result as ContentEntry;
      }

      if (!fetchedEntry) {
        console.error('Failed to parse entry. Raw result:', result);
        throw new Error(`Entry not found or invalid response. Check console for details. Entry UID: ${entryUid}, Content Type: ${contentTypeUid}`);
      }

      setEntry(fetchedEntry);

      // Display variant information
      if (variantAliases && Array.isArray(variantAliases) && variantAliases.length > 0) {
        const variantInfoText = `Active Variants: ${variantAliases.join(', ')}`;
        
        // Display active experiences info
        if (activeExperiences && Array.isArray(activeExperiences) && activeExperiences.length > 0) {
          const experiencesInfo = activeExperiences
            .map((exp: { shortUid?: string; activeVariantShortUid?: string | null }) => {
              if (exp.shortUid && exp.activeVariantShortUid) {
                return `Experience ${exp.shortUid} → Variant ${exp.activeVariantShortUid}`;
              }
              return null;
            })
            .filter((info: string | null) => info !== null)
            .join(', ');
          
          if (experiencesInfo) {
            setVariantInfo(`${variantInfoText} | ${experiencesInfo}`);
          } else {
            setVariantInfo(variantInfoText);
          }
        } else {
          setVariantInfo(variantInfoText);
        }
      } else {
        setVariantInfo('Default content (no variant matched)');
      }
      
      // Check for variant information in the entry response
      console.log('\n📦 Entry Response Analysis:');
      console.log('Fetched Entry:', fetchedEntry);
      console.log('Entry Title:', fetchedEntry.title);
      console.log('Entry Description:', fetchedEntry.description);
      console.log('Entry UID:', fetchedEntry.uid);
      
      // Check if entry has variant-specific content
      const hasVariants = fetchedEntry.publish_details?.variants;
      if (hasVariants && typeof hasVariants === 'object') {
        const variants = hasVariants as Record<string, unknown>;
        const variantKeys = Object.keys(variants);
        console.log('✅ Entry variants in publish_details:', variantKeys);
        console.log('Variant details:', variants);
      } else {
        console.log('❌ No variants found in publish_details.');
        console.log('Full publish_details:', fetchedEntry.publish_details);
        console.log('\n⚠️  IMPORTANT: This entry does not have personalized variants configured.');
        console.log('   To see personalized content, you need to:');
        console.log('   1. Go to Contentstack Dashboard → Personalize → Your Project');
        console.log('   2. Open the experience (e.g., experience "c" or "e")');
        console.log('   3. Link this entry (UID: ' + entryUid + ') to the experience');
        console.log('   4. Create variants within the experience and customize the entry content for each variant');
        console.log('   5. Publish the experience');
        console.log('\n   Currently, the Personalize SDK is detecting variants, but the entry');
        console.log('   itself doesn\'t have variant-specific content configured in the dashboard.');
      }
      
      // Check if the entry content matches any variant
      console.log('\n🔍 Checking if entry content is variant-specific:');
      console.log('   Current content is the base/default entry content.');
      console.log('   If variants were configured, the content would be different based on the x-personalize header.');
    } catch (err) {
      console.error('Error fetching content:', err);
      
      // Extract more detailed error information
      let errorMessage = 'Failed to fetch content. Please check your configuration.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as { message?: string; errors?: unknown; status?: number; statusText?: string };
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.status && errorObj.statusText) {
          errorMessage = `API Error ${errorObj.status}: ${errorObj.statusText}`;
        } else if (errorObj.errors) {
          errorMessage = `API Error: ${JSON.stringify(errorObj.errors)}`;
        }
      }
      
      // Add helpful context
      errorMessage += `\n\nDebug Info:\n- Content Type: ${contentTypeUid}\n- Entry UID: ${entryUid}\n- Check browser console for full error details.`;
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedAttribute]); // Re-fetch when attribute selection changes

  useEffect(() => {
    initializeAndFetch();
  }, [initializeAndFetch]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-16 px-8 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <h1 className="text-4xl font-bold mb-8 text-black dark:text-zinc-50">
            Contentstack Personalize Demo
          </h1>

          {/* Attribute Selection Dropdown */}
          <div className="mb-8 p-6 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Select User Attributes
            </h2>
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
                Attribute
              </label>
              <select
                value={selectedAttribute}
                onChange={(e) => setSelectedAttribute(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
              >
                <option value="default">Default (Base Entry)</option>
                <option value="location:us">Location: US</option>
                <option value="location:uk">Location: UK</option>
              </select>
            </div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Change the attribute to see different personalized content variants. Select &quot;Default&quot; to see the base entry (no personalization).
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-zinc-600 dark:text-zinc-400">Loading personalized content...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-semibold">Error:</p>
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Please make sure you have:
                <br />1. Installed packages: npm install @contentstack/personalize-edge-sdk contentstack
                <br />2. Created .env.local with your Contentstack credentials
                <br />3. Updated contentTypeUid and entryUid in the code
              </p>
            </div>
          )}

          {/* Content Display */}
          {entry && !loading && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  {variantInfo}
                </p>
              </div>

              <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                {entry.title && (
                  <h2 className="text-3xl font-bold mb-4 text-black dark:text-zinc-50">
                    {entry.title}
                  </h2>
                )}
                {entry.description && (
                  <p className="text-lg mb-4 text-zinc-700 dark:text-zinc-300">
                    {entry.description}
                  </p>
                )}
                {(() => {
                  const content = entry.content;
                  if (!content) return null;
                  return (
                    <div className="prose dark:prose-invert text-zinc-600 dark:text-zinc-400">
                      {typeof content === 'string' ? (
                        <p>{content}</p>
                      ) : (
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(content as Record<string, unknown>, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })()}
                {!entry.title && !entry.description && !entry.content && (
                  <div>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                      Entry fetched successfully. Here&apos;s the raw data:
                    </p>
                    <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg overflow-auto text-sm">
                      {JSON.stringify(entry, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
