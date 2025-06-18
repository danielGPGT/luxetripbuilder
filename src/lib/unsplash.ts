import { createApi } from 'unsplash-js';

// Initialize Unsplash API
const unsplash = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '',
});

export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

export async function searchDestinationImage(destination: string): Promise<UnsplashImage | null> {
  try {
    if (!import.meta.env.VITE_UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not found');
      return null;
    }

    const result = await unsplash.search.getPhotos({
      query: `${destination} luxury travel`,
      page: 1,
      perPage: 1,
      orientation: 'landscape',
    });

    if (result.response?.results && result.response.results.length > 0) {
      return result.response.results[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return null;
  }
}

export async function searchActivityImage(activity: string, destination: string): Promise<UnsplashImage | null> {
  try {
    if (!import.meta.env.VITE_UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not found');
      return null;
    }

    const result = await unsplash.search.getPhotos({
      query: `${activity} ${destination}`,
      page: 1,
      perPage: 1,
      orientation: 'landscape',
    });

    if (result.response?.results && result.response.results.length > 0) {
      return result.response.results[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return null;
  }
} 