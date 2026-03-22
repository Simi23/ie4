export default defineEventHandler(async (event) => {
  const media = event.context.params?.all;
  const storage = useStorage("teamlogo");

  // Check if input was given
  if (!media) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "file-not-found",
    });
  }

  // Check if file exists
  const exists = await storage.hasItem(media);
  if (!exists) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "file-not-found",
    });
  }

  // Serve file content
  return serveStatic(event, {
    getContents: () => storage.getItemRaw(media),
    getMeta: () => storage.getMeta(media),
  });
});
