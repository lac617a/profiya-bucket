# @profiya/bucket

Librería ligera y moderna para manejar **Cloudflare R2** usando AWS SDK v3.

## 📦 Instalación

```bash
npm install @profiya/bucket @aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner
```

## 🚀 Uso Rápido

```typescript
import { Bucket, S3Client } from '@profiya/bucket';

const S3 = new S3Client({
  endpoint: "Your endpoint",
  credentials: {
    accessKeyId: "Your accessKeyId",
    secretAccessKey: "Your secretAccessKey",
  },
});

// Inicializar bucket
const bucket = new Bucket(S3, "bucket", "endpoint");

// Configurar URL pública (opcional)
bucket.provideBucketPublicUrl('https://cdn.midominio.com');

// Subir archivo
const result = await bucket.upload(
  fileBuffer,
  'carpeta/archivo.pdf',
  'application/pdf',
  { userId: '123' }
);

console.log(result.publicUrl);
// https://cdn.midominio.com/carpeta/archivo.pdf
```

## 📖 Ejemplos

### Subir desde Node.js

```typescript
import { readFileSync } from 'fs';
import { Bucket, S3Client } from '@profiya/bucket';

const S3 = new S3Client({
  endpoint: "Your endpoint",
  credentials: {
    accessKeyId: "Your accessKeyId",
    secretAccessKey: "Your secretAccessKey",
  },
});

// Inicializar bucket
const bucket = new Bucket(S3, "bucket", "endpoint");

const file = readFileSync('./documento.pdf');

const result = await bucket.upload(
  file,
  'documentos/documento.pdf',
  'application/pdf'
);

console.log('Subido:', result.objectKey);
```

### Subir desde Express

```typescript
import express from 'express';
import multer from 'multer';
import { Bucket, S3Client } from '@profiya/bucket';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const S3 = new S3Client({
  endpoint: "Your endpoint",
  credentials: {
    accessKeyId: "Your accessKeyId",
    secretAccessKey: "Your secretAccessKey",
  },
});

// Inicializar bucket
const bucket = new Bucket(S3, "bucket", "endpoint");

app.post('/upload', upload.single('file'), async (req, res) => {
  const result = await bucket.upload(
    req.file!.buffer,
    `uploads/${Date.now()}-${req.file!.originalname}`,
    req.file!.mimetype
  );
  
  res.json({ url: result.publicUrl });
});
```

### Descargar archivo

```typescript
const object = await bucket.getObject('archivo.pdf');

// Node.js - guardar a disco
import { createWriteStream } from 'fs';
const writeStream = createWriteStream('./descargado.pdf');
object.Body.pipe(writeStream);

// Express - enviar al cliente
app.get('/download/:key', async (req, res) => {
  const object = await bucket.getObject(req.params.key);
  res.set('Content-Type', object.ContentType!);
  object.Body.pipe(res);
});
```

### URL Firmada (Signed URL)

```typescript
// Generar URL temporal (1 hora)
const url = await bucket.getObjectSignedUrl('private/documento.pdf', 3600);

console.log(url);
// https://account.r2.cloudflarestorage.com/bucket/private/documento.pdf?X-Amz-...

// Esta URL es válida por 3600 segundos (1 hora)
// Después de eso, expira automáticamente
```

### Listar archivos

```typescript
const result = await bucket.listObjects(100);

for (const obj of result.objects) {
  console.log(`${obj.key} - ${obj.size} bytes`);
}

// Paginación
if (result.isTruncated) {
  const nextPage = await bucket.listObjects(100, result.nextContinuationToken);
}
```

### Eliminar archivos

```typescript
// Eliminar uno
await bucket.deleteObject('archivo-viejo.pdf');

// Eliminar múltiples
await bucket.deleteObjects([
  'temp/file1.pdf',
  'temp/file2.pdf',
  'temp/file3.pdf'
]);
```

### Copiar archivo

```typescript
await bucket.copyObject(
  'original/documento.pdf',
  'backup/documento-copia.pdf'
);
```

### Verificar existencia

```typescript
const exists = await bucket.objectExists('archivo.pdf');

if (exists) {
  console.log('El archivo existe');
} else {
  console.log('Archivo no encontrado');
}
```

### Métodos

#### `upload(contents, destination, mimeType?, metadata?)`
Sube un archivo.

**Parámetros:**
- `contents`: `Buffer | Uint8Array | string | Readable`
- `destination`: `string` - Ruta en el bucket
- `mimeType?`: `string` - Tipo MIME
- `metadata?`: `Record<string, string>` - Metadata personalizada

**Retorna:** `Promise<UploadFileResponse>`

#### `uploadStream(contents, destination, mimeType?, metadata?, onProgress?)`
Sube con multipart upload y progreso.

**Retorna:** Objeto con `Body` (stream), `ContentType`, `ContentLength`, etc.

#### `deleteObject(objectKey)`
Elimina un objeto.

#### `headObject(objectKey)`
Obtiene metadata sin descargar.

#### `listObjects(maxResults?, continuationToken?)`
Lista objetos con paginación.

#### `copyObject(sourceKey, destinationKey)`
Copia un objeto.

#### `objectExists(objectKey)`
Verifica si existe.

#### `getObjectSignedUrl(objectKey, expiresIn)`
Genera URL firmada para GET.

#### `putObjectSignedUrl(objectKey, expiresIn)`
Genera URL firmada para PUT.

#### `provideBucketPublicUrl(url)`
Configura URL pública.

#### `getPublicUrls()`
Obtiene URLs públicas configuradas.

#### `getObjectPublicUrls(objectKey)`
Obtiene URLs públicas de un objeto.

#### `getCorsPolicies()`
Obtiene políticas CORS del bucket.

## 🔧 Utilidades

```typescript
import { 
  sanitizeFileName,
  generateUniqueFileName,
  validateMimeType,
  validateFileSize,
  formatBytes,
  getFileExtension,
  isImage,
  isDocument
} from '@profiya/bucket';

// Generar nombre único
const uniqueName = generateUniqueFileName('mi-archivo.pdf');
// mi-archivo-1704123456789-abc123.pdf

// Formatear bytes
formatBytes(1024000);
// "1000 KB"

// Validar tipo
validateMimeType('image/jpeg', ['image/jpeg', 'image/png']);
// true

// Validar tamaño (max 10MB)
validateFileSize(fileSize, 10 * 1024 * 1024);
// true/false
```

Usa con `dotenv`:

```typescript
import 'dotenv/config';
import { Bucket, S3Client } from '@profiya/bucket';

const S3 = new S3Client({
  endpoint: "Your endpoint",
  credentials: {
    accessKeyId: "Your accessKeyId",
    secretAccessKey: "Your secretAccessKey",
  },
});

const bucket = new Bucket(S3, "bucket", "endpoint");
```

## 📝 TypeScript

La librería incluye tipos completos:

```typescript
import type {
  Bucket,
  BucketConfig,
  UploadFileResponse,
  HeadObjectResponse,
  ObjectListResponse,
  CORSPolicy
} from '@profiya/bucket';
```

## 🏗️ Build

```bash
# Desarrollo (watch mode)
npm run dev

# Build de producción
npm run build

# Los archivos generados estarán en ./dist/
# - index.mjs (ESM)
# - index.cjs (CommonJS)
# - index.umd.js (UMD)
# - index.d.ts (TypeScript types)
```

## 📦 Formatos disponibles

```javascript
// ESM (import)
import { Bucket } from '@profiya/bucket';

// CommonJS (require)
const { Bucket } = require('@profiya/bucket');

// UMD (navegador)
<script src="https://unpkg.com/@profiya/bucket"></script>
<script>
  const bucket = new R2Bucket.Bucket({...});
</script>
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea tu rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -am 'Agrega nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

## 📄 Licencia

MIT
