/**
 * Converts common cloud storage share links (specifically Google Drive) 
 * into direct viewable image URLs that can be used in browser <img> tags.
 */
export function getDirectImageUrl(url: string | undefined): string {
    if (!url) return "";

    // Handle Google Drive links
    if (url.includes("drive.google.com")) {
        let fileId = "";
        
        // Pattern 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
        if (url.includes("/file/d/")) {
            fileId = url.split("/file/d/")[1].split("/")[0].split("?")[0];
        } 
        // Pattern 2: https://drive.google.com/open?id=FILE_ID
        else if (url.includes("id=")) {
            const urlParams = new URL(url).searchParams;
            fileId = urlParams.get("id") || "";
        }

        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
    }

    // Handle Dropbox (replace dl=0 with dl=1 or raw=1)
    if (url.includes("dropbox.com")) {
        return url.replace("dl=0", "raw=1");
    }

    return url;
}
