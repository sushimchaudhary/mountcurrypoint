import { X } from "lucide-react";

export function PDFViewerModal({ isOpen, url, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl h-[95vh] rounded shadow-xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-2 border-b">
          <h3 className="text-sm font-bold">Document Viewer</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
        </div>
        <iframe src={url} className="w-full h-full" title="PDF Viewer" />
      </div>
    </div>
  );
}