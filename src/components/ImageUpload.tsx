import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { searchDestinationImage, searchActivityImage, type UnsplashImage } from '@/lib/unsplash';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  destination?: string;
  activity?: string;
  className?: string;
}

export function ImageUpload({ 
  currentImage, 
  onImageChange, 
  destination, 
  activity, 
  className = "" 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // For demo purposes, we'll create a local URL
    // In production, you'd upload to a service like Cloudinary, AWS S3, etc.
    setIsUploading(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const loadStockImage = async () => {
    if (!destination) return;
    
    setIsLoadingStock(true);
    try {
      const searchQuery = activity ? `${activity} ${destination}` : destination;
      const image = await searchActivityImage(searchQuery, destination);
      if (image) {
        onImageChange(image.urls.regular);
      }
    } catch (error) {
      console.error('Error loading stock image:', error);
    } finally {
      setIsLoadingStock(false);
    }
  };

  const removeImage = () => {
    onImageChange('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {currentImage ? (
        <div className="relative group">
          <img
            src={currentImage}
            alt="Itinerary"
            className="w-full h-48 object-cover rounded-lg shadow-md"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={removeImage}
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports JPG, PNG, GIF up to 10MB
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        
        {destination && (
          <Button
            variant="outline"
            size="sm"
            onClick={loadStockImage}
            disabled={isLoadingStock}
            className="flex-1"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {isLoadingStock ? 'Loading...' : 'Stock Photo'}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
      />
    </div>
  );
} 