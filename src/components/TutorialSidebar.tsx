import React, { useState, useEffect } from "react";
import clifBarcode from "../assets/clif_barcode.webp";

// Define the checklist data structure
interface ChecklistItem {
    id: string;
    text: string;
    subItems?: ChecklistItem[];
}

const CHECKLIST_DATA: ChecklistItem[] = [
    { id: "welcome", text: "Welcome! To save you some time we made a tutorial to walk you through the features of out webapp. Enjoy!" },
    {
        id: "register",
        text: "Register an account",
        subItems: [
            { id: "nav-register", text: "Navigate to the 'Login/Register' page and press 'Register'" },
            { id: "do-register", text: "Enter a username, the press 'Register', do not forget your username, you will need to logout and log back in later" },
        ],
    },
    {
        id: "contribute",
        text: "Submit a test contribution",
        subItems: [
            { id: "desc-contribute", text: "You will be submitting a cookies and cream clif bar to the food coop" },
            { id: "nav-contribute", text: "Navigate to the Contribute page" },
            { id: "fill-form", text: "Fill out the form with the information that is prompted" },
            { id: "download-barcode", text: "Download and upload this barcode (it is really for a cookies and cream clif bar) for this contribution" },
            { id: "submit-request", text: "Press the 'Submit Request' button, green text should appear below saying \"Submitted 'item' for approval\"" },
        ],
    },
    {
        id: "accept-intro",
        text: "Now to accept the contribution",
        subItems: [
            { id: "admin-login", text: "Since the admin panel is only for admins, go to the Login/Register page and login with the username 'Admin'" },
            { id: "admin-login-steps", text: "To do this type Admin in the text box under Username, then press 'Login'" },
        ],
    },
    {
        id: "admin-approve",
        text: "Navigate to the Admin page",
        subItems: [
            { id: "do-approve", text: "Approve your previous contribution on the admin panel by pressing the 'Approve' button" }
        ]
    },
    {
        id: "admin-delete",
        text: "As Admin, navigate to the home page",
        subItems: [
            { id: "do-delete", text: "Press the delete button on the item that says 'Hi Professor, delete this!'" }
        ]
    },
    {
        id: "user-login",
        text: "Go to the login page, and log in with the account you made previously by entering in that username and pressing 'Login'",
    },
    {
        id: "smart-restock",
        text: "Go to the Contribute page",
        subItems: [
            { id: "restock-scan", text: "Press 'Scan Barcode' and upload the barcode you uploaded earlier" },
            { id: "restock-awe", text: "Take a moment to be in awe of how the item name and unit price is deduced automatically after the barcode is scanned" },
            { id: "restock-submit", text: "Add some quantity to the contribution and submit, it will accept the restock without needing admin verification" },
        ]
    },
    {
        id: "home-scan",
        text: "Go to the home page",
        subItems: [
            { id: "press-scan", text: "Press the 'Scan Barcode' button" },
            { id: "upload-scan", text: "Upload the barcode from the contribution you made and approved earlier" },
            { id: "enter-qty", text: "Enter a quantity, then submit" },
            { id: "verify-select", text: "The item will be added to cart with the quantity entered, the \"Added n x 'item' to cart\" message should appear on the bottom left in green text" },
        ],
    },
    {
        id: "buy",
        text: "Press the 'Buy Selected' button",
        subItems: [
            { id: "verify-success", text: "The 'Purchase successful!' message should appear on the left in green text" },
        ],
    },
    {
        id: "wallet",
        text: "To increase balance and view purchase history, navigate to the 'Wallet' page",
    },
    {
        id: "finish",
        text: "Enjoy the cookies and cream clif bar, and feel free try more contributions! Our barcode scanner is picky on the barcodes it will accept, but if it looks like the one on the demo it should work.",
    },
];

export default function TutorialSidebar() {
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
    const [isOpen, setIsOpen] = useState(true);

    // Load state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("tutorial_progress");
        if (saved) {
            try {
                setCheckedIds(new Set(JSON.parse(saved)));
            } catch (e) {
                console.error("Failed to parse tutorial progress", e);
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    const toggleCheck = (id: string) => {
        setCheckedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            localStorage.setItem("tutorial_progress", JSON.stringify(Array.from(next)));
            return next;
        });
    };

    const renderItem = (item: ChecklistItem, depth = 0) => {
        const isChecked = checkedIds.has(item.id);
        const isBarcodeStep = item.id === "download-barcode";

        return (
            <div key={item.id} className={`mb-2 ${depth > 0 ? "ml-4" : ""}`}>
                <div className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        id={item.id}
                        checked={isChecked}
                        onChange={() => toggleCheck(item.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={item.id} className={`text-sm ${isChecked ? "text-gray-500 line-through" : "text-gray-800"}`}>
                        {item.text}
                    </label>
                </div>

                {isBarcodeStep && (
                    <div className="mt-2 ml-6">
                        <img src={clifBarcode.src} alt="Clif Bar Barcode" className="max-w-[200px] border border-gray-300 rounded shadow-sm" />
                        <a
                            href={clifBarcode.src}
                            download="clif_barcode.webp"
                            className="text-xs text-blue-600 hover:underline block mt-1"
                        >
                            Download Image
                        </a>
                    </div>
                )}

                {item.subItems && item.subItems.length > 0 && (
                    <div className="mt-1">
                        {item.subItems.map((sub) => renderItem(sub, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed left-0 top-20 bg-blue-600 text-white p-2 rounded-r-md shadow-lg z-50 writing-mode-vertical"
                style={{ writingMode: 'vertical-rl' }}
            >
                Tutorial
            </button>
        )
    }

    return (
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto sticky top-0 flex-shrink-0 shadow-lg z-40">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Tutorial</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            </div>
            <div className="p-4">
                {CHECKLIST_DATA.map((item) => renderItem(item))}
            </div>
        </div>
    );
}
