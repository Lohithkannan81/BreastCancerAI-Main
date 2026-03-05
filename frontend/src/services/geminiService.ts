import { TumorClass } from "../types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const analyzeMedicalImage = async (image: string, username: string, patientId: string, fileName: string): Promise<{
    tumorClass: TumorClass;
    confidence: number;
    explanation: string;
}> => {
    // Convert base64 to blob
    const base64Data = image.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', blob, fileName || 'scan.jpg');
    formData.append('username', username);
    formData.append('patient_id', patientId);

    const response = await fetch(`${API_URL}/predict?username=${username}&patient_id=${patientId}`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error("Analysis failed");

    const data = await response.json();
    return {
        tumorClass: data.result === "MALIGNANT" ? TumorClass.MALIGNANT : TumorClass.BENIGN,
        confidence: data.confidence,
        explanation: data.explanation
    };
};
