export function getDirectImageUrl(url: string | undefined): string {
    if (!url) return "";

    // Remove any accidental whitespace
    const cleanUrl = url.trim();

    // Handle Google Drive links
    if (cleanUrl.includes("drive.google.com") || cleanUrl.includes("docs.google.com")) {
        let fileId = "";
        
        // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
        const fileDMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileDMatch) {
            fileId = fileDMatch[1];
        } 
        // Pattern 2: https://drive.google.com/open?id=FILE_ID or similar
        else {
            const idParamMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (idParamMatch) {
                fileId = idParamMatch[1];
            }
        }

        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
    }

    // Handle Dropbox (replace dl=0 with dl=1 or raw=1)
    if (cleanUrl.includes("dropbox.com")) {
        return cleanUrl.replace("dl=0", "raw=1");
    }

    return cleanUrl;
}
