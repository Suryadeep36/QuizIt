import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FileText, Link as LinkIcon, Download } from "lucide-react";
import { useState } from "react";

export default function FormImportModal({ open, onClose, onImport }) {
  const [formUrl, setFormUrl] = useState("");

  const handleImport = () => {
    if (!formUrl.trim()) return;
    onImport(formUrl);
    setFormUrl("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: { borderRadius: "24px", padding: "8px" },
        className: "bg-white shadow-2xl",
      }}
    >
      {/* Header */}
      <DialogTitle className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-xl">
            <FileText className="text-[#4a9cb0]" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-800">Import from Forms</h3>
            <p className="text-xs text-gray-500 font-normal">Connect your Google Form link 🔗</p>
          </div>
        </div>
        <IconButton onClick={onClose} className="hover:bg-gray-100 transition-colors">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <div className="flex flex-col gap-6 mt-4">
          
          {/* URL Input Container */}
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4a9cb0] transition-colors">
              <LinkIcon size={20} />
            </div>
            <input
              type="url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://docs.google.com/forms/d/..."
              className="w-full pl-14 pr-5 py-5 rounded-3xl border-2 border-gray-100 bg-gray-50 
                         focus:bg-white focus:border-[#4a9cb0] focus:ring-4 focus:ring-blue-50 
                         outline-none text-gray-700 transition-all duration-300 
                         placeholder:text-gray-400 shadow-inner"
            />
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur opacity-0 group-focus-within:opacity-10 transition duration-500 -z-10"></div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
             <p className="text-xs text-blue-700 leading-relaxed">
               <b>Tip:</b> Make sure your Google Form is set to "Public" or that you've granted QuizIt access to ensure a smooth import of your questions.
             </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleImport}
            disabled={!formUrl.trim()}
            className={`
              relative overflow-hidden py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 active:scale-95
              ${!formUrl.trim() 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-[#4a9cb0] to-[#5fb4c7] text-white hover:shadow-blue-200 hover:-translate-y-1"}
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <Download size={20} />
              {formUrl.trim() ? "Import Questions" : "Paste a Link Above"}
            </span>
          </button>

          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            SECURE IMPORT VIA GOOGLE API
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}