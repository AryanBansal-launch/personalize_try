import Personalize from '@contentstack/personalize-edge-sdk';

interface PersonalizeAttributes {
  location?: string;
  [key: string]: string | undefined;
}

interface PersonalizeSdkInstance {
  set: (attributes: PersonalizeAttributes) => Promise<void>;
  getExperiences: () => Array<{ shortUid?: string; activeVariantShortUid?: string | null }>;
  getVariantAliases: () => string[];
}

let personalizeSdkInstance: PersonalizeSdkInstance | null = null;

/**
 * Initialize the Personalize SDK with project UID and optional attributes
 * @param projectUid - Your Personalize Project UID
 * @param attributes - Optional user attributes to set as live attributes
 * @returns The initialized SDK instance
 */
export async function initializePersonalize(
  projectUid: string,
  attributes?: PersonalizeAttributes
): Promise<PersonalizeSdkInstance> {
  if (!projectUid) {
    throw new Error('Personalize Project UID is required');
  }

  // Initialize SDK with live attributes for real-time variant evaluation
  const attributesToUse = attributes || {};
  const hasAttributes = attributes && Object.keys(attributes).length > 0;
  
  console.log('[Personalize SDK] Initializing with liveAttributes:', attributesToUse);
  console.log('[Personalize SDK] Has attributes:', hasAttributes);
  
  const sdk = await Personalize.init(projectUid, {
    liveAttributes: attributesToUse,
  });

  // Set attributes for persistence (if provided)
  // IMPORTANT: set() should REPLACE all previous attributes, not merge them
  if (hasAttributes) {
    console.log('[Personalize SDK] Setting attributes (replacing previous):', attributes);
    await sdk.set(attributes);
  } else {
    console.log('[Personalize SDK] No attributes to set, explicitly clearing all previous attributes');
    // If no attributes provided, set empty object to clear previous attributes
    // This should force the SDK to fetch a fresh manifest with no attribute matches
    await sdk.set({});
    console.log('[Personalize SDK] Attributes cleared, manifest should refresh');
  }

  personalizeSdkInstance = sdk;
  return sdk;
}

/**
 * Update user attributes in the Personalize SDK
 * @param attributes - User attributes to update
 */
export async function updatePersonalizeAttributes(
  attributes: PersonalizeAttributes
): Promise<void> {
  if (!personalizeSdkInstance) {
    throw new Error('Personalize SDK not initialized. Call initializePersonalize first.');
  }

  await personalizeSdkInstance.set(attributes);
}

/**
 * Get active experiences from Personalize
 * @returns Array of active experiences with their variant information
 */
export function getActiveExperiences(): Array<{
  shortUid?: string;
  activeVariantShortUid?: string | null;
}> {
  if (!personalizeSdkInstance) {
    throw new Error('Personalize SDK not initialized. Call initializePersonalize first.');
  }

  return personalizeSdkInstance.getExperiences();
}

/**
 * Get variant aliases for Content Delivery API
 * @returns Array of variant alias strings to pass to Content Delivery API
 */
export function getVariantAliases(): string[] {
  if (!personalizeSdkInstance) {
    throw new Error('Personalize SDK not initialized. Call initializePersonalize first.');
  }

  return personalizeSdkInstance.getVariantAliases();
}

/**
 * Get the Personalize header value for Content Delivery API
 * @returns The x-personalize header value (comma-separated variant aliases)
 */
export function getPersonalizeHeader(): string | null {
  const variantAliases = getVariantAliases();
  if (variantAliases && variantAliases.length > 0) {
    return variantAliases.join(',');
  }
  return null;
}

/**
 * Re-initialize Personalize with new attributes
 * This is useful when attributes change and you need to refresh the manifest
 * IMPORTANT: This will REPLACE all previous attributes with only the provided ones
 * @param projectUid - Your Personalize Project UID
 * @param attributes - New user attributes (only these will be set, others will be cleared)
 * @returns The re-initialized SDK instance
 */
export async function reinitializePersonalize(
  projectUid: string,
  attributes: PersonalizeAttributes
): Promise<PersonalizeSdkInstance> {
  // Clean the attributes object to remove undefined values
  const cleanAttributes: PersonalizeAttributes = {};
  Object.keys(attributes).forEach((key) => {
    if (attributes[key] !== undefined) {
      cleanAttributes[key] = attributes[key];
    }
  });

  console.log('[Personalize SDK] Reinitializing with attributes:', cleanAttributes);
  console.log('[Personalize SDK] Previous attributes will be replaced/cleared');

  // Reset the SDK instance to force a fresh initialization
  // This helps clear any cached manifest from previous attribute values
  personalizeSdkInstance = null;

  // Initialize with only the clean attributes
  // The SDK's set() method should replace all previous attributes
  return initializePersonalize(projectUid, cleanAttributes);
}

