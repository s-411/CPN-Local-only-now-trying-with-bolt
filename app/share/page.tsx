'use client';

import React, { useState } from 'react';
import { 
  ShareIcon, 
  PhotoIcon, 
  ClipboardDocumentIcon, 
  ArrowDownTrayIcon,
  LinkIcon,
  TrophyIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useShare } from '@/lib/share/ShareContext';
import { useGirls, useGlobalStats } from '@/lib/context';
import ShareButton, { GirlCardShareButton, AnalyticsShareButton, ComparisonShareButton } from '@/components/sharing/ShareButton';

export default function SharePage() {
  const { state, actions } = useShare();
  const { girlsWithMetrics } = useGirls();
  const { globalStats } = useGlobalStats();
  const [selectedGirl, setSelectedGirl] = useState<string | null>(null);
  
  // Custom image generator state
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedImageBlob, setGeneratedImageBlob] = useState<Blob | null>(null);
  
  // Download and UI state
  const [customFilename, setCustomFilename] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const hasData = girlsWithMetrics.length > 0 && girlsWithMetrics.some(girl => girl.totalEntries > 0);
  const topGirl = girlsWithMetrics
    .filter(girl => girl.totalEntries > 0)
    .sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent)[0];

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  };

  // Available metrics for custom image generation
  const availableMetrics = [
    {
      id: 'total-spent',
      label: 'Total Spent',
      description: 'Total amount spent across all entries',
      available: hasData && globalStats.totalSpent > 0,
      value: hasData ? `$${globalStats.totalSpent.toFixed(2)}` : null,
      category: 'financial',
      priority: 1
    },
    {
      id: 'cost-per-nut',
      label: 'Cost per Nut',
      description: 'Average cost per nut across all entries',
      available: hasData && globalStats.totalNuts > 0,
      value: hasData && globalStats.totalNuts > 0 ? `$${(globalStats.totalSpent / globalStats.totalNuts).toFixed(2)}` : null,
      category: 'efficiency',
      priority: 1
    },
    {
      id: 'total-nuts',
      label: 'Total Nuts',
      description: 'Total number of nuts across all entries',
      available: hasData && globalStats.totalNuts > 0,
      value: hasData ? globalStats.totalNuts.toLocaleString() : null,
      category: 'volume',
      priority: 2
    },
    {
      id: 'total-time',
      label: 'Total Time',
      description: 'Total time spent across all entries',
      available: hasData && globalStats.totalTime > 0,
      value: hasData ? formatDuration(globalStats.totalTime) : null,
      category: 'time',
      priority: 2
    },
    {
      id: 'average-rating',
      label: 'Average Rating',
      description: 'Average rating across all tracked profiles',
      available: hasData && globalStats.averageRating > 0,
      value: hasData ? `${globalStats.averageRating.toFixed(1)}/10` : null,
      category: 'quality',
      priority: 3
    },
    {
      id: 'cost-per-hour',
      label: 'Cost per Hour',
      description: 'Average cost per hour across all entries',
      available: hasData && globalStats.totalTime > 0,
      value: hasData && globalStats.totalTime > 0 ? `$${((globalStats.totalSpent / globalStats.totalTime) * 60).toFixed(2)}` : null,
      category: 'efficiency',
      priority: 2
    },
    {
      id: 'active-profiles',
      label: 'Active Profiles',
      description: 'Number of profiles with data entries',
      available: hasData && globalStats.activeGirls > 0,
      value: hasData ? `${globalStats.activeGirls} profile${globalStats.activeGirls > 1 ? 's' : ''}` : null,
      category: 'volume',
      priority: 3
    },
    {
      id: 'top-performer',
      label: 'Top Performer',
      description: 'Highest spending profile name and rating',
      available: !!topGirl,
      value: topGirl ? `${topGirl.name} (${topGirl.rating}/10)` : null,
      category: 'highlight',
      priority: 1
    }
  ].sort((a, b) => a.priority - b.priority); // Sort by priority

  // Handler functions
  const toggleMetricSelection = (metricId: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      } else if (prev.length < 3) {
        return [...prev, metricId];
      }
      return prev;
    });
  };

  const clearSelection = () => {
    setSelectedMetrics([]);
  };

  const handleGenerateImage = async () => {
    if (selectedMetrics.length === 0 || isGenerating) return;

    setIsGenerating(true);
    
    // Clear previous states
    setDownloadSuccess(false);
    setCopySuccess(false);

    try {
      // Validate selected metrics
      const selectedMetricData = selectedMetrics.map(id => 
        availableMetrics.find(metric => metric.id === id)
      ).filter(Boolean);

      if (selectedMetricData.length === 0) {
        throw new Error('No valid metrics selected');
      }

      // Ensure all selected metrics have values
      const validMetrics = selectedMetricData.filter(metric => metric!.value && metric!.available);
      if (validMetrics.length === 0) {
        throw new Error('Selected metrics have no data available');
      }

      // Create custom data object for image generation
      const customData = {
        title: 'My CPN Stats',
        subtitle: `${validMetrics.length} Key Metric${validMetrics.length > 1 ? 's' : ''}`,
        metrics: validMetrics.map(metric => ({
          label: metric!.label,
          value: metric!.value || 'N/A',
          highlight: true
        })),
        watermark: {
          text: 'Generated with CPN v2',
          opacity: 0.7,
          position: 'corner' as const
        }
      };

      // Generate image using CardGenerator with Instagram Story dimensions
      const { CardGenerator } = await import('@/lib/share/generators/CardGenerator');
      const imageBlob = await CardGenerator.generateInstagramStoryCard(customData);
      
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Generated image is empty');
      }
      
      // Create URL for preview
      const imageUrl = URL.createObjectURL(imageBlob);
      setGeneratedImageUrl(imageUrl);
      setGeneratedImageBlob(imageBlob);

      // Set default filename if empty
      if (!customFilename.trim()) {
        const metricNames = validMetrics.slice(0, 2).map(m => 
          m!.label.toLowerCase().replace(/\s+/g, '-')
        ).join('-');
        setCustomFilename(`cpn-${metricNames}-${new Date().toISOString().split('T')[0]}`);
      }

    } catch (error) {
      console.error('Failed to generate image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate image: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImageBlob || isDownloading) return;
    
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      // Generate filename
      const filename = customFilename.trim() || `cpn-stats-${new Date().toISOString().split('T')[0]}`;
      const sanitizedFilename = filename.replace(/[^a-z0-9.-]/gi, '_') + '.png';
      
      // Create download
      const url = URL.createObjectURL(generatedImageBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = sanitizedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success message
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedImageBlob || isCopying) return;

    setIsCopying(true);
    setCopySuccess(false);

    try {
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': generatedImageBlob })
        ]);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } else {
        // Fallback: copy image URL to clipboard
        const url = URL.createObjectURL(generatedImageBlob);
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      alert('Copy to clipboard failed. Your browser may not support this feature.');
    } finally {
      setIsCopying(false);
    }
  };

  const generateNewImage = () => {
    if (generatedImageUrl) {
      URL.revokeObjectURL(generatedImageUrl);
    }
    setGeneratedImageUrl(null);
    setGeneratedImageBlob(null);
    setSelectedMetrics([]);
    setCustomFilename('');
    setDownloadSuccess(false);
    setCopySuccess(false);
  };

  // Modal keyboard handler
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);

  const quickShareOptions = [
    {
      id: 'top-performer',
      title: 'Top Performer Card',
      description: 'Share your highest spending profile statistics',
      icon: TrophyIcon,
      color: 'text-yellow-500',
      available: !!topGirl,
      action: () => topGirl && actions.generateStatCard(topGirl, {
        format: 'image',
        destination: 'clipboard',
        privacy: state.preferences.defaultPrivacy
      })
    },
    {
      id: 'analytics-summary',
      title: 'Analytics Summary',
      description: 'Share your overall performance metrics',
      icon: ChartBarIcon,
      color: 'text-blue-500',
      available: hasData,
      action: () => actions.generateStatCard(globalStats, {
        format: 'image',
        destination: 'clipboard',
        privacy: state.preferences.defaultPrivacy
      })
    },
    {
      id: 'efficiency-comparison',
      title: 'Efficiency Report',
      description: 'Compare your performance to global averages',
      icon: UserGroupIcon,
      color: 'text-green-500',
      available: hasData,
      action: () => actions.generateComparisonReport(globalStats, {
        format: 'image',
        destination: 'clipboard',
        privacy: state.preferences.defaultPrivacy
      })
    }
  ];

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Header */}
      <div className="border-b border-cpn-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <ShareIcon className="w-8 h-8 text-cpn-yellow" />
              <div>
                <h1 className="text-3xl font-heading text-cpn-white">Share Center</h1>
                <p className="text-cpn-gray mt-1">
                  Share your achievements and insights with beautiful, privacy-respecting content
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasData ? (
          // Empty State
          <div className="text-center py-16">
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-cpn-gray/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShareIcon className="w-8 h-8 text-cpn-gray" />
              </div>
              <h3 className="text-xl font-heading text-cpn-white mb-2">
                Nothing to share yet
              </h3>
              <p className="text-cpn-gray mb-6 max-w-md mx-auto">
                Add some data entries to start generating shareable content about your performance and achievements.
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
            {/* Custom Metric Selector & Generator */}
            <div className="card-cpn">
              <h2 className="text-xl font-heading text-cpn-white mb-4">Create Custom Share Image</h2>
              <p className="text-cpn-gray mb-6">Select 1-3 metrics to include on your Instagram Story-sized image</p>
              
              {/* Metric Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-cpn-white mb-4">Choose Your Metrics</h3>
                
                {/* Category Legend */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {['financial', 'efficiency', 'volume', 'time', 'quality', 'highlight'].map(category => {
                    const categoryMetrics = availableMetrics.filter(m => m.category === category && m.available);
                    if (categoryMetrics.length === 0) return null;
                    
                    const categoryColors = {
                      financial: 'text-green-400',
                      efficiency: 'text-blue-400', 
                      volume: 'text-purple-400',
                      time: 'text-orange-400',
                      quality: 'text-pink-400',
                      highlight: 'text-cpn-yellow'
                    };
                    
                    return (
                      <span key={category} className={`text-xs px-2 py-1 rounded-full bg-cpn-dark2/50 border border-cpn-gray/30 ${categoryColors[category as keyof typeof categoryColors]}`}>
                        {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryMetrics.length})
                      </span>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableMetrics.map((metric) => {
                    const categoryColors = {
                      financial: 'border-green-400/30 hover:border-green-400/50',
                      efficiency: 'border-blue-400/30 hover:border-blue-400/50',
                      volume: 'border-purple-400/30 hover:border-purple-400/50',
                      time: 'border-orange-400/30 hover:border-orange-400/50',
                      quality: 'border-pink-400/30 hover:border-pink-400/50',
                      highlight: 'border-cpn-yellow/30 hover:border-cpn-yellow/50'
                    };

                    const categoryIcons = {
                      financial: '💰',
                      efficiency: '⚡',
                      volume: '📊',
                      time: '⏱️',
                      quality: '⭐',
                      highlight: '🏆'
                    };

                    return (
                      <button
                        key={metric.id}
                        onClick={() => toggleMetricSelection(metric.id)}
                        disabled={!metric.available || (selectedMetrics.length >= 3 && !selectedMetrics.includes(metric.id))}
                        className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                          selectedMetrics.includes(metric.id)
                            ? 'border-cpn-yellow bg-cpn-yellow/10'
                            : metric.available 
                              ? `border-cpn-gray/30 hover:bg-cpn-dark2/30 ${categoryColors[metric.category as keyof typeof categoryColors]}`
                              : 'border-cpn-gray/10 opacity-50 cursor-not-allowed'
                        } ${selectedMetrics.length >= 3 && !selectedMetrics.includes(metric.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {/* Priority indicator */}
                        {metric.priority === 1 && metric.available && (
                          <div className="absolute top-2 left-2 w-2 h-2 bg-cpn-yellow rounded-full" title="Recommended"></div>
                        )}
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{categoryIcons[metric.category as keyof typeof categoryIcons]}</span>
                            <h4 className="font-medium text-cpn-white text-sm">{metric.label}</h4>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedMetrics.includes(metric.id)
                              ? 'border-cpn-yellow bg-cpn-yellow'
                              : 'border-cpn-gray/40'
                          }`}>
                            {selectedMetrics.includes(metric.id) && (
                              <svg className="w-3 h-3 text-cpn-dark" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-cpn-gray">{metric.description}</p>
                        {metric.available && metric.value && (
                          <p className="text-sm text-cpn-yellow mt-2 font-medium">{metric.value}</p>
                        )}
                        {!metric.available && (
                          <p className="text-xs text-red-400 mt-2">No data available</p>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Selection Info */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-cpn-gray">
                    {selectedMetrics.length === 0 && "Select at least 1 metric to generate an image"}
                    {selectedMetrics.length === 1 && "1 metric selected - you can add 2 more"}
                    {selectedMetrics.length === 2 && "2 metrics selected - you can add 1 more"}
                    {selectedMetrics.length === 3 && "3 metrics selected (maximum reached)"}
                  </div>
                  {selectedMetrics.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-xs text-cpn-gray hover:text-cpn-white transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGenerateImage}
                  disabled={selectedMetrics.length === 0 || isGenerating}
                  className={`px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 ${
                    selectedMetrics.length === 0
                      ? 'bg-cpn-gray/20 text-cpn-gray cursor-not-allowed'
                      : isGenerating
                        ? 'bg-cpn-yellow/80 text-cpn-dark cursor-wait'
                        : 'bg-cpn-yellow text-cpn-dark hover:bg-cpn-yellow/90 hover:scale-105'
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-cpn-dark/30 border-t-cpn-dark rounded-full animate-spin"></div>
                      Generating Image...
                    </div>
                  ) : (
                    `Generate ${selectedMetrics.length > 0 ? `(${selectedMetrics.length} metric${selectedMetrics.length > 1 ? 's' : ''})` : 'Image'}`
                  )}
                </button>
              </div>

              {/* Generated Image Preview */}
              {generatedImageUrl && (
                <div className="mt-8 p-6 bg-cpn-dark2/30 rounded-lg border border-cpn-yellow/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-cpn-white">Your Generated Image</h3>
                    <div className="flex items-center gap-2 text-sm text-cpn-gray">
                      <PhotoIcon className="w-4 h-4" />
                      <span>1080×1920px • Instagram Story</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      <div className="relative group cursor-pointer" onClick={() => setShowImageModal(true)}>
                        <div className="w-48 h-80 bg-cpn-dark2 rounded-lg overflow-hidden border border-cpn-gray/20 hover:border-cpn-yellow/50 transition-colors">
                          <img 
                            src={generatedImageUrl} 
                            alt="Generated share image" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                          <span className="text-white text-sm font-medium">Click to view full size</span>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-xs text-cpn-gray">9:16 Aspect Ratio</p>
                        <p className="text-xs text-cpn-yellow mt-1">
                          {selectedMetrics.length} metric{selectedMetrics.length > 1 ? 's' : ''} included
                        </p>
                      </div>
                    </div>

                    {/* Download Options */}
                    <div className="flex-1">
                      <div className="mb-6">
                        <h4 className="text-cpn-white font-medium mb-3">Selected Metrics</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMetrics.map(metricId => {
                            const metric = availableMetrics.find(m => m.id === metricId);
                            return metric ? (
                              <span key={metricId} className="px-3 py-1 bg-cpn-yellow/20 text-cpn-yellow text-sm rounded-full border border-cpn-yellow/30">
                                {metric.label}: {metric.value}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* Download Section */}
                      <div className="mb-4">
                        <h4 className="text-cpn-white font-medium mb-3">Download Options</h4>
                        <div className="space-y-3">
                          {/* Filename Customization */}
                          <div>
                            <label className="block text-sm text-cpn-gray mb-2">Filename</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customFilename}
                                onChange={(e) => setCustomFilename(e.target.value)}
                                placeholder="Enter custom filename"
                                className="flex-1 input-cpn text-sm"
                                maxLength={50}
                              />
                              <span className="text-cpn-gray text-sm py-2">.png</span>
                            </div>
                            <p className="text-xs text-cpn-gray mt-1">
                              Default: cpn-stats-{new Date().toISOString().split('T')[0]}
                            </p>
                          </div>

                          {/* File Size Info */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-cpn-gray">Estimated file size:</span>
                            <span className="text-cpn-white">~{Math.round((1080 * 1920 * 4) / (1024 * 1024))}MB</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={downloadImage}
                          disabled={isDownloading}
                          className="flex items-center gap-2 px-6 py-3 bg-cpn-yellow text-cpn-dark rounded-lg hover:bg-cpn-yellow/90 transition-colors font-medium disabled:opacity-50"
                        >
                          {isDownloading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-cpn-dark/30 border-t-cpn-dark rounded-full animate-spin"></div>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <ArrowDownTrayIcon className="w-4 h-4" />
                              Download Image
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={copyToClipboard}
                          disabled={isCopying}
                          className="flex items-center gap-2 px-4 py-3 border border-cpn-gray/30 text-cpn-white rounded-lg hover:border-cpn-yellow/50 hover:bg-cpn-yellow/5 transition-colors"
                        >
                          {isCopying ? (
                            <>
                              <div className="w-4 h-4 border-2 border-cpn-white/30 border-t-cpn-white rounded-full animate-spin"></div>
                              Copying...
                            </>
                          ) : (
                            <>
                              <ClipboardDocumentIcon className="w-4 h-4" />
                              Copy to Clipboard
                            </>
                          )}
                        </button>

                        <button
                          onClick={generateNewImage}
                          className="flex items-center gap-2 px-4 py-3 border border-cpn-gray/30 text-cpn-white rounded-lg hover:border-cpn-yellow/50 transition-colors"
                        >
                          Generate New
                        </button>
                      </div>

                      {/* Success Messages */}
                      {downloadSuccess && (
                        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                          ✓ Image downloaded successfully!
                        </div>
                      )}
                      {copySuccess && (
                        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
                          ✓ Image copied to clipboard!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Individual Girl Cards */}
            <div className="card-cpn">
              <h2 className="text-xl font-heading text-cpn-white mb-4">Individual Statistics</h2>
              <p className="text-cpn-gray mb-6">Share specific profile performance</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {girlsWithMetrics
                  .filter(girl => girl.totalEntries > 0)
                  .map((girl) => (
                    <div
                      key={girl.id}
                      className="p-4 rounded-lg border border-cpn-gray/20 hover:border-cpn-yellow/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-heading text-cpn-white">{girl.name}</h3>
                          <p className="text-sm text-cpn-gray">Rating: {girl.rating}/10</p>
                        </div>
                        <GirlCardShareButton girl={girl} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-cpn-gray">Total Spent</p>
                          <p className="text-cpn-white font-medium">${girl.metrics.totalSpent.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-cpn-gray">Cost/Nut</p>
                          <p className="text-cpn-yellow font-medium">${girl.metrics.costPerNut.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Share History */}
            {state.history.length > 0 && (
              <div className="card-cpn">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-heading text-cpn-white">Recent Shares</h2>
                  <button
                    onClick={() => actions.toggleHistoryPanel(true)}
                    className="text-cpn-gray hover:text-cpn-white text-sm transition-colors"
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-3">
                  {state.history.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-cpn-dark2 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cpn-yellow/20 rounded-full flex items-center justify-center">
                          {entry.format === 'image' ? <PhotoIcon className="w-4 h-4 text-cpn-yellow" /> : 
                           entry.format === 'json' ? <ClipboardDocumentIcon className="w-4 h-4 text-cpn-yellow" /> :
                           <LinkIcon className="w-4 h-4 text-cpn-yellow" />}
                        </div>
                        <div>
                          <p className="text-sm text-cpn-white font-medium capitalize">{entry.type} Share</p>
                          <p className="text-xs text-cpn-gray">
                            {entry.format.toUpperCase()} • {entry.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${entry.expired ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className="text-xs text-cpn-gray">
                          {entry.expired ? 'Expired' : 'Active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="card-cpn bg-cpn-yellow/5 border-cpn-yellow/20">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cpn-yellow/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-cpn-yellow text-sm">🔒</span>
                </div>
                <div>
                  <h3 className="font-medium text-cpn-white mb-1">Privacy First</h3>
                  <p className="text-sm text-cpn-gray">
                    All shareable content is generated locally on your device. You control exactly what information 
                    is included, and sensitive data can be automatically redacted or anonymized.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {showImageModal && generatedImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 z-50 cursor-pointer"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-2xl w-full" style={{ maxHeight: '70vh' }}>
            {/* Close button - larger and more obvious */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-4 -right-4 w-12 h-12 bg-white hover:bg-gray-100 text-gray-800 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer z-10 hover:scale-110"
              title="Close lightbox"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image container */}
            <div 
              className="relative rounded-lg shadow-2xl p-4 cursor-default"
              style={{ backgroundColor: '#F1F1F1', maxHeight: '70vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={generatedImageUrl} 
                alt="Generated share image - lightbox view" 
                className="w-full h-auto max-h-full object-contain rounded"
                style={{ maxHeight: 'calc(70vh - 120px)' }}
              />
              
              {/* Image info bar */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div>
                  <span className="font-medium">Instagram Story</span>
                  <span className="mx-2">•</span>
                  <span>1080×1920px</span>
                  <span className="mx-2">•</span>
                  <span>{selectedMetrics.length} metrics</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadImage}
                    disabled={isDownloading}
                    className="flex items-center gap-1 px-3 py-1 bg-cpn-yellow text-cpn-dark rounded hover:bg-cpn-yellow/90 transition-colors font-medium disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-cpn-dark/30 border-t-cpn-dark rounded-full animate-spin"></div>
                        <span className="text-xs">Downloading...</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span className="text-xs">Download</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={copyToClipboard}
                    disabled={isCopying}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    {isCopying ? (
                      <>
                        <div className="w-3 h-3 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
                        <span className="text-xs">Copying...</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-4 h-4" />
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Click outside instruction */}
            <div className="absolute -bottom-8 left-0 right-0 text-center">
              <p className="text-white/70 text-sm">Click outside or press ESC to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}