
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, ArrowRight } from "lucide-react";

interface CultureQuestionsProps {
  companyName: string;
  jobTitle: string;
  onQuestionChange: (questionIndex: number) => void;
}

// Define the questions for the Culture & Purpose phase
const questions = [
  "Você se sente alinhado com a cultura e os valores da empresa? Por quê?",
  "Você se identifica com a missão da empresa? O que mais ressoou com você?",
  "Você tem alguma conexão pessoal ou profissional com o produto, mercado ou público dessa empresa? Já trabalhou com algo parecido ou com esse perfil de cliente?",
  "Você vê o time de liderança como alguém em quem confiaria e aprenderia? Por quê?",
  "Algum pensamento ou conexão sobre a história da fundação da empresa? O que mais chamou sua atenção?"
];

const CultureQuestions = ({ companyName, jobTitle, onQuestionChange }: CultureQuestionsProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));
  const [isRecording, setIsRecording] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      onQuestionChange(nextIndex);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      onQuestionChange(prevIndex);
    }
  };
  
  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };
  
  const toggleRecording = () => {
    // TODO: Implement speech-to-text functionality
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording
      console.log("Recording started");
    } else {
      // Stop recording
      console.log("Recording stopped");
    }
  };
  
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="bg-jobsprint-pink/5 border-b">
        <CardTitle className="text-lg font-semibold">Reflexão: Cultura e Propósito</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col pt-4">
        <div className="text-xs text-muted-foreground mb-1">
          Questão {currentQuestionIndex + 1} de {questions.length}
        </div>
        
        <div className="text-md font-medium mb-4">
          {currentQuestion.replace("da empresa", `da ${companyName}`).replace("dessa empresa", `da ${companyName}`)}
        </div>
        
        <div className="flex-grow">
          <Textarea
            placeholder={`Você pode digitar sua resposta ou usar o botão de gravação para falar...`}
            className="min-h-[200px] resize-none"
            value={answers[currentQuestionIndex]}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
        </div>
        
        <div className="mt-4 flex items-center justify-center">
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            className="rounded-full w-14 h-14 flex items-center justify-center"
            onClick={toggleRecording}
          >
            {isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          
          {isRecording && (
            <div className="ml-4 text-sm text-muted-foreground animate-pulse">
              Gravando... Fale sua resposta
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={isFirstQuestion}
          className="gap-1"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Anterior
        </Button>
        
        <Button
          onClick={handleNextQuestion}
          disabled={isLastQuestion}
          className="bg-jobsprint-pink hover:bg-jobsprint-pink/90 gap-1"
        >
          Próxima
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CultureQuestions;
