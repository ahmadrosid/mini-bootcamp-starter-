"use client";

import { UploadButton } from "~/utils/uploadthing";
import { api } from "~/trpc/react";
import { Pages } from "./Pages";

export function Documents() {
    const { data: documents, refetch: refetchDocuments }
        = api.document.getAll.useQuery();

    const createDocument = api.document.create.useMutation({
        onSuccess: async () => {
            console.log("Document created successfully");
            await refetchDocuments();
        },
        onError: (error) => {
            console.error("Error creating document:", error);
        }
    });

    const deleteDocument = api.document.delete.useMutation({
        onSuccess: async () => {
            console.log("Document deleted successfully");
            await refetchDocuments();
        },
        onError: (error) => {
            console.error("Error deleting document:", error);
        }
    });

    return (
        <div>
            <UploadButton
                endpoint="pdfUploader"
                onClientUploadComplete={async (res) => {
                    if (!res?.[0]) return;
                    console.log(res[0]);
                    await createDocument.mutateAsync({
                        fileUrl: res[0].url,
                        name: res[0].name,
                    });
                }}
                onUploadError={(error: Error) => {
                    console.error(error.message);
                }}
                appearance={{
                    button:
                        "ut-ready:bg-green-500 ut-uploading:cursor-not-allowed bg-fuchsia-500 bg-none after:bg-fuchsia-400",
                    container: "w-max flex-row mx-auto",
                    allowedContent:
                        "flex h-8 flex-col items-center justify-center px-2 text-white",
                }}
            />

            {documents?.map((document) => (
                <div className="text-white p-4 border rounded-xl bg-white/5" key={document.id}>
                    <div className="flex justify-between items-center">
                        <p>{document.name}</p>
                        <button
                            onClick={() => deleteDocument.mutate({ id: document.id })}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            disabled={deleteDocument.isPending}
                        >
                            {deleteDocument.isPending ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                    <Pages
                        documentId={document.id}
                        pages={document.pages}
                        refetchDocuments={refetchDocuments}
                        voice={"e1QlSdXpS6HwesZvYHND"}
                    />
                </div>
            ))}

        </div>
    );
}