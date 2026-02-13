import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, X, ArrowDownToLine, Copy } from "lucide-react"; // Added Copy icon

// Add joinCode to the props destructured here
export default function QrSharePopover({ joinLink, joinCode }) {
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [copyStatus, setCopyStatus] = useState("");
    const qrRef = useRef(null);

    const showStatus = (msg) => {
        setCopyStatus(msg);
        setTimeout(() => setCopyStatus(""), 1500);
    };

    const copyLink = async () => {
        await navigator.clipboard.writeText(joinLink);
        showStatus("Link copied");
    };

    // New function to copy just the 6-digit code
    const copyCode = async () => {
        await navigator.clipboard.writeText(joinCode);
        showStatus("Code copied");
    };

    const downloadQr = () => {
        const canvas = qrRef.current?.querySelector("canvas");
        if (!canvas) return;

        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = "quiz-qr.png";
        a.click();
        showStatus("QR downloaded");
    };

    const copyQrImage = async () => {
        const canvas = qrRef.current?.querySelector("canvas");
        if (!canvas) return;

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            if (navigator.clipboard?.write) {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ "image/png": blob }),
                    ]);
                    showStatus("QR copied");
                    return;
                } catch { /* fallback */ }
            }
            downloadQr();
        }, "image/png");
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsQrOpen(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium hover:shadow-md"
            >
                <QrCode className="w-4 h-4" />
                Show QR & Code
            </button>

            {isQrOpen && (
                <div className="absolute right-0 top-full mt-3 w-[min(22rem,90vw)] bg-white text-slate-700 p-4 rounded-xl shadow-xl border border-slate-200 z-20">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm">Join the Quiz</h4>
                        <button
                            onClick={() => setIsQrOpen(false)}
                            className="p-1 rounded-md hover:bg-slate-100"
                        >
                            <X className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                        </button>
                    </div>

                    {/* --- NEW JOIN CODE SECTION --- */}
                    <div className=" text-center">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Join Code</span>
                        <div 
                            onClick={copyCode}
                            className="group relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg  cursor-pointer hover:border-blue-400 transition-colors"
                        >
                            <span className="text-1xl font-black tracking-[0.5em] text-slate-800 ml-[0.5em]">
                                {joinCode}
                            </span>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy className="w-4 h-4 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">Scan QR</span>
                        <button onClick={downloadQr} className="p-2 rounded-md hover:bg-slate-200 text-slate-600">
                            <ArrowDownToLine className="w-4 h-4" />
                        </button>
                    </div>

                    <div ref={qrRef} className="flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <QRCodeCanvas
                            value={joinLink}
                            size={160} // Slightly smaller to fit code above
                            level={"Q"}
                            includeMargin={true}
                            imageSettings={{
                                src: "/quizit-icon.png",
                                height: 35,
                                width: 35,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button onClick={copyQrImage} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium">
                            Copy QR
                        </button>
                        <button onClick={copyLink} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-2 text-sm font-medium border border-slate-200">
                            Copy Link
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-center text-blue-500 font-medium h-4">{copyStatus}</p>
                </div>
            )}
        </div>
    );
}