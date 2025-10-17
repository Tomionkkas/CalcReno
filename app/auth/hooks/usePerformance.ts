import { useState, useEffect, useMemo } from 'react';
import { Platform, Dimensions, PixelRatio } from 'react-native';

const { width, height, scale } = Dimensions.get('window');

interface DeviceCapabilities {
  isHighEnd: boolean;
  isMidRange: boolean;
  isLowEnd: boolean;
  hasHighRefreshRate: boolean;
  supportsAdvancedAnimations: boolean;
  memoryCapacity: 'high' | 'medium' | 'low';
}

interface PerformanceSettings {
  animationDuration: number;
  animationComplexity: 'high' | 'medium' | 'low';
  enableAdvancedEffects: boolean;
  enableParticleEffects: boolean;
  enableComplexShadows: boolean;
  enableBlurEffects: boolean;
}

export function usePerformance() {
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    isHighEnd: false,
    isMidRange: false,
    isLowEnd: false,
    hasHighRefreshRate: false,
    supportsAdvancedAnimations: false,
    memoryCapacity: 'medium',
  });

  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    animationDuration: 300,
    animationComplexity: 'medium',
    enableAdvancedEffects: true,
    enableParticleEffects: true,
    enableComplexShadows: true,
    enableBlurEffects: true,
  });

  // Detect device capabilities
  const detectDeviceCapabilities = useMemo(() => {
    const pixelDensity = PixelRatio.get();
    const screenArea = width * height;
    const isLargeScreen = width > 400;
    
    // Determine device tier based on screen size and pixel density
    let deviceTier: 'high' | 'medium' | 'low' = 'medium';
    
    if (isLargeScreen && pixelDensity >= 3) {
      deviceTier = 'high';
    } else if (isLargeScreen || pixelDensity >= 2.5) {
      deviceTier = 'medium';
    } else {
      deviceTier = 'low';
    }

    // Estimate refresh rate based on device tier
    const hasHighRefreshRate = deviceTier === 'high' && Platform.OS === 'ios';

    // Determine memory capacity
    let memoryCapacity: 'high' | 'medium' | 'low' = 'medium';
    if (deviceTier === 'high') memoryCapacity = 'high';
    else if (deviceTier === 'low') memoryCapacity = 'low';

    return {
      isHighEnd: deviceTier === 'high',
      isMidRange: deviceTier === 'medium',
      isLowEnd: deviceTier === 'low',
      hasHighRefreshRate,
      supportsAdvancedAnimations: deviceTier !== 'low',
      memoryCapacity,
    };
  }, []);

  // Update device capabilities
  useEffect(() => {
    setDeviceCapabilities(detectDeviceCapabilities);
  }, [detectDeviceCapabilities]);

  // Optimize performance settings based on device capabilities
  useEffect(() => {
    const optimizedSettings: PerformanceSettings = {
      animationDuration: deviceCapabilities.isHighEnd ? 250 : deviceCapabilities.isLowEnd ? 400 : 300,
      animationComplexity: deviceCapabilities.isHighEnd ? 'high' : deviceCapabilities.isLowEnd ? 'low' : 'medium',
      enableAdvancedEffects: deviceCapabilities.supportsAdvancedAnimations,
      enableParticleEffects: deviceCapabilities.isHighEnd || deviceCapabilities.isMidRange,
      enableComplexShadows: deviceCapabilities.isHighEnd,
      enableBlurEffects: deviceCapabilities.supportsAdvancedAnimations,
    };

    setPerformanceSettings(optimizedSettings);
  }, [deviceCapabilities]);

  // Get optimized animation duration
  const getAnimationDuration = (baseDuration: number = 300) => {
    const multiplier = deviceCapabilities.isHighEnd ? 0.8 : deviceCapabilities.isLowEnd ? 1.3 : 1;
    return Math.round(baseDuration * multiplier);
  };

  // Get optimized animation easing
  const getAnimationEasing = () => {
    if (deviceCapabilities.isHighEnd) {
      return 'easeOut'; // More complex easing for high-end devices
    } else if (deviceCapabilities.isLowEnd) {
      return 'linear'; // Simple linear easing for low-end devices
    } else {
      return 'easeInOut'; // Balanced easing for mid-range devices
    }
  };

  // Check if advanced effects should be enabled
  const shouldEnableAdvancedEffects = (effectType: keyof PerformanceSettings) => {
    return performanceSettings[effectType] as boolean;
  };

  // Get optimized render settings
  const getRenderSettings = () => ({
    enableShadows: shouldEnableAdvancedEffects('enableComplexShadows'),
    enableBlur: shouldEnableAdvancedEffects('enableBlurEffects'),
    enableParticles: shouldEnableAdvancedEffects('enableParticleEffects'),
    animationQuality: performanceSettings.animationComplexity,
  });

  // Performance monitoring
  const [frameRate, setFrameRate] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);

  // Monitor performance (simplified)
  useEffect(() => {
    let frameCount = 0;
    let lastTime = Date.now();

    const monitorPerformance = () => {
      frameCount++;
      const currentTime = Date.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFrameRate(Math.min(fps, 60));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(monitorPerformance);
    };

    const animationId = requestAnimationFrame(monitorPerformance);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return {
    deviceCapabilities,
    performanceSettings,
    getAnimationDuration,
    getAnimationEasing,
    shouldEnableAdvancedEffects,
    getRenderSettings,
    frameRate,
    memoryUsage,
    isPerformanceGood: frameRate >= 50,
  };
}
