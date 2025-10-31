"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, Sparkles, Video, CheckCircle } from "lucide-react";
import { analyzeVideoForImprovement, AnalyzeVideoOutput } from "@/ai/flows/analyze-video-for-improvement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentsüi/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function VideoAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeVideoOutput | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: "File too large",
          description: "Please upload a video smaller than 4MB for analysis.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setAnalysisResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) {
      toast({
        title: "No video selected",
        description: "Please select a video file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const result = await analyzeVideoForImprovement({ videoDataUri: base64Data });
        setAnalysisResult(result);
        toast({
          title: "Analysis Complete!",
          description: "Your video has been analyzed. Check out the suggestions!",
        });
      } catch (error) {
        console.error("Error analyzing video:", error);
        toast({
          title: "Oh no! Something went wrong.",
          description: "We couldn't analyze your video. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
        console.error("File reading error:", error);
        toast({
            title: "File Error",
            description: "Could not read the selected file. Please try again.",
            variant: "destructive",
        });
        setIsLoading(false);
    }
  };
  
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upload Your Video</CardTitle>
            <CardDescription>Select a video file from your device to start the analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
              onClick={() => fileInputRef.current?.click()}
            >
              {videoPreview ? (
                <video src={videoPreview} controls className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">MP4, MOV, etc. (Max 4MB)</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            </div>
             {selectedFile && (
                <div className="flex items-center p-2 text-sm rounded-md bg-muted text-muted-foreground">
                    <Video className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate flex-1">{selectedFile.name}</span>
                </div>
             )}
          </CardContent>
          <CardContent>
            <Button onClick={handleAnalyzeClick} disabled={isLoading || !selectedFile} className="w-full font-bold">
              {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" />Analyze Video</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {isLoading && (
            <Card>
                <CardHeader>
                    <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-2"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                    <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                    <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                </CardContent>
            </Card>
        )}
        {!isLoading && !analysisResult && (
            <div className="flex flex-col items-center justify-center h-full text-center rounded-lg border-2 border-dashed">
                <Sparkles className="size-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold mt-4">Your analysis will appear here</h3>
                <p className="text-muted-foreground">Upload a video and click "Analyze" to see the magic.</p>
            </div>
        )}
        {analysisResult && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Hook Analysis (First 3s)</CardTitle>
                <CardDescription>{analysisResult.hookAnalysis.effectiveness}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <h4 className="font-semibold text-sm">Suggestions:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {analysisResult.hookAnalysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Technical Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Lighting: <span className="font-normal text-muted-foreground">{analysisResult.technicalQuality.lighting}</span></h4>
                  <h4 className="font-semibold">Audio: <span className="font-normal text-muted-foreground">{analysisResult.technicalQuality.audio}</span></h4>
                  <h4 className="font-semibold">Framing: <span className="font-normal text-muted-foreground">{analysisResult.technicalQuality.framing}</span></h4>
                </div>
                 <h4 className="font-semibold text-sm">Suggestions:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {analysisResult.technicalQuality.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Pacing & Flow</CardTitle>
                <CardDescription>{analysisResult.pacing.assessment}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <h4 className="font-semibold text-sm">Suggestions:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {analysisResult.pacing.suggestions.map((s, i) => <li key-={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Caption & Hashtags</CardTitle>
                <CardDescription>Optimized for engagement.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Suggested Caption:</h4>
                  <p className="text-sm p-3 bg-muted/50 rounded-md">{analysisResult.captionSuggestions}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Suggested Hashtags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.hashtagSuggestions.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
