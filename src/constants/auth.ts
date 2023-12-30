export const officialAPIEndpoint =
  import.meta.env.VITE_OFFICIAL_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';

export const customAPIEndpoint =
  import.meta.env.VITE_CUSTOM_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';

export const defaultAPIEndpoint =
  import.meta.env.VITE_DEFAULT_API_ENDPOINT || officialAPIEndpoint;

export const availableEndpoints = [officialAPIEndpoint, customAPIEndpoint];


