import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Enhanced storage utilities with error handling and type safety
 */

export class StorageService {
  /**
   * Store data with type safety and error handling
   */
  static async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve data with type safety and fallback
   */
  static async getItem<T>(key: string, fallback?: T): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        return fallback ?? null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return fallback ?? null;
    }
  }

  /**
   * Remove item from storage
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all storage (use carefully!)
   */
  static async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get multiple items efficiently
   */
  static async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      return pairs.reduce((acc, [key, value]) => {
        acc[key] = value ? JSON.parse(value) : null;
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error('Failed to get multiple items:', error);
      return {};
    }
  }

  /**
   * Set multiple items efficiently
   */
  static async multiSet(keyValuePairs: Array<[string, any]>): Promise<boolean> {
    try {
      const stringifiedPairs: readonly [string, string][] = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(stringifiedPairs);
      return true;
    } catch (error) {
      console.error('Failed to set multiple items:', error);
      return false;
    }
  }

  /**
   * Get storage usage info (useful for debugging)
   */
  static async getStorageInfo(): Promise<{
    keys: string[];
    totalSize: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      const totalSize = pairs.reduce((size, [, value]) => {
        return size + (value?.length || 0);
      }, 0);

      return { keys: keys as string[], totalSize };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { keys: [], totalSize: 0 };
    }
  }
}