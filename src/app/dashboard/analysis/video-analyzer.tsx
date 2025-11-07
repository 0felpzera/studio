
"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, Sparkles, Video, CheckCircle, BrainCircuit } from "lucide-react";
import { analyzeVideoForImprovement, AnalyzeVideoOutput } from "@/ai/flows/analyze-video-for-improvement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const MAX_DURATION_SECONDS = 60;

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
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';

      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration > MAX_DURATION_SECONDS) {
          toast({
            title: "Vídeo muito longo",
            description: `Por favor, envie um vídeo com no máximo ${MAX_DURATION_SECONDS} segundos.`,
            variant: "destructive",
          });
          // Reset file input
          if(fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setSelectedFile(null);
          setVideoPreview(null);
        } else {
          // Duration is acceptable, proceed
          setSelectedFile(file);
          setAnalysisResult(null);
          const reader = new FileReader();
          reader.onloadend = () => {
            setVideoPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };

      videoElement.onerror = () => {
        toast({
            title: "Erro no arquivo",
            description: "Não foi possível ler os metadados do vídeo. O arquivo pode estar corrompido.",
            variant: "destructive",
        });
      };
      
      videoElement.src = URL.createObjectURL(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum vídeo selecionado",
        description: "Por favor, selecione um arquivo de vídeo para analisar.",
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
          title: "Análise Concluída!",
          description: "Seu vídeo foi analisado. Confira as sugestões!",
        });
      } catch (error) {
        console.error("Erro ao analisar vídeo:", error);
        toast({
          title: "Oh não! Algo deu errado.",
          description: "Não conseguimos analisar seu vídeo. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
        console.error("Erro ao ler o arquivo:", error);
        toast({
            title: "Erro no Arquivo",
            description: "Não foi possível ler o arquivo selecionado. Por favor, tente novamente.",
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
            <CardTitle className="font-bold">Passo 1: Envie seu vídeo</CardTitle>
            <CardDescription>Selecione um arquivo de vídeo (até {MAX_DURATION_SECONDS} segundos) do seu dispositivo para a IA analisar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
              onClick={() => fileInputRef.current?.click()}
            >
              {videoPreview ? (
                <video src={videoPreview} controls className="w-full h-full object-contain rounded-lg bg-black" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                  </p>
                  <p className="text-xs text-muted-foreground">MP4, MOV, etc. (Máx {MAX_DURATION_SECONDS}s)</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            </div>
             {selectedFile && (
                <div className="flex items-center p-2 text-sm rounded-md bg-muted text-muted-foreground mt-4">
                    <Video className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate flex-1">{selectedFile.name}</span>
                </div>
             )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleAnalyzeClick} disabled={isLoading || !selectedFile} className="w-full font-bold">
              {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" />Analisar Vídeo</>}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        {isLoading && (
            <Card className="animate-pulse">
                <CardHeader>
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                    <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-10 w-full bg-muted rounded"></div>
                    <div className="h-10 w-full bg-muted rounded"></div>
                    <div className="h-10 w-full bg-muted rounded"></div>
                </CardContent>
            </Card>
        )}
        {!isLoading && !analysisResult && (
             <Card className="flex flex-col items-center justify-center h-full text-center min-h-[400px]">
                <CardHeader>
                    <div className="mx-auto bg-secondary p-3 rounded-full">
                        <BrainCircuit className="size-8 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl font-semibold mt-2">Passo 2: Receba a Análise da IA</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">Envie um vídeo e clique em "Analisar" para receber feedback sobre o gancho, qualidade, ritmo e mais.</p>
                </CardContent>
             </Card>
        )}
        {analysisResult && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-bold">Resultado da Análise</CardTitle>
                <CardDescription>Aqui estão as sugestões da IA para melhorar seu vídeo.</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-bold">Análise do Gancho (Primeiros 3s)</CardTitle>
                <CardDescription>{analysisResult.hookAnalysis.effectiveness}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <h4 className="font-semibold text-sm">Sugestões de Ganchos Alternativos:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {analysisResult.hookAnalysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-bold">Qualidade Técnica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Iluminação: <span className="font-normal text-muted-foreground">{analysisResult.technicalQuality.lighting}</span></h4>
                  <h4 className="font-semibold">Áudio: <span className="font-normal text-muted-foreground">{analysisResult.technicalQuality.audio}</span></h4>
                  <h4 className="font-semibold">Enquadramento: <span className="font-normal text-muted-foreground">{analysisResult.technicalQuality.framing}</span></h4>
                </div>
                 <h4 className="font-semibold text-sm">Sugestões de Melhoria:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {analysisResult.technicalQuality.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-bold">Ritmo & Fluxo do Vídeo</CardTitle>
                <CardDescription>{analysisResult.pacing.assessment}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <h4 className="font-semibold text-sm">Sugestões para Melhorar o Ritmo:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {analysisResult.pacing.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-bold">Legenda & Hashtags</CardTitle>
                <CardDescription>Use esta combinação otimizada para aumentar o alcance e o engajamento.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Sugestão de Legenda:</h4>
                  <p className="text-sm p-3 bg-muted rounded-md">{analysisResult.captionSuggestions}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Sugestão de Hashtags:</h4>
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

    