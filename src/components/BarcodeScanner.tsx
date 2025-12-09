import { Html5Qrcode } from "html5-qrcode";
import { useState, useRef } from "react";

interface BarcodeScannerProps {
    onResult: (result: string) => void;
    buttonClassName?: string;
    label?: string;
}

export default function BarcodeScanner({ onResult, buttonClassName, label = "Scan Barcode from Image" }: BarcodeScannerProps) {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanning(true);
        setError(null);

        try {
            const html5QrCode = new Html5Qrcode("reader");
            const result = await html5QrCode.scanFile(file, true);
            onResult(result);
            html5QrCode.clear();
        } catch (err) {
            console.error("Error scanning file", err);
            setError("Could not read barcode from image. Please try a clearer image.");
        } finally {
            setScanning(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-2">
            <div id="reader" className="hidden"></div>

            <div className="flex flex-col gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleScan}
                    className="hidden"
                    id="barcode-upload"
                />

                <label
                    htmlFor="barcode-upload"
                    className={buttonClassName || `cursor-pointer w-full flex items-center justify-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${scanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {scanning ? "Scanning..." : label}
                </label>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
            </div>
        </div>
    );
}
