
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { Header } from "@/components/layout/Header";

const DocumentUpload = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8 max-w-3xl animate-fade-in">
        <DocumentUploadForm />
      </main>
    </div>
  );
};

export default DocumentUpload;
