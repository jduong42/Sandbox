/**
 * ONNX Model Manager
 * Handles loading and managing large ONNX models in React Native
 */

import RNFS from 'react-native-fs';
import { logger } from '../utils/logger';

export class ONNXModelManager {
  private static instance: ONNXModelManager;
  private modelPath: string | null = null;
  private isModelReady = false;

  private constructor() {}

  static getInstance(): ONNXModelManager {
    if (!ONNXModelManager.instance) {
      ONNXModelManager.instance = new ONNXModelManager();
    }
    return ONNXModelManager.instance;
  }

  /**
   * Initialize and check model availability
   */
  async initialize(): Promise<boolean> {
    try {
      logger.info('🔍 Checking for ONNX model files...');

      // Check if model files exist in the bundle (directly in bundle root)
      const bundleModelPath = `${RNFS.MainBundlePath}/model.onnx`;
      const bundleDataPath = `${RNFS.MainBundlePath}/model.onnx_data`;

      const modelExists = await RNFS.exists(bundleModelPath);
      const dataExists = await RNFS.exists(bundleDataPath);

      if (modelExists && dataExists) {
        this.modelPath = bundleModelPath;
        this.isModelReady = true;
        logger.info('✅ ONNX model files found in bundle');
        return true;
      }

      // Check if model exists in documents directory (downloaded)
      const documentsModelPath = `${RNFS.DocumentDirectoryPath}/models/model.onnx`;
      const documentsDataPath = `${RNFS.DocumentDirectoryPath}/models/model.onnx_data`;

      const docModelExists = await RNFS.exists(documentsModelPath);
      const docDataExists = await RNFS.exists(documentsDataPath);

      if (docModelExists && docDataExists) {
        this.modelPath = documentsModelPath;
        this.isModelReady = true;
        logger.info('✅ ONNX model files found in documents directory');
        return true;
      }

      logger.warn('⚠️ ONNX model files not found');
      return false;
    } catch (error) {
      logger.error('❌ Failed to initialize ONNX model manager:', error);
      return false;
    }
  }

  /**
   * Get the path to the ONNX model
   */
  getModelPath(): string | null {
    return this.modelPath;
  }

  /**
   * Check if model is ready for use
   */
  isReady(): boolean {
    return this.isModelReady;
  }

  /**
   * Get model info
   */
  async getModelInfo(): Promise<{
    path: string | null;
    exists: boolean;
    size?: number;
    location: 'bundle' | 'documents' | 'none';
  }> {
    if (!this.modelPath) {
      return {
        path: null,
        exists: false,
        location: 'none',
      };
    }

    try {
      const stats = await RNFS.stat(this.modelPath);
      const location = this.modelPath.includes('MainBundle')
        ? 'bundle'
        : 'documents';

      return {
        path: this.modelPath,
        exists: true,
        size: stats.size,
        location,
      };
    } catch (error) {
      return {
        path: this.modelPath,
        exists: false,
        location: 'none',
      };
    }
  }

  /**
   * Static method to get model info without initialization (for testing)
   */
  static async getModelInfo(): Promise<{
    exists: boolean;
    location: string;
    path?: string;
    size?: number;
  }> {
    try {
      // Check bundle first (priority for testing)
      const bundleModelPath = `${RNFS.MainBundlePath}/model.onnx`;
      const bundleDataPath = `${RNFS.MainBundlePath}/model.onnx_data`;

      const bundleModelExists = await RNFS.exists(bundleModelPath);
      const bundleDataExists = await RNFS.exists(bundleDataPath);

      if (bundleModelExists && bundleDataExists) {
        const stats = await RNFS.stat(bundleModelPath);
        return {
          exists: true,
          location: 'bundle',
          path: bundleModelPath,
          size: stats.size,
        };
      }

      // Check documents directory
      const documentsModelPath = `${RNFS.DocumentDirectoryPath}/models/model.onnx`;
      const documentsDataPath = `${RNFS.DocumentDirectoryPath}/models/model.onnx_data`;

      const docModelExists = await RNFS.exists(documentsModelPath);
      const docDataExists = await RNFS.exists(documentsDataPath);

      if (docModelExists && docDataExists) {
        const stats = await RNFS.stat(documentsModelPath);
        return {
          exists: true,
          location: 'documents',
          path: documentsModelPath,
          size: stats.size,
        };
      }

      return {
        exists: false,
        location: 'not found',
      };
    } catch (error) {
      logger.error('❌ Failed to get model info:', error);
      return {
        exists: false,
        location: 'error',
      };
    }
  }

  /**
   * Download model from a URL (for future use)
   */
  async downloadModel(
    url: string,
    onProgress?: (progress: number) => void,
  ): Promise<boolean> {
    try {
      logger.info('📥 Downloading ONNX model...');

      const modelsDir = `${RNFS.DocumentDirectoryPath}/models`;
      await RNFS.mkdir(modelsDir);

      const downloadDest = `${modelsDir}/model.onnx`;

      const download = RNFS.downloadFile({
        fromUrl: url,
        toFile: downloadDest,
        progress: res => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          onProgress?.(progress);
        },
      });

      const result = await download.promise;

      if (result.statusCode === 200) {
        this.modelPath = downloadDest;
        this.isModelReady = true;
        logger.info('✅ Model downloaded successfully');
        return true;
      }

      logger.error('❌ Model download failed:', result.statusCode);
      return false;
    } catch (error) {
      logger.error('❌ Model download error:', error);
      return false;
    }
  }
}

export const onnxModelManager = ONNXModelManager.getInstance();
