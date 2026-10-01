export async function withTruncatedSyncAccess(handle, run) {
  const access = await handle.createSyncAccessHandle();
  try {
    access.truncate(0);
    return await run(access);
  } finally {
    access.close();
  }
}
