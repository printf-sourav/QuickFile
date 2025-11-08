import cron from 'node-cron'
import { File } from '../models/file.model.js'
import { deleteFromSupabase } from '../utils/superbase.js'

const startCleanupJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const expiredFiles = await File.find({ expiresAt: { $lte: new Date() } })
      if (!expiredFiles || expiredFiles.length === 0) return
      for (const file of expiredFiles) {
        try {
          if (file.provider === 'supabase' && file.bucket && file.storagePath) {
            await deleteFromSupabase(file.bucket, [file.storagePath])
            console.log('cleanup:storageRemoved', file.storagePath)
          }
        } catch (err) {
          console.error('cleanup:storageRemove', err?.message || err)
        }
        try {
          await File.findByIdAndDelete(file._id)
          console.log('cleanup:deleted', file.filename || file._id)
        } catch (err) {
          console.error('cleanup:delete', err?.message || err)
        }
      }
    } catch (err) {
      console.error('cleanup:job', err?.message || err)
    }
  })
}

export { startCleanupJob }
