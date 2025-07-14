import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("es-ES", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

export async function toWebpBase64(
  file: File,
  size = 400, // Puedes cambiar a 500 si prefieres más grande
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Crear canvas cuadrado
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }

        // Calcular escala y posición para centrar la imagen
        const scale = Math.min(size / img.width, size / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        const x = (size - newWidth) / 2;
        const y = (size - newHeight) / 2;

        // Fondo blanco (opcional, puedes cambiar a transparente si prefieres)
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);

        // Dibujar la imagen centrada
        ctx.drawImage(img, x, y, newWidth, newHeight);

        // Convertir a WebP y extraer base64 puro
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al convertir la imagen a WebP'));
              return;
            }
            const reader2 = new FileReader();
            reader2.onloadend = () => {
              const base64data = reader2.result as string;
              resolve(base64data.split(',')[1]); // Solo base64 puro
            };
            reader2.onerror = () => reject(new Error('Error al leer el blob'));
            reader2.readAsDataURL(blob);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
} 