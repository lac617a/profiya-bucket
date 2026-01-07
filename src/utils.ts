import type {Readable} from "stream";

/**
 * Convierte un stream a buffer
 */
export async function streamToBuffer(stream: Readable): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
		stream.on("error", reject);
		stream.on("end", () => resolve(Buffer.concat(chunks)));
	});
}

/**
 * Sanitiza un nombre de archivo
 */
export function sanitizeFileName(fileName: string): string {
	return fileName
		.replace(/[^a-zA-Z0-9.-]/g, "_")
		.replace(/_+/g, "_")
		.toLowerCase();
}

/**
 * Genera un nombre de archivo único
 */
export function generateUniqueFileName(originalName: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const safeName = sanitizeFileName(originalName);
	const nameParts = safeName.split(".");
	const ext = nameParts.length > 1 ? nameParts.pop() : "";
	const name = nameParts.join(".");

	return ext
		? `${name}-${timestamp}-${random}.${ext}`
		: `${name}-${timestamp}-${random}`;
}

/**
 * Valida el tipo MIME de un archivo
 */
export function validateMimeType(
	mimeType: string,
	allowedTypes: string[]
): boolean {
	return allowedTypes.includes(mimeType);
}

/**
 * Valida el tamaño de un archivo
 */
export function validateFileSize(size: number, maxSize: number): boolean {
	return size <= maxSize;
}

/**
 * Convierte bytes a formato legible
 */
export function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Extrae la extensión de un archivo
 */
export function getFileExtension(fileName: string): string {
	return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Valida si un archivo es una imagen
 */
export function isImage(mimeType: string): boolean {
	return mimeType.startsWith("image/");
}

/**
 * Valida si un archivo es un documento
 */
export function isDocument(mimeType: string): boolean {
	const documentTypes = [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"text/plain",
	];
	return documentTypes.includes(mimeType);
}
