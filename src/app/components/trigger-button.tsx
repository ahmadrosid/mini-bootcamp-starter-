"use client";
import { api } from "~/trpc/react";

export default function TriggerButton() {
    const { refetch: refetchDocuments } = api.document.getAll.useQuery(undefined, {
        enabled: false, // This prevents the query from running on mount
    });

    const triggerEvent = async () => {
        const result = await refetchDocuments();
        console.log(result.data);
    };

    return (
        <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
            onClick={triggerEvent}
        >
            Trigger Event
        </button>
    );
}