'use client';

import {useState, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import {Button} from '@/components/ui/button';
import {generateImageVariations} from '@/ai/flows/generate-image-variations';
import {Copy, Download, Loader2} from 'lucide-react';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {useToast} from '@/hooks/use-toast';
import {Toaster} from '@/components/ui/toaster';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.onabort = () => console.log('file reading was aborted');
    reader.onerror = () => console.log('file reading has failed');
    reader.onloadend = async () => {
      if (file) {
        setIsLoading(true);
        try {
          const imageUrl = reader.result as string;
          const variations = await generateImageVariations({imageUrl: imageUrl});
          setGeneratedImages(variations);
        } catch (error: any) {
          toast({
            title: 'Error generating image variations',
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    reader.readAsDataURL(file);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: {'image/*': ['.jpeg', '.png', '.jpg']}});

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'image-variation.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl);
    toast({
      title: 'Image URL copied to clipboard',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Image Weaver</h1>
      <div {...getRootProps()} className="relative w-full max-w-md rounded-lg border-2 border-dashed border-primary p-4 mb-4 cursor-pointer">
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p className="text-center text-muted-foreground">Drop the files here ...</p> :
            <p className="text-center text-muted-foreground">
              Drag 'n' drop some files here, or click to select files
            </p>
        }
        {uploadedImage && (
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="absolute inset-0 w-full h-full object-contain rounded-lg"
          />
        )}
      </div>

      {isLoading && <Loader2 className="animate-spin" />}

      {generatedImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedImages.map((imageUrl, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
              <img src={imageUrl} alt={`Variation ${index + 1}`} className="w-full h-auto object-cover aspect-square" />
              <div className="absolute top-2 right-2 flex space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="secondary" onClick={() => copyImageUrl(imageUrl)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Copy URL
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="secondary" onClick={() => downloadImage(imageUrl)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Download image
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <AlertDialog>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="destructive">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-trash"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Delete Image
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this image from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
