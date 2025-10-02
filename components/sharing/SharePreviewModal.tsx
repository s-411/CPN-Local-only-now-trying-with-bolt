'use client';

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ClipboardDocumentIcon, 
  ArrowDownTrayIcon, 
  LinkIcon, 
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useShare } from '@/lib/share/ShareContext';
import { ShareFormat } from '@/lib/share/types';

interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SharePreviewModal({ isOpen, onClose }: SharePreviewModalProps) {
  const { state, actions } = useShare();
  const [selectedFormat, setSelectedFormat] = useState<ShareFormat>('image');
  const [preview, setPreview] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  // Generate preview when format changes or content is available
  useEffect(() => {
    if (state.activeShare.content && isOpen) {
      generatePreview();
    }
  }, [selectedFormat, state.activeShare.content, isOpen]);

  const generatePreview = async () => {
    if (!state.activeShare.content) return;

    setIsGenerating(true);
    try {
      // Import ShareService dynamically to avoid SSR issues
      const { ShareService } = await import('@/lib/share/ShareService');
      const service = ShareService.getInstance();
      
      if (selectedFormat === 'image') {
        const blob = await service.toFormat(state.activeShare.content, 'image') as Blob;
        const url = URL.createObjectURL(blob);
        setPreview(url);
      } else {
        const content = await service.toFormat(state.activeShare.content, selectedFormat) as string;
        setPreview(content);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setPreview('Error generating preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (destination: 'clipboard' | 'download' | 'url') => {
    try {
      switch (destination) {
        case 'clipboard':
          const success = await actions.shareViaClipboard(selectedFormat);
          if (success) {
            // Could add toast notification here
            console.log('Copied to clipboard!');
          }
          break;
        case 'download':
          await actions.shareViaDownload(selectedFormat);
          break;
        case 'url':
          const url = await actions.shareViaURL();
          if (url) {
            await navigator.clipboard.writeText(url);
            console.log('Share URL copied to clipboard!');
          }
          break;
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const formatOptions: { value: ShareFormat; label: string; description: string }[] = [
    { value: 'image', label: 'Image (PNG)', description: 'High-quality image perfect for social media' },
    { value: 'html', label: 'HTML', description: 'Web-friendly format for embedding' },
    { value: 'markdown', label: 'Markdown', description: 'Perfect for Reddit, Discord, and forums' },
    { value: 'json', label: 'JSON', description: 'Raw data format for developers' }
  ];

  const renderPreview = () => {
    if (isGenerating) {
      return (
        <div className="flex items-center justify-center h-64 text-cpn-gray">
          <div className="animate-spin w-8 h-8 border-2 border-cpn-yellow border-t-transparent rounded-full"></div>
          <span className="ml-3">Generating preview...</span>
        </div>
      );
    }

    if (selectedFormat === 'image' && preview) {
      return (
        <img 
          src={preview} 
          alt="Share preview" 
          className="max-w-full h-auto rounded-lg border border-cpn-gray/20"
        />
      );
    }

    if (preview) {
      return (
        <pre className="bg-cpn-dark2 p-4 rounded-lg text-sm text-cpn-white overflow-auto max-h-64 whitespace-pre-wrap">
          {preview}
        </pre>
      );
    }

    return (
      <div className="flex items-center justify-center h-64 text-cpn-gray">
        <EyeIcon className="w-8 h-8 mb-2" />
        <span>No preview available</span>
      </div>
    );
  };

  if (!isOpen || !state.activeShare.content) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cpn-dark border border-cpn-gray/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cpn-gray/20">
          <div>
            <h2 className="text-xl font-heading text-cpn-white">Share Preview</h2>
            <p className="text-sm text-cpn-gray mt-1">
              {state.activeShare.content.type === 'card' ? 'Statistics Card' : 
               state.activeShare.content.type === 'comparison' ? 'Comparison Report' : 
               'Shareable Content'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrivacySettings(!showPrivacySettings)}
              className="text-cpn-gray hover:text-cpn-white transition-colors p-2"
              title="Privacy Settings"
            >
              <CogIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-cpn-gray hover:text-cpn-white transition-colors p-1"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-80px)]">
          {/* Format Selection */}
          <div className="lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-cpn-gray/20">
            <h3 className="text-lg font-heading text-cpn-white mb-4">Format</h3>
            <div className="space-y-2">
              {formatOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFormat(option.value)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedFormat === option.value
                      ? 'bg-cpn-yellow/20 border border-cpn-yellow text-cpn-yellow'
                      : 'bg-cpn-dark2 border border-cpn-gray/20 text-cpn-gray hover:text-cpn-white hover:border-cpn-gray'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-80">{option.description}</div>
                </button>
              ))}
            </div>

            {/* Privacy Settings Toggle */}
            {showPrivacySettings && (
              <div className="mt-6 p-4 bg-cpn-dark2 rounded-lg">
                <h4 className="text-sm font-medium text-cpn-white mb-3">Privacy Options</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      defaultChecked={state.preferences.defaultPrivacy.showExactValues}
                      className="mr-2" 
                    />
                    <span className="text-cpn-gray">Show exact values</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      defaultChecked={state.preferences.autoWatermark}
                      className="mr-2" 
                    />
                    <span className="text-cpn-gray">Include watermark</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      defaultChecked={state.preferences.defaultPrivacy.redactNames}
                      className="mr-2" 
                    />
                    <span className="text-cpn-gray">Hide names</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 p-6 overflow-auto">
            <h3 className="text-lg font-heading text-cpn-white mb-4">Preview</h3>
            <div className="bg-cpn-dark2 p-4 rounded-lg">
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-cpn-gray/20 bg-cpn-dark2">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleShare('clipboard')}
              className="flex items-center gap-2 bg-cpn-yellow text-cpn-dark px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              Copy to Clipboard
            </button>
            
            <button
              onClick={() => handleShare('download')}
              className="flex items-center gap-2 border border-cpn-gray/30 text-cpn-gray hover:text-cpn-white hover:border-cpn-gray px-4 py-2 rounded-lg font-medium transition-all"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download
            </button>
            
            <button
              onClick={() => handleShare('url')}
              className="flex items-center gap-2 border border-cpn-gray/30 text-cpn-gray hover:text-cpn-white hover:border-cpn-gray px-4 py-2 rounded-lg font-medium transition-all"
            >
              <LinkIcon className="w-4 h-4" />
              Copy Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}