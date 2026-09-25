/** Lato massimo delle foto delle ricette: basta per lo schermo e per le stampe. */
export const MAX_LATO_FOTO = 1600;

/**
 * Riduce una foto (PNG o JPEG) a {@link MAX_LATO_FOTO} px sul lato lungo prima dell'upload:
 * le foto del telefono pesano diversi MB e viaggiano in base64 dentro un JSON. Il formato
 * resta lo stesso (il PNG conserva la trasparenza). Se il browser non ci riesce, o la foto
 * è già piccola, restituisce il file originale.
 */
export async function ridimensionaFoto(file: File, maxLato = MAX_LATO_FOTO): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scala = Math.min(1, maxLato / Math.max(bitmap.width, bitmap.height));
    if (scala === 1 && file.size <= 1024 * 1024) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scala);
    canvas.height = Math.round(bitmap.height * scala);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const tipo = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const ridotta = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, tipo, 0.85));
    return ridotta && ridotta.size < file.size ? ridotta : file;
  } catch {
    return file;
  }
}
