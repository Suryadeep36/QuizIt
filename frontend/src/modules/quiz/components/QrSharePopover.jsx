import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, X, ArrowDownToLine } from "lucide-react";

export default function QrSharePopover({ joinLink }) {
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
                } catch {
                    // ignore and fallback
                }
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
                Show QR
            </button>

            {isQrOpen && (
                <div className="absolute right-0 top-full mt-3 w-[min(22rem,90vw)] bg-white text-slate-700 p-4 rounded-xl shadow-xl border border-slate-200 z-20">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm">Scan to Join</h4>
                        <button
                            onClick={() => setIsQrOpen(false)}
                            className="p-1 rounded-md hover:bg-slate-100"
                            aria-label="Close QR"
                        >
                            <X className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">QR code</span>
                        <button
                            onClick={downloadQr}
                            className="p-2 rounded-md hover:bg-slate-200 text-slate-600"
                            aria-label="Download QR"
                            title="Download QR"
                        >
                            <ArrowDownToLine className="w-4 h-4" />
                        </button>
                    </div>

                    <div
                        ref={qrRef}
                        className="flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-4"
                    >
                        <QRCodeCanvas
                            value={joinLink}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"} // Tailwind indigo-600
                            level={"Q"} // High error correction (Crucial for logos)
                            includeMargin={true}
                            imageSettings={{
                                src: "/quizit-icon.png", // Replace with your logo path
                                x: undefined,
                                y: undefined,
                                height: 45,
                                width: 45,
                                excavate: true, // Cuts a hole in the QR code for the logo
                            }}
                        />
                    </div>

                    <div className="mt-3 flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg px-2 py-2">
                        <input
                            className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                            type="text"
                            readOnly
                            value={joinLink}
                        />
                    </div>

                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={copyQrImage}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium"
                        >
                            Copy QR
                        </button>

                        <button
                            onClick={copyLink}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-2 text-sm font-medium border border-slate-200"
                        >
                            Copy Link
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-500 h-4">{copyStatus}</p>
                </div>
            )}
        </div>
    );
}
