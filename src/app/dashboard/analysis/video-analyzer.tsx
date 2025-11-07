
"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, Sparkles, Video, BrainCircuit, Bookmark, Save, Trash2 } from "lucide-react";
import { analyzeVideoForImprovement, AnalyzeVideoOutput } from "@/ai/flows/analyze-video-for-improvement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { VideoAnalysis } from "@/lib/types";

const MAX_DURATION_SECONDS = 60;

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements = [];
  let currentListItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      if (currentListItems.length > 0) {
        elements.push(<ul key={`ul-${i-1}`} className="list-disc list-inside space-y-1 my-2">{currentListItems}</ul>);
        currentListItems = [];
      }
      elements.push(<h3 key={i} className="font-bold text-lg mt-4 mb-2">{line.substring(4)}</h3>);
    } else if (line.startsWith('* ')) {
      currentListItems.push(<li key={i}>{line.substring(2)}</li>);
    } else if (line.trim() !== '') {
      if (currentListItems.length > 0) {
        elements.push(<ul key={`ul-${i-1}`} className="list-disc list-inside space-y-1 my-2">{currentListItems}</ul>);
        currentListItems = [];
      }
      elements.push(<p key={i}>{line}</p>);
    } else {
        if (currentListItems.length > 0) {
            elements.push(<ul key={`ul-${i-1}`} className="list-disc list-inside space-y-1 my-2">{currentListItems}</ul>);
            currentListItems = [];
        }
        if (elements.length > 0 && lines[i-1]?.trim() !== '') {
             elements.push(<br key={`br-${i}`} />);
        }
    }
  }

  if (currentListItems.length > 0) {
    elements.push(<ul key={`ul-${lines.length}`} className="list-disc list-inside space-y-1 my-2">{currentListItems}</ul>);
  }

  return <>{elements}</>;
}


export default function VideoAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeVideoOutput | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const savedAnalysesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'videoAnalyses'), orderBy('savedAt', 'desc'));
  }, [user, firestore]);

  const { data: savedAnalyses, isLoading: isLoadingSaved } = useCollection<VideoAnalysis>(savedAnalysesQuery);

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
          if(fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setSelectedFile(null);
          setVideoPreview(null);
        } else {
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

  const handleSaveAnalysis = async () => {
    if (!user || !firestore || !analysisResult || !selectedFile) {
      toast({ title: "Erro", description: "Nenhuma análise para salvar.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(firestore, 'users', user.uid, 'videoAnalyses'), {
        ...analysisResult,
        userId: user.uid,
        videoName: selectedFile.name,
        savedAt: serverTimestamp(),
      });
      toast({
        title: "Análise Salva!",
        description: `A análise para "${selectedFile.name}" foi guardada com sucesso.`,
      });
      setAnalysisResult(null); // Clear the result from view after saving
      setSelectedFile(null);
      setVideoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Erro ao salvar análise:", error);
      toast({ title: "Erro ao Salvar", description: "Não foi possível salvar a análise. Tente novamente.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (!user || !firestore) return;
    setIsDeleting(analysisId);
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'videoAnalyses', analysisId));
      toast({ title: "Análise Removida", description: "A análise foi removida do seu histórico." });
    } catch (error) {
      console.error("Erro ao remover análise:", error);
      toast({ title: "Erro ao Remover", description: "Não foi possível remover a análise. Tente novamente.", variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  };
  
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-6 sticky top-8">
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="font-bold">Passo 1: Envie seu vídeo</CardTitle>
                    <CardDescription>Selecione um vídeo (até ${MAX_DURATION_SECONDS}s) para a IA analisar.</CardDescription>
                </div>
                 <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="secondary" size="sm">
                            <Bookmark className="mr-2 h-4 w-4" />
                            Análises Salvas
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                        <SheetHeader>
                            <SheetTitle>Análises de Vídeo Salvas</SheetTitle>
                            <SheetDescription>
                                Aqui estão todas as análises de IA que você guardou.
                            </SheetDescription>
                        </SheetHeader>
                        <Dialog>
                            <div className="flex-1 overflow-y-auto pr-4 -mr-6 mt-4">
                                {isLoadingSaved ? (
                                    <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
                                ) : savedAnalyses && savedAnalyses.length > 0 ? (
                                    <div className="space-y-3">
                                        {savedAnalyses.map(analysis => (
                                            <div key={analysis.id} className="group relative rounded-lg border bg-muted/50 p-4 transition-colors hover:bg-muted/80">
                                                 <DialogTrigger asChild>
                                                    <div className="cursor-pointer">
                                                        <h4 className="font-semibold text-foreground truncate pr-8">{analysis.videoName}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Salvo em: {analysis.savedAt ? new Date(analysis.savedAt.toDate()).toLocaleDateString('pt-BR') : 'Salvando...'}
                                                        </p>
                                                    </div>
                                                </DialogTrigger>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                     <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta ação não pode ser desfeita. Isso excluirá permanentemente esta análise salva.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteAnalysis(analysis.id)} disabled={isDeleting === analysis.id}>
                                                                {isDeleting === analysis.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, excluir"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <DialogContent className="max-w-3xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Análise de: {analysis.videoName}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="mt-4 max-h-[70vh] overflow-y-auto">
                                                        <Tabs defaultValue="hook" className="w-full">
                                                            <TabsList className="grid w-full grid-cols-4">
                                                              <TabsTrigger value="hook">Gancho</TabsTrigger>
                                                              <TabsTrigger value="quality">Qualidade</TabsTrigger>
                                                              <TabsTrigger value="pacing">Ritmo</TabsTrigger>
                                                              <TabsTrigger value="caption">Legenda</TabsTrigger>
                                                            </TabsList>
                                                             <TabsContent value="hook" className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                                                                <MarkdownRenderer content={analysis.hookAnalysis.effectiveness} />
                                                            </TabsContent>
                                                            <TabsContent value="quality" className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                                                                <h3>Qualidade Técnica</h3>
                                                                <p><strong>Iluminação:</strong> {analysis.technicalQuality.lighting}</p>
                                                                <p><strong>Áudio:</strong> {analysis.technicalQuality.audio}</p>
                                                                <p><strong>Enquadramento:</strong> {analysis.technicalQuality.framing}</p>
                                                                <h4>Sugestões:</h4>
                                                                <ul>{analysis.technicalQuality.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                                            </TabsContent>
                                                            <TabsContent value="pacing" className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                                                                <h3>Ritmo e Fluxo</h3>
                                                                <p>{analysis.pacing.assessment}</p>
                                                                <h4>Sugestões:</h4>
                                                                <ul>{analysis.pacing.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                                            </TabsContent>
                                                            <TabsContent value="caption" className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                                                                <h3>Legenda e Hashtags</h3>
                                                                <h4>Sugestão de Legenda:</h4>
                                                                <p><em>{analysis.captionSuggestions}</em></p>
                                                                <h4>Sugestão de Hashtags:</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {analysis.hashtagSuggestions.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                                                                </div>
                                                            </TabsContent>
                                                        </Tabs>
                                                    </div>
                                                </DialogContent>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                        <Bookmark className="h-12 w-12" />
                                        <h3 className="mt-4 text-lg font-semibold">Nenhuma Análise Salva</h3>
                                        <p className="mt-1 text-sm">Suas análises de vídeo salvas aparecerão aqui.</p>
                                    </div>
                                )}
                            </div>
                        </Dialog>
                    </SheetContent>
                </Sheet>
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
                  <p className="text-xs text-muted-foreground">MP4, MOV, etc. (Máx ${MAX_DURATION_SECONDS}s)</p>
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
                <CardContent className="space-y-4 pt-6">
                    <div className="h-10 w-full bg-muted rounded"></div>
                    <div className="h-24 w-full bg-muted rounded"></div>
                    <div className="h-24 w-full bg-muted rounded"></div>
                </CardContent>
            </Card>
        )}
        {!isLoading && !analysisResult && (
             <Card className="flex flex-col items-center justify-center h-full text-center min-h-[400px] sticky top-8">
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
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="font-bold">Resultado da Análise</CardTitle>
                <CardDescription>Aqui estão as sugestões da IA para melhorar seu vídeo.</CardDescription>
              </div>
               <Button onClick={handleSaveAnalysis} disabled={isSaving} size="sm">
                  {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar Análise
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hook" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="hook">Gancho</TabsTrigger>
                  <TabsTrigger value="quality">Qualidade</TabsTrigger>
                  <TabsTrigger value="pacing">Ritmo</TabsTrigger>
                  <TabsTrigger value="caption">Legenda</TabsTrigger>
                </TabsList>

                <TabsContent value="hook" className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                   <MarkdownRenderer content={analysisResult.hookAnalysis.effectiveness} />
                </TabsContent>

                <TabsContent value="quality" className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                   <h3>Qualidade Técnica</h3>
                    <p><strong>Iluminação:</strong> {analysisResult.technicalQuality.lighting}</p>
                    <p><strong>Áudio:</strong> {analysisResult.technicalQuality.audio}</p>
                    <p><strong>Enquadramento:</strong> {analysisResult.technicalQuality.framing}</p>
                   <h4>Sugestões de Melhoria:</h4>
                   <ul>
                    {analysisResult.technicalQuality.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </TabsContent>

                <TabsContent value="pacing" className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                  <h3>Ritmo & Fluxo do Vídeo</h3>
                  <p>{analysisResult.pacing.assessment}</p>
                  <h4>Sugestões para Melhorar o Ritmo:</h4>
                  <ul>
                    {analysisResult.pacing.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </TabsContent>

                <TabsContent value="caption" className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                  <h3>Legenda & Hashtags</h3>
                    <div>
                      <h4>Sugestão de Legenda:</h4>
                      <p><em>{analysisResult.captionSuggestions}</em></p>
                    </div>
                    <div>
                      <h4>Sugestão de Hashtags:</h4>
                      <div className="flex flex-wrap gap-2 not-prose">
                        {analysisResult.hashtagSuggestions.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                      </div>
                    </div>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

    